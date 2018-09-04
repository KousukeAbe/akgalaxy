'use strict';

let currentPageNum;
let url;
let scale ;

let inputScale;
let inputPageNum;
let viewerContainer;
let wrapper;
let pdfviewer;
let fileNameLabel;
let pageCount;
let controllerComponent;

let firstBtn;
let prevBtn;
let nextBtn;
let lastBtn;

let pdfViewer;
let widthBtn;
let heightBtn;

let ownFunction;

//DOMContentLoaded... 最初のHTMLドキュメントの読み込みが終わると起動
document.addEventListener('DOMContentLoaded', BaseMainListener);

function BaseMainListener() {
  currentPageNum = 1;
  url = "/documents/" + window.sessionStorage.getItem("url");;
  scale = 1.0;

  inputScale = document.getElementById('scale');
  inputPageNum = document.getElementById('page_num');
  viewerContainer = document.getElementById('viewer_container');
  wrapper = document.getElementById('wrapper');
  pdfviewer = document.getElementById('pdf_viewer');
  fileNameLabel = document.getElementById('file_name');
  pageCount = document.getElementById('page_count');
  controllerComponent = document.getElementsByClassName('controller_component')[0];

  firstBtn = document.getElementById('first');
  prevBtn = document.getElementById('prev');
  nextBtn = document.getElementById('next');
  lastBtn = document.getElementById('last');

  pdfViewer = document.getElementById('pdf_viewer');
  widthBtn = document.getElementById('width');
  heightBtn = document.getElementById('height');

  ownFunction = new OwnFunction(url, scale, viewerContainer, wrapper, pdfviewer);

  //左上のラベル
  fileNameLabel.innerText = `ファイル名:  ${url}`;
  //ページ数の設定
  inputPageNum.value = currentPageNum;
  //倍率
  inputScale.value = Math.floor(scale * 100);

  Rendaring();
  BtnListener();
}

  function Rendaring() {
    ownFunction.renderGetPdf(currentPageNum, () => {
      //空欄を持ってきている
      ownFunction.renderSpaces(currentPageNum);

      let loading = document.getElementById('loading');
      loading.parentNode.removeChild(loading);
      btnControl(currentPageNum);
    });
  }

  function BtnListener(){
    /* ボタンクリックなどのイベントの設定 */
    firstBtn.addEventListener('click', movePageBtnClickListener);
    prevBtn.addEventListener('click', movePageBtnClickListener);
    nextBtn.addEventListener('click', movePageBtnClickListener);
    lastBtn.addEventListener('click', movePageBtnClickListener);

    //横幅のボタンを押した時の動き
    widthBtn.addEventListener('click', e => {
      // let widthScale = window.innerWidth / pdfViewer.clientWidth;
      // inputScale.value = Math.floor(widthScale * 100);
      inputScale.value = 100;
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });

    //高さボタンを押した時の動き
    heightBtn.addEventListener('click', e => {
      let heightScale = (viewerContainer.clientHeight - document.getElementById("controller_container").clientHeight) / wrapper.clientHeight;
      console.log((viewerContainer.clientHeight - document.getElementById("controller_container").clientHeight) + "    " + wrapper.clientHeight);
      inputScale.value = Math.floor(heightScale * 100);
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });

    //表示倍率の変更
    inputScale.addEventListener('change', e => {
      let scaleInPercent = e.target.value;
      if (scaleInPercent <= 30) scaleInPercent = 30;
        else if (400 <= scaleInPercent) scaleInPercent = 400;
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
      inputScale.value = scaleInPercent;
    });

    //ページ番号を変えると発生
    inputPageNum.addEventListener('change', (e) => {
      if(e.target.value.match(/[^0-9]+/)){
        alert("入力できるのは半角数字のみです");
        e.target.value = currentPageNum;
        return;
      }
      currentPageNum = parseInt(e.target.value);
      //これやればリレンダーできる
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });

    //非常用ボタンか？
    controllerComponent.addEventListener('click', e => {
      console.log('EVENT CANCEL');
      e.stopPropagation();
    });

    //ウィンドウがリサイズされたらそれに合わせる
    window.addEventListener('resize', () => {
      ownFunction.renderPage(currentPageNum, () => {
        ownFunction.renderSpaces(currentPageNum);
      });
    });

    //キーボードでもページ遷移できる
    window.addEventListener('keydown', keyboardListener);
  }

  function movePageBtnClickListener(e) {
    switch (this.id) {
      case 'first':
        currentPageNum = 1;
        break;
      case 'prev':
        currentPageNum -= 1;
        break;
      case 'next':
        currentPageNum += 1;
        break;
      case 'last':
        currentPageNum = ownFunction.getCountPdfPage();
        break;
      default:
        break;
    }
    btnControl(currentPageNum);
    inputPageNum.value = currentPageNum.toString();
    ownFunction.renderPage(currentPageNum, () => {
      ownFunction.renderSpaces(currentPageNum);
    });
  }

  //空欄で隠す作業をする
  function getMarkRect () {
    let mark = {};
    //選択文字を取得
    let selection = window.getSelection();
    // おそらくこれで文字列を取得している
    let range = selection.getRangeAt(0);

    // 選択範囲を覆うことができる矩形を取得できる
    let clientRects = range.getClientRects();
    //要素の絶対座標を取得
    let viewer = document.getElementById('pdf_viewer').getBoundingClientRect();
    let scaleVal = inputScale.value / 100;
    let rects = [];
    //そもそも選択してなければやらなくていい
    if (!selection.anchorNode) return;
    //描画
    for (let i = 0; i < clientRects.length; ++i) {
      if(clientRects[i].width == 0 || clientRects[i].height == 0)continue;
      if(i > 0){
        if(clientRects[i].left == clientRects[i - 1].left && clientRects[i].top == clientRects[i - 1].top)continue;
      }

      let rect = {};
      //x軸
      rect.left = (clientRects[i].left - viewer.left) / scaleVal;
      //y軸
      rect.top = (clientRects[i].top - viewer.top - 5) / scaleVal;
      //幅
      rect.width = clientRects[i].width / scaleVal - 10;
      //高さ
      rect.height = clientRects[i].height / scaleVal;
      rects[i] = rect;
    }
    mark.rects = rects;
    //中身の文字をしっかり表示
    mark.text = selection.toString();
    console.log(mark.text);

    return mark;
  }

  function keyboardListener (e) {
    let code = e.keyCode;
    let activeTagName = document.activeElement.tagName;
    // テキスト入力中は弾く
    if (activeTagName === "INPUT" || activeTagName === "TEXTAREA") return;
    if (e.ctrlKey && (code === 37 || code === 38 || code === 8)) {
      movePage(parseInt(1));
    } else if (e.ctrlKey && (code === 39 || code === 40 || code === 13)) {
      movePage(parseInt(ownFunction.getCountPdfPage()));
    } else if (code === 37 || code === 38 || code === 8) { // ← ↑ Backspace
      movePage(parseInt(currentPageNum -1));
    } else if (code === 39 || code === 40 || code === 13) { // → ↓ Enter
      movePage(parseInt(currentPageNum + 1));
    }
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

  function btnControl () {
    let pageCount = parseInt(document.getElementById('page_count').innerText);
    if (currentPageNum <= 1 || currentPageNum > pageCount) {
      firstBtn.disabled = true;
      prevBtn.disabled = true;
    } else {
      firstBtn.disabled = false;
      prevBtn.disabled = false;
    }
    if (currentPageNum >= pageCount) {
      nextBtn.disabled = true;
      lastBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
      lastBtn.disabled = false;
    }
  }
