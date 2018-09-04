'use strict';

class BasePdfController {
  //値をメンバ変数に格納
  constructor (pdfUrl, scale, viewerContainer, wrapper, pdfViewer) {
    this.pdfUrl = pdfUrl;
    this.scale = scale;
    this.viewerContainer = viewerContainer;
    this.wrapper = wrapper;
    this.pdfViewer = pdfViewer;
    this.flag = false;

    this.scaleInput = document.getElementById('scale');
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
        this.scale = this.scaleInput.value / 100;
        let viewport = page.getViewport(this.scale);
        console.log(this.scale);
        if((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0){
          viewport = page.getViewport(1);
          this.scale = window.innerWidth / viewport.width;
          if(this.flag == false){
            inputScale.value = this.scale * 100;
          }
          viewport = page.getViewport(this.scale);
          console.log(this.scale);

          setPhoneScale(this.scale);
          this.flag = true;
        }
        //要素作成
        let pageDiv = document.createElement('div');
        let canvas = document.createElement('canvas'); // PDF描画用canvas

        //ノートのレイヤーも生成
        let noteLayer = document.createElement('div');
        let noteLayerCanvas = document.createElement('canvas');

        pageDiv.id = `page_${currentPageNum}`;
        pageDiv.style.position = 'relative';
        pageDiv.style.display = 'none';

        this.pdfViewer.appendChild(pageDiv);
        pageDiv.appendChild(canvas);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        noteLayer.className = 'note_layer';
        noteLayer.id = 'note_layer';
        noteLayer.width = viewport.width;
        noteLayer.height = viewport.height;

        noteLayerCanvas.className = 'note_layer_canvas';
        noteLayerCanvas.id = 'note_layer_canvas';
        noteLayerCanvas.width = viewport.width;
        noteLayerCanvas.height = viewport.height;

        noteLayer.style.position = 'absolute';
        noteLayerCanvas.style.position = 'absolute';

        //getBoundingClientRect... 要素サイズと位置を返す
        let pageRect = pageDiv.getBoundingClientRect();   // pdfViewerをおなじtopとleftにする
        noteLayer.style.top = `${pageRect.top}px`;
        noteLayer.style.left = `${pageRect.left}px`;

        noteLayer.appendChild(noteLayerCanvas);
        pageDiv.appendChild(noteLayer);

        //コメントレイヤーの設定
        let commentLayer = document.createElement('div');
        commentLayer.id = `input_div`;
        commentLayer.innerHTML = `<textarea id="input_text" rows="3" cols="20"></textarea>`;
        pageDiv.appendChild(commentLayer);

        //テキストレイヤーを設置
        this._textLayerBuilder(pageDiv, canvas.getContext('2d'), viewport);
        //表示
        this.showPage(page, currentPageNum);
    }

    // 任意のタイミングでページを表示する(Scale値の変更や表示サイズの変更など)
    showPage (page, currentPageNum) {
        let top = 30;
        let vcStyle = this.viewerContainer.style;

        vcStyle.top = `${top}px`;
        vcStyle.left = `${0}px`;
        vcStyle.width = `${window.innerWidth}px`;
        vcStyle.height = `${window.innerHeight - top}px`;

        this._show(page, currentPageNum);
    }

    //ページサイズを調整して描画
    _show (page, currentPageNum) {
        //getViewport... 指定倍率に対してのPDFサイズを返す
        let viewport = page.getViewport(this.scale);
        let scale = this.scaleInput.value / 100;
        let wrapperStyle = this.wrapper.style;
    //    this.pdfViewer.style.transform = `scale(${scale})`;
        this.pdfViewer.style.transformOrigin = `0 0`;

        let pdfViewerWidth = viewport.width;
        let pdfViewerHeight = viewport.height;
        let viewerContainerWidth = this.viewerContainer.clientWidth;
        let viewerContainerHeight = this.viewerContainer.clientHeight;
        let pcTop = (pdfViewerHeight < (viewerContainer.clientHeight - document.getElementById("controller_container").clientHeight)) ? ((viewerContainerHeight - pdfViewerHeight) / 2 + document.getElementById("controller_container").clientHeight): document.getElementById("controller_container").clientHeight + 3;
        let pcLeft = (window.innerWidth > pdfViewerWidth) ? ((window.innerWidth - pdfViewerWidth) / 2) : 2;
        wrapperStyle.top = `${pcTop}px`;
        wrapperStyle.left = `${pcLeft}px`;
        wrapperStyle.width = `${viewport.width}px`;
        wrapperStyle.height = `${viewport.height}px`;

        let noteLayer = document.getElementById('note_layer');
        noteLayer.style.width = `${viewport.width}px`;
        noteLayer.style.height = `${viewport.height}px`;

        document.getElementById(`page_${currentPageNum}`).style.display = `none`;
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

    // ページ数を返す
    getCountPdfPage () {
        return this.pdfDoc.numPages;
    }
}
