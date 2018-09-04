'use strict';

class BlankModel extends BaseBlankModel {
  constructor (pdfUrl, pdfDoc, scale) {
    super(pdfUrl);

    this.pdfDoc = pdfDoc;
    this.scale = scale;
    this.superagent = window.superagent;
    this.prezen = [];
    this.num = 1;
  }

  // そのページの全ての空欄を描画
  render (currentPageNum) {
    let spaceRects = this.spaces.filter(rects => {
      return currentPageNum === parseInt(rects.page_num);
    });
    for (let spaceRect of spaceRects) {
      this.renderSpace(spaceRect.id, spaceRect.rect, spaceRect.rect.text);
    }
    document.getElementById(`page_${currentPageNum}`).style.display = `block`;
  }

  // 渡された空欄ひとつを描画
  renderSpace (id, rect, text) {
    let scale = this.scale = (inputScale.value / 100);
    let renderTarget = document.getElementById(`pdf_viewer`).firstElementChild;
    let div = document.createElement('div');
    text = text.replace(/(\s|　)+/g, "");

    let textbox = this._createSpace(rect, text, scale, id);
    let deleteBtn = this._createDelBtn(id, rect, scale);
    let index = this.prezen.indexOf(id);
    div.appendChild(textbox);
    textbox.parentNode.appendChild(deleteBtn);
    renderTarget.appendChild(div);
    if(index != -1)this._createNumber(rect, scale, id);

    deleteBtn.addEventListener('click', (e) => this.deleteBtnListener(e));
  }

  // 空白のサイズなどを指定。パーツの作成
  createSpace (id, rect, text) {
    let scale = this.scale;
    let renderTarget = document.getElementById(`pdf_viewer`).firstElementChild;
    let div = document.createElement('div');
    text = text.replace(/(\s|　)+/g, "");

    let textbox = this._createSpace(rect, text, scale, id);
    let deleteBtn = this._createDelBtn(id, rect, scale);
    div.appendChild(textbox);
    textbox.parentNode.appendChild(deleteBtn);
    renderTarget.appendChild(div);
    this.prezen.push(parseInt(id));
    this._createNumber(rect, scale,id);
    this.storePrezen();

    deleteBtn.addEventListener('click', (e) => this.deleteBtnListener(e));
  }

  //削除ボタンを押した時の挙動
  deleteBtnListener (e) {
    let space = e.target.parentNode;
    if(this.prezen.indexOf(parseInt(space.firstElementChild.id)) != -1){
      this.prezen.splice(this.prezen.indexOf(parseInt(space.firstElementChild.id)), 1);
      for(let i = 0; i < this.prezen.length; i++){
        document.getElementById(this.prezen[i]).parentNode.lastElementChild.innerText = i + 1;
      }
      this.storePrezen(1);
    };
    space.parentNode.removeChild(space);
    this.deleteSpace(e.target.id);
  }

  //消したことをDBに連絡
  deleteSpace (id) {
    let requestUrl = '/api/deleteBlank';
    let params = { id: id.slice(6) };

    this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then(() => {
      this.load();
    }).catch((error) => {
      throw error;
    });
  }

  //空欄スペースの作成
  _createSpace (rect, text, scale, id) {
    let textbox = document.createElement('input');
    let textboxStyle = textbox.style;

    textbox.className = 'space';
    textbox.id = id;
    textbox.type = 'text';
    textbox.value = text;

    textboxStyle.top = `${rect.top * scale}px`;
    textboxStyle.left = `${rect.left * scale}px`;
    textboxStyle.width = `${(rect.right - rect.left) * scale + 10}px`;
    textboxStyle.height = `${(rect.bottom - rect.top) * scale}px`;
    textboxStyle.fontSize = `${100 - (text.length * 1.5 > 100 ? 100 : text.length * 1.5)}%`;
    textbox.readOnly = true;
    textboxStyle.display = 'block';

    //アニメーション番号の登録。テキストボックスを押した時の挙動
    textbox.addEventListener('click', (e) => {
      let result = this.prezen.filter((val) => {
        return val == e.target.id;
      });
      if(result.length >= 1){
        this._deleteNum(e);
        this.storePrezen();
        return;
      }
      this.prezen.push(parseInt(e.target.id));
      this._createNumber(rect, scale,id);
      this.storePrezen();
    });
    return textbox;
  }

  //削除ボタンを作成
  _createDelBtn (id, rect, scale) {
    let del = document.createElement('div');

    del.className = 'del_space';
    del.innerText = '×';
    del.id = `blank_${id}`;
    del.style.top = `${rect.top * scale - 20}px`;
    del.style.left = `${rect.left * scale}px`;

    return del;
  }

  _deleteNum (e) {
    e.target.parentNode.removeChild(e.target.parentNode.lastElementChild);
    this.prezen.splice(this.prezen.indexOf(parseInt(e.target.id)), 1);
    for(let i = 0; i < this.prezen.length; i++){
      document.getElementById(this.prezen[i]).parentNode.lastElementChild.innerText = i + 1;
    }
  }

  _createNumber (rect, scale, id) {

    let num = document.createElement('div');

    num.className = 'del_space';
    num.innerText = this.prezen.indexOf(id) + 1;
    num.style.top = `${rect.top * scale - 20}px`;
    num.style.left = `${(rect.right) * scale - 20}px`;

    document.getElementById(id).parentNode.appendChild(num);
  }

  //空欄を登録。
  store (rect, text, pageNum, completion) {
    text = text.replace(/(\s|　)+/g, "");
    let requestUrl = '/api/storeBlank';
    let params = {
      url: this.url,
      num: pageNum,
      space: {
        rect: rect,
        text: text
      }
    };
    this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then((response) => {
      let parse = JSON.parse(response.text);
      completion(parse.id);
    }).catch((error) => {
      throw error;
    });
  }

  getprezen(pageNum, completion) {
    let requestUrl = '/api/getprezen';
    let params = {
      url: this.url,
      num: pageNum
    };
    this.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
      this.prezen = [];
      this.num = pageNum;
      if(response.body.length > 0)this.prezen = response.body[0].slide.split(',');
      for(let i = 0; i < this.prezen.length; i++ ){
        this.prezen[i] = parseInt(this.prezen[i]);
      }
      completion();
    }).catch((error) => {
      throw error;
    });
  }

  storePrezen(pagenum){
    let requestUrl = '/api/storePrezen';
    let params = {
      url: this.url,
      num: this.num,
      data: this.prezen
    };
    this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then((response) => {
    }).catch((error) => {
      throw error;
    });
  }

  setPhoneScale(scale){
    this.scale = scale;
  }
}
