'use strict';

class BasePdfRender extends BasePdfController{
  //BasePdfControllerを持ってきていると言ってもいい
	constructor (url, scale, viewerContainer, wrapper, pdfViewer) {
    super(url, scale, viewerContainer, wrapper, pdfViewer);
    this.blankModel = new BlankModel(url, this.pdfDoc, scale);
    this.blankModel.load();
  }

	getsocket(){
		return this.blankModel.getsocket();
	}

	//指定ページをゲットしてくる
  renderGetPdf (currentPageNum, completion) {
    let pdfDocPromise = this.getPdfDoc();
    pdfDocPromise.then((pdf) => {
      this.pdfDoc = pdf;
			//全ページ数を取得
      document.getElementById('page_count').innerText = pdf.numPages;
			//指定ページをもってくる
      let pagePromise = this.getPdfPage(pdf, currentPageNum);
      pagePromise.then((page) => {
        this.pageDoc = page;
		    //ページレンダー
        this.renderPdfPage(page, currentPageNum);
				//存在を伝える
				if(this.keepUp != null)this.keepUp.sendPageTurning();
        completion();
      }).catch((error) => {
        throw error;
      });
    }).catch((error) => {
      throw error;
    });
  }

	//ReRenderって感じのメソッド
  renderPage (currentPageNum, completion) {
		//元のやつ消しとばす
	  this.removeCurrentPage();
	  //こっからは一緒。倍率変えた状態のレンダリング
	  let pagePromise = this.getPdfPage(this.pdfDoc, currentPageNum);
	  pagePromise.then((page) => {
      this.pageDoc = page;
      this.renderPdfPage(page, currentPageNum);
	   if(this.keepUp != null)this.keepUp.sendPageTurning();
	    completion();
    }).catch((error) => {
      throw error;
    });
  }

	//空白の設定かな？
  renderSpaces (pageNum) {
    this.blankModel.render(pageNum);
  }

  //多分PDF全部消しとばしてる
  removeCurrentPage () {
    let element = this.pdfViewer;
    while(element.firstChild) element.removeChild(element.firstChild);
  }
}
