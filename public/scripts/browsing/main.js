'use strict';

let noteDiv;
let markBtn;
let mark_deleteBtn;
let commentBtn;
let noteControlBtn;
let report;

let noteForDoc;
let noteForPage;

//DOMContentLoaded... 最初のHTMLドキュメントの読み込みが終わると起動
document.addEventListener('DOMContentLoaded', BrowMainListener);

//スマホ用
function setPhoneScale(scale){
  ownFunction.setPhoneScale(scale);
}

//ブラウジングモードで使うイベントリスナー
function BrowMainListener() {
  log(url, inputPageNum.value, Log.Start);

  noteDiv = document.getElementById('note_div');
  markBtn = document.getElementById('mark');
  mark_deleteBtn = document.getElementById('mark_delete');
  commentBtn = document.getElementById('comment');
  noteControlBtn = document.getElementById('visibility');
  report = document.getElementById('report');
  noteForDoc = document.getElementById('note_doc');
  noteForPage = document.getElementById('note_page');

  //PDFの文字をクリックした時のイベント
  pdfViewer.addEventListener('click', () => {
    //getSelection... ユーザー選択した文字列、現在位置を示す　Selectionオブジェクトを返す
    //セレクションの開始と終了が同じ位置か否かを調べる。trueだと選択してないって事
    if (!window.getSelection().isCollapsed) {
      markBtn.disabled = false;
      commentBtn.disabled = false;
    } else {
      markBtn.disabled = true;
      commentBtn.disabled = true;
    }
  });

  //マークボタン（下線を引くやつ）を押した時に動作する関数
  //authoringのメインに解説書いてある
  markBtn.addEventListener('click', () => {
    let mark = getMarkRect();
    if (!mark) return;
    ownFunction.renderMark(mark, inputScale.value);
    ownFunction.sendMark(mark);
    markBtn.disabled = true;
    commentBtn.disabled = false;
    log(url, inputPageNum.value, Log.Mark);
  });

  //コメントボタンを押した時の動き
  commentBtn.addEventListener('click', () => {
    //基本は同じ。座標がないぐらいか
    let mark = getMarkRect();
    if (!mark) return;

    ownFunction.renderComment(mark, '');

    markBtn.disabled = true;
    commentBtn.disabled = true;

    log(url, inputPageNum.value, Log.CreateComment);
  });

  //ノートに何かを書いた時の動き。値を送ってる
  noteForDoc.addEventListener('click', () => {
    ownFunction.sendNoteDoc(document.getElementById("note_for_doc").value);
    document.getElementById("note_for_doc").value = "";
    log(url, inputPageNum.value, Log.dNote);
  });

  //上と一緒
  noteForPage.addEventListener('click', () => {
    ownFunction.sendNotePage(document.getElementById("note_for_page").value);
    document.getElementById("note_for_page").value = "";
    log(url, inputPageNum.value, Log.pNote);
  });

  // 学習行動ログ取得関連Listenerの設定
  //これは画面復帰したとき
  window.addEventListener('focus', () => {
    log(url, inputPageNum.value, Log.Enter);
  });
  //これは画面から外れたとき
  window.addEventListener('blur', () => {
    log(url, inputPageNum.value, Log.Leave);
  });
  window.addEventListener('keyup', () => {
    op_count.key++;
  });
  window.addEventListener('mouseup', () => {
    op_count.mouseup++;
  });
  window.addEventListener('beforeunload', () => {
    log(url, inputPageNum.value, Log.End);
    ownFunction.closePage();
  });
}
