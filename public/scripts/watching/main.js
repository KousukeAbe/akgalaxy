'use strict';

let currentPageNum;
let url;
let scale ;

let viewerContainer;
let wrapper;
let pdfviewer;
let fileNameLabel;

let prevBtn;
let nextBtn;
let page_num;

let ownFunction;
let heatmap;

//DOMContentLoaded... 最初のHTMLドキュメントの読み込みが終わると起動
document.addEventListener('DOMContentLoaded', BaseMainListener);

function BaseMainListener() {
  currentPageNum = 1;
  url = "/documents/" + window.sessionStorage.getItem("url");;
  scale = 1.0;

  viewerContainer = document.getElementById('viewer_container');
  wrapper = document.getElementById('wrapper');
  pdfviewer = document.getElementById('pdf_viewer');
  fileNameLabel = document.getElementById('file_name');

  prevBtn = document.getElementById('prev');
  nextBtn = document.getElementById('next');

  page_num = document.getElementById('page_num');
  page_num.innerText = 1;
  ownFunction = new OwnFunction(url, scale, viewerContainer, wrapper, pdfviewer);
  window.addEventListener('keydown', keyboardListener);

  //左上のラベル
  fileNameLabel.innerText = `ファイル名:  ${url}`;

  Rendaring();
  BtnListener();
  update_heatmap();
}

//ヒートマップの更新。なぜココに？
function update_heatmap(){
  window.clearTimeout(heatmap);
  let requestUrl = '/api/getheatmap';
  let params = {
    url: url,
    num: currentPageNum
  };
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    console.log(response.body[0]);
    if(response.body[0] == null){
      document.getElementById('heat_per').innerText = "0%";
      document.getElementById('heat_bar').value = 0;
      return;
    }
    let sum = 0;
    let hensa = response.body.pop();
    for(let target of response.body[0]){
      sum += target.count_key + target.count_mouseup;
    };
    sum = sum / response.body.length;
    let total = (sum - hensa[0].avg) * 10 / hensa[0].hensa;

    let per;
    if(total <= 0){
      per = 0;
      document.getElementById('heat_per').innerText = "0%";
      document.getElementById('heat_bar').value = 0;
    }else{
      per = Math.floor(total * Math.pow(10, 1)) / Math.pow(10, 1);
      document.getElementById('heat_per').innerText = per + "%";
      document.getElementById('heat_bar').value = total;
    }

    let requestUrl = '/api/sendheatmap';
    let params = {
      url: url,
      per: per
    };
    window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {});
  }).catch((error) => {
    throw error;
  });
  heatmap = setTimeout(update_heatmap, 60000);
}

  function Rendaring() {
    ownFunction.renderGetPdf(currentPageNum, () => {
      //空欄を持ってきている
      ownFunction.renderSpaces(currentPageNum);
      let loading = document.getElementById('loading');
      loading.parentNode.removeChild(loading);
    });
  }

  function BtnListener(){
    /* ボタンクリックなどのイベントの設定 */
    viewerContainer.addEventListener('click', () =>{
      let socket = ownFunction.getsocket();
      socket.emit('slidenext', {});
      ownFunction.nextslide(() =>{
        ownFunction.renderPage(++currentPageNum, () => {
          ownFunction.renderSpaces(currentPageNum);
        });
      });
    });

    prevBtn.addEventListener('click', () =>{
      let socket = ownFunction.getsocket();
      socket.emit('slideback', {});
      ownFunction.backslide(() =>{
        ownFunction.renderPage(--currentPageNum, () => {
          ownFunction.renderSpaces(currentPageNum);
        });
      });
    });
    nextBtn.addEventListener('click',() =>{
      let socket = ownFunction.getsocket();
      socket.emit('slidenext', {});
      ownFunction.nextslide(() =>{
        ownFunction.renderPage(++currentPageNum, () => {
          ownFunction.renderSpaces(currentPageNum);
        });
      });
    });

    //ウィンドウがリサイズされたらそれに合わせる
    window.addEventListener('resize', () => {
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });
  }

  function keyboardListener (e) {
    let code = e.keyCode;
    let activeTagName = document.activeElement.tagName;
    let socket = ownFunction.getsocket();

    // テキスト入力中は弾く
    if (activeTagName === "INPUT" || activeTagName === "TEXTAREA") return;
    if (code === 37 || code === 38 || code === 8) { // ← ↑ Backspace
      socket.emit('slideback', {});
      ownFunction.backslide(() =>{
        ownFunction.renderPage(--currentPageNum, () => {
          ownFunction.renderSpaces(currentPageNum);
        });
      });
    } else if (code === 39 || code === 40 || code === 13) { // → ↓ Enter
      socket.emit('slidenext', {});
      ownFunction.nextslide(() =>{
        ownFunction.renderPage(++currentPageNum, () => {
          ownFunction.renderSpaces(currentPageNum);
        });
      });
    }
  }
