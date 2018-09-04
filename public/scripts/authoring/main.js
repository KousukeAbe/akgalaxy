let spaceBtn;

//DOMContentLoaded... 最初のHTMLドキュメントの読み込みが終わると起動
document.addEventListener('DOMContentLoaded', AuthMainListener);

//スマホ用のメソッド
function setPhoneScale(scale){
  ownFunction.setPhoneScale(scale);
}

//オーソリングで使うイベントリスナー達
function AuthMainListener(){
  spaceBtn = document.getElementById('space');
  //表示の設定
  spaceBtn.disabled = true;

  //PDFのところを押した時の動き
  pdfviewer.addEventListener('click', (e) => {
    //文字を選択したら空白ボタンを解放
    spaceBtn.disabled = window.getSelection().isCollapsed;
  });

  //タッチ操作でのイベントリスナー。しっかり動いてくれない
  pdfviewer.addEventListener('touchend',　(e) => {
    spaceBtn.disabled = window.getSelection().isCollapsed;
  });

  //ここはオーサリング特有の機能。空白の部分を作るボタンの動作
  spaceBtn.addEventListener('click', (e) => {
    //空白をゲット
    let space = getMarkRect();
    //なければやらなくていい
    if (!space) return;
    //座標の設定
    let rect = {};
    let rects = space.rects;
    rect.left = rects[0].left;
    rect.top = rects[0].top;
    rect.right = rects[rects.length - 1].left + rects[rects.length - 1].width;
    rect.bottom = rects[rects.length - 1].top + rects[rects.length - 1].height;

    delete space.rects;
    space.rect = rect;
    //登録
    ownFunction.storeSpace(space, (id) => {
      //描画
      ownFunction.renderSpace(id, space);
      space = null;
      spaceBtn.disabled = true;
    });
  });
}

//空欄消す順番を指定した時のメソッド
function storePrezen(){
  ownFunction.storePrezen();
}
