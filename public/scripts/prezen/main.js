'use strict';

let currentPageNum;
let url;
let scale ;

let viewerContainer;
let wrapper;
let pdfviewer;
let ownFunction;

let socket;
//DOMContentLoaded... 最初のHTMLドキュメントの読み込みが終わると起動
document.addEventListener('DOMContentLoaded', BaseMainListener);

function BaseMainListener() {
  window.open("./watching","","");
  currentPageNum = 1;
  url = "/documents/" + window.sessionStorage.getItem("url");;
  scale = 1;

  viewerContainer = document.getElementById('viewer_container');
  wrapper = document.getElementById('wrapper');
  pdfviewer = document.getElementById('pdf_viewer');

  ownFunction = new OwnFunction(url, scale, viewerContainer, wrapper, pdfviewer);
  window.addEventListener('keydown', keyboardListener);

  Rendaring();
  BtnListener();

  // ソケット接続
  socket = io('192.168.2.76:8001').connect();
  socket.on(`slidechange`, () => {
    ownFunction.nextslide(() =>{
      ownFunction.renderPage(++currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });
  });

  socket.on(`slideback`, () => {
    ownFunction.backslide(() =>{
      ownFunction.renderPage(--currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });
  });

  window.addEventListener('resize', () => {
    ownFunction.renderPage(currentPageNum, () => {
      ownFunction.renderSpaces(currentPageNum);
    });
  });
}

function Rendaring() {
  ownFunction.renderGetPdf(currentPageNum, () => {
    //空欄を持ってきている
    ownFunction.renderSpaces(currentPageNum);
  });
}

function BtnListener(){
  viewerContainer.addEventListener('click', () =>{
    socket.emit('slidenext', {});
    ownFunction.nextslide(() =>{
      ownFunction.renderPage(++currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });
  });
}

  function movePage (pageNum) {
    const count = parseInt(pageCount.innerText);
    if (pageNum <= 0 || pageNum > count || pageNum === currentPageNum) return;
    ownFunction.renderPage(pageNum, () => {
      ownFunction.renderSpaces(pageNum);
    });
    currentPageNum = pageNum;
    inputPageNum.value = pageNum;
    btnControl(currentPageNum);
  }

  function keyboardListener (e) {
    let code = e.keyCode;
    let activeTagName = document.activeElement.tagName;
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
