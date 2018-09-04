'use strict';

class OwnFunction extends BasePdfRender {
  //ここら辺は同じ動き
  constructor (url, scale, viewerContainer, wrapper, pdfViewer) {
    super(url, scale, viewerContainer, wrapper, pdfViewer);
  }

  // 空欄ボタン作成時などにひとつの空欄を作成して描画
  renderSpace (id, space) {
    this.blankModel.createSpace(id, space.rect, space.text);
  }
  // 再描画の時に使う
  renderSpaces (pageNum) {
    this.blankModel.getprezen(this.pageDoc.pageIndex + 1, () => {
      this.blankModel.render(pageNum);
    });
  }

  //スペースを登録
  storeSpace (space, completion){
    this.blankModel.store(space.rect, space.text, this.pageDoc.pageIndex + 1, (id) => {
      this.blankModel.load();
      completion(id);
    });
  }

  // 空欄消す順番を登録
  storePrezen(){
    this.blankModel.storePrezen(this.pageDoc.pageIndex + 1);
  }

  //スマホ用
  setPhoneScale(scale){
    this.blankModel.setPhoneScale(scale);
  }
}
