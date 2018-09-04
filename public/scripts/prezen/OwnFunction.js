'use strict';

class OwnFunction{
  //BasePdfControllerを持ってきていると言ってもいい
  constructor (pdfUrl, scale, viewerContainer, wrapper, pdfViewer) {
    this.pdfUrl = pdfUrl;
    this.scale = scale;
    this.viewerContainer = viewerContainer;
    this.wrapper = wrapper;
    this.pdfViewer = pdfViewer;


    this.blankModel = new BlankModel(url, this.pdfDoc, scale);
    this.blankModel.load();

  }

  //指定ページをゲットしてくる
  renderGetPdf (currentPageNum, completion) {
    let pdfDocPromise = this.getPdfDoc();
    pdfDocPromise.then((pdf) => {
      this.pdfDoc = pdf;
      //指定ページをもってくる
      let pagePromise = this.getPdfPage(pdf, currentPageNum);
      pagePromise.then((page) => {
        this.pageDoc = page;
        let viewport = page.getViewport(1);
        this.scale = document.getElementById("viewer_container").clientHeight/ viewport.height * 0.9;
        console.log(this.scale);
        //ページレンダー
        this.renderPdfPage(page, currentPageNum);
        //存在を伝える
        if(this.keepUp != null)this.keepUp.sendPageTurning(); // 初期ページ表示時に学籍番号が空欄のまま追加されてしまうためコメントアウト
        completion(this.scale);
      }).catch((error) => {
        throw error;
      });
    }).catch((error) => {
      throw error;
    });
  }

  // PDFを非同期で入手。
  getPdfDoc () {
    return PDFJS.getDocument(this.pdfUrl);
  }
  //指定ページを取得
  getPdfPage (pdf, pageNum) {
    return pdf.getPage(pageNum);
  }

  renderPdfPage (page, currentPageNum) {
    this.pdfPage = page;
    //倍率設定
    let viewport = page.getViewport(this.scale);
    //要素作成
    let pageDiv = document.createElement('div');
    let canvas = document.createElement('canvas'); // PDF描画用canvas

    pageDiv.id = `page_${currentPageNum}`;
    pageDiv.style.position = 'relative';
    pageDiv.style.display = 'none';

    this.pdfViewer.appendChild(pageDiv);
    pageDiv.appendChild(canvas);

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    //テキストレイヤーを設置
    this._textLayerBuilder(pageDiv, canvas.getContext('2d'), viewport);
    //表示
    this.showPage(page, currentPageNum);
  }

  _textLayerBuilder (div, context, viewport) {
    let renderContext = { canvasContext: context, viewport: viewport };
    //描画、これもPDFjsを使ってる
    this.pdfPage.render(renderContext).then(() => {
      //テキストを抽出。これで選択可能になる
      return this.pdfPage.getTextContent();
    }).then(textContent => {
      let textLayerDiv = document.createElement('div');
      textLayerDiv.setAttribute('class', 'textLayer');
      div.appendChild(textLayerDiv);

      //これはnodeモジュールのtextlayerbuider
      let textLayer = new TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        pageIndex: this.pdfPage.pageIndex,
        viewport: viewport
      });
      //文字列をテキストに設置
      textLayer.setTextContent(textContent);
      textLayer.render();
    });
  }

  // 任意のタイミングでページを表示する(Scale値の変更や表示サイズの変更など)
  showPage (page, currentPageNum) {
    let top = 30;
    let vcStyle = this.viewerContainer.style;
    let viewport = page.getViewport(this.scale);

    vcStyle.width = `${window.inneWidth}px`;
    vcStyle.height = `${window.innerHeight - top}px`;

    this._show(page, currentPageNum);
  }

  //ページサイズを調整して描画
  _show (page, currentPageNum) {
    //getViewport... 指定倍率に対してのPDFサイズを返す
    let viewport = page.getViewport(this.scale);

    let wrapperStyle = this.wrapper.style;
   this.pdfViewer.style.transform = `scale(${scale})`;
    this.pdfViewer.style.transformOrigin = `0 0`;

    let pdfViewerWidth = viewport.width;
    let pdfViewerHeight = viewport.height;
    let viewerContainerWidth = this.viewerContainer.clientWidth;
    let viewerContainerHeight = this.viewerContainer.clientHeight;

    console.log(pdfViewerHeight + " " + viewerContainerHeight);

    let pcTop = (pdfViewerHeight < viewerContainerHeight) ? ((viewerContainerHeight - pdfViewerHeight) / 2) : 0;
    let pcLeft = (pdfViewerWidth < viewerContainerWidth) ? ((viewerContainerWidth - pdfViewerWidth) / 2) : 0;

    wrapperStyle.top = `${pcTop}px`;
    wrapperStyle.left = `${pcLeft}px`;

    document.getElementById(`page_${currentPageNum}`).style.display = `block`;
  }

  // ページ数を返す
  getCountPdfPage () {
    return this.pdfDoc.numPages;
  }

	getsocket(){
		return this.blankModel.getsocket();
	}

	//ReRenderって感じのメソッド
  renderPage (currentPageNum, completion) {
		//元のやつ消しとばす
	  this.removeCurrentPage();
	  //こっからは一緒。倍率変えた状態のレンダリング
	  let pagePromise = this.getPdfPage(this.pdfDoc, currentPageNum);
	  pagePromise.then((page) => {
      this.pageDoc = page;
      let viewport = page.getViewport(1);
      this.scale = document.getElementById("viewer_container").clientHeight/ viewport.height * 0.9;
      this.renderPdfPage(page, currentPageNum);
	   if(this.keepUp != null)this.keepUp.sendPageTurning();
	    completion();
    }).catch((error) => {
      throw error;
    });
  }

	//空白の設定かな？
  renderSpaces (pageNum) {
    this.blankModel.getprezen(this.pageDoc.pageIndex + 1, () => {
      this.blankModel.render(pageNum, this.scale);
    });
  }

  //多分PDF全部消しとばしてる
  removeCurrentPage () {
    let element = this.pdfViewer;
    while(element.firstChild) element.removeChild(element.firstChild);
  }

  nextslide(completion){
    if(currentPageNum >= this.pdfDoc.numPages)return;
    this.blankModel.nextslide(completion);
  }

  backslide(completion){
    if(currentPageNum <= 1)return;
    this.blankModel.backslide(completion);
  }
}
