'use strict';

class Mark {
  constructor (url, noteLayerCanvas) {
    this.url = url;
    this.noteLayerCanvas = noteLayerCanvas;
    this.marks = [];
    this.superagent = window.superagent;
  }

  renderMark (rect, scale) {
    let noteLayerCanvas = document.getElementById('note_layer_canvas');
    let context = noteLayerCanvas.getContext('2d');
    let rectSize = {
      x: rect.left,
      y: rect.top + 4,
      w: rect.width + 6,
      h: rect.height
    };
    this.store(rectSize);
	  context.clearRect(rectSize.x * scale, rectSize.y * scale, rectSize.w * scale, rectSize.h * scale); // 矩形を描画
    context.fillStyle = 'rgb(255, 0, 0)'; // 塗りつぶす色(赤)を指定
    context.globalAlpha = 0.2;
    context.fillRect(rectSize.x * scale, rectSize.y * scale, rectSize.w * scale, rectSize.h * scale); // 矩形を描画
  }

  RerenderMark () {
    let scale = (inputScale.value / 100);
    let noteLayerCanvas = document.getElementById('note_layer_canvas');
    let inputDiv = document.getElementById('input_div');

    let context = noteLayerCanvas.getContext('2d');
    let spaceRects = this.marks.filter(rects => {
      if(rects.student_number ==  document.getElementById('student_number').innerText){
        return currentPageNum === parseInt(rects.page_num);
      }else{
        return false;
      }
    });

    for (let spaceRect of spaceRects) {
      context.clearRect(spaceRect.rect.x, spaceRect.rect.y, spaceRect.rect.w, spaceRect.rect.h); // 矩形を描画
      context.fillStyle = 'rgb(255, 0, 0)'; // 塗りつぶす色(赤)を指定
      context.globalAlpha = 0.2;
      context.fillRect(spaceRect.rect.x * scale, spaceRect.rect.y * scale, spaceRect.rect.w * scale, spaceRect.rect.h * scale); // 矩形を描画
      let removeKnob = document.createElement('div');

      removeKnob.className = 'remove_knob';
      removeKnob.id = spaceRect.id;
      removeKnob.style.top = `${spaceRect.rect.y * scale - 15}px`;
      if(spaceRect.rect.x < 0){
        removeKnob.style.left = '0px';
      }else{
        removeKnob.style.left = `${spaceRect.rect.x * scale}px`;
      }
      inputDiv.appendChild(removeKnob);
      removeKnob.addEventListener('click', (e) => {
        this.deleteMark(e, spaceRect.rect);
      }, false);
    }
  }

  deleteMark (e, spaceRect) {
    let requestUrl = '/api/removeMark';
    let params = {
      id: e.target.id
    };
    this.superagent.post(requestUrl).send(params).set('Accept', 'application/json')
    .then(() => {
      for(let i = 0; i < this.marks.length; i++){
        if(this.marks[i].id == e.target.id){
          this.marks.splice(i, 1);
          break;
        }
      }

      let noteLayerCanvas = document.getElementById('note_layer_canvas');
      let context = noteLayerCanvas.getContext('2d');
      let scale = (inputScale.value / 100);

      e.target.parentNode.removeChild(e.target);
      context.clearRect(spaceRect.x * scale, spaceRect.y * scale -2, spaceRect.w * scale, spaceRect.h * scale + 2); // 矩形を描画
    }).catch((error) => {
      throw error;
    });
  }

  //下線の登録
  store (rect) {
    let requestUrl = '/api/storeMark';
    let params = {
      url: this.url,
      num: inputPageNum.value,
      rect: rect,
      student_number: document.getElementById('student_number').innerText
    };

    this.superagent.post(requestUrl).send(params).set('Accept', 'application/json')
    .then((response) => {
      let scale = (inputScale.value / 100);
      let inputDiv = document.getElementById('input_div');
      let removeKnob = document.createElement('div');
      removeKnob.className = 'remove_knob';
      removeKnob.id = response.body[0].id;
      removeKnob.style.top = `${rect.y * scale - 15}px`;
      if(rect.x < 0){
        removeKnob.style.left = '0px';
      }else{
        removeKnob.style.left = `${rect.x * scale}px`;
      }

      inputDiv.appendChild(removeKnob);
      removeKnob.addEventListener('click', (e) => {
        this.deleteMark(e, rect);
      }, false);

      this.marks.push({id: removeKnob.id, url: this.url, page_num: inputPageNum.value, rect: rect, student_number: document.getElementById('student_number').innerText});
    }).catch((error) => {
      throw error;
    });
  }

  getMark() {
  	let requestUrl = '/api/loadMark';
  	let params = {url: this.url};
  	window.superagent.get(requestUrl).query(params)
  	.set('Accept', 'application/json')
  	.then((response) => {
  		if(response.text == "")return;
  	  let parse = JSON.parse(response.text);
  		this.marks = [];
  		for (let i = 0; i < parse.length; ++i) {
  			this.marks.push(parse[i]);
  		}
  		this.RerenderMark();
  	}).catch((error) => {
  		throw error;
  	});
  }
}
