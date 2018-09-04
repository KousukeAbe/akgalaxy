'use strict';

/* Authoring */

class BlankModel extends BaseBlankModel {
  constructor (pdfUrl, pdfDoc, scale) {
    super(pdfUrl);

    this.pdfDoc = pdfDoc;
    this.scale = scale;
    this.superagent = window.superagent;
    this.prezen = [];
    this.prezennow = [];
    this.num = 1;
  }

  // そのページの全ての空欄を描画
  render (currentPageNum, scale) {
    this.scale = scale;

    let spaceRects = this.spaces.filter(rects => {
      return currentPageNum === parseInt(rects.page_num);
    });
    for (let spaceRect of spaceRects) {
      this.renderSpace(spaceRect.id, spaceRect.rect, spaceRect.rect.text);
    }
  }

  // 渡された空欄ひとつを描画
  renderSpace (id, rect, text) {
    let scale = this.scale;
    let renderTarget = document.getElementById(`pdf_viewer`).firstElementChild;
    let div = document.createElement('div');

    let textbox = this._createSpace(rect, text, scale, id);
    div.appendChild(textbox);
    renderTarget.appendChild(div);
  }

  //空欄スペースの作成
  _createSpace (rect, text, scale, id) {
    let textbox = document.createElement('input');
    let textboxStyle = textbox.style;

    textbox.className = 'space';
    textbox.id = id;
    textbox.type = 'text';

    textboxStyle.top = `${rect.top * scale}px`;
    textboxStyle.left = `${rect.left * scale}px`;
    textboxStyle.width = `${(rect.right - rect.left) * scale + 6}px`;
    textboxStyle.height = `${(rect.bottom - rect.top) * scale}px`;

    textbox.readOnly = true;
    textboxStyle.display = 'block';
    return textbox;
  }

  getprezen(pageNum, completion) {
    this.prezen = [];
    this.prezennow = [];
    let requestUrl = '/api/getprezen';
    let params = {
      url: this.url,
      num: pageNum
    };
    this.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
      this.num = pageNum;
      if(response.body.length > 0)this.prezen = response.body[0].slide.split(',');
      for(let i = 0; i < this.prezen.length; i++ ){
				this.prezen[i] = parseInt(this.prezen[i]);
				this.prezennow[i] = parseInt(this.prezen[i]);
			}
      completion();
    }).catch((error) => {
      throw error;
    });
  }

  nextslide(completion){
    if(this.prezennow.length <= 0){
      completion();
      return;
    }
    let target = this.prezennow.shift();
    document.getElementById(target).parentNode.parentNode.removeChild(document.getElementById(target).parentNode);
  }

  backslide(completion){
    if(this.prezen.length == this.prezennow.length){
      completion();
      return;
    }
    let target = this.prezen[this.prezen.length - this.prezennow.length - 1];
    this.prezennow.unshift(this.prezen[this.prezen.length - this.prezennow.length - 1]);
    let spaceRect = this.spaces.filter(rects => {
      return target === parseInt(rects.id);
    });
    this.renderSpace(spaceRect[0].id, spaceRect[0].rect, spaceRect[0].rect.text);
  }
}
