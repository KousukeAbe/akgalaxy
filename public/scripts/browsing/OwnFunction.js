'use strict';

class OwnFunction extends BasePdfRender {
	//BasePdfControllerを持ってきていると言ってもいい
	constructor (url, scale, viewerContainer, wrapper, pdfViewer) {
    super(url, scale, viewerContainer, wrapper, pdfViewer);
		// ソケット接続
		this.socket = io('192.168.2.76:8001').connect();
		//コメントの設定
    this.comment = new Comment(url, wrapper, document.getElementById('note_layer_canvas'), this.socket);
    this.note = new Note(url, this.socket);

		//キープアップ
    this.keepUp = new KeepUp(url, this.socket);
    this.oldDocText = '';
    this.oldPageText = '';
  }
	//一定時間画面外だったやつを送る
	sendretire(){
		const params = {
			socket_id: this.socket.id,
			url: this.pdfUrl,
			student_number: document.getElementById('student_number').innerText
		};
		this.socket.emit('retire', params);
	}
	//全問正解したやつを送る
	compAnswer(pagenum){
		const params = {
			url: this.pdfUrl,
			student_number: document.getElementById('student_number').innerText,
			page_num: pagenum
		};
		this.socket.emit('compAnswer', params);
	}

	//ノートの作成？
	renderSpaces (currentPageNum) {
		super.renderSpaces(currentPageNum);
		this.mark = new Mark(this.pdfUrl, document.getElementById('note_layer_canvas'));

		this.comment.load(() => {
			this.comment.RerenderComment(currentPageNum, (markRect, commentElement) => {
				this.renderRelationLine(markRect, commentElement, true)
			},(markRect, commentElement) => {
				this.renderRelationLine(markRect, commentElement, false);
			});
			this.mark.getMark();
		});
	}

	//マークのレンダリング
  renderMark (markRect, scale) {
    this.mark = new Mark(this.pdfUrl, document.getElementById('note_layer_canvas'));
    for (let i = 0; i < markRect.rects.length; ++i) {
      this.mark.renderMark(markRect.rects[i], scale / 100);
    }
  }
	//マークしたら送る
	sendMark (markRect) {
		const params = {
			url: this.pdfUrl,
			student_number: document.getElementById('student_number').innerText,
			page_num: document.getElementById('page_num').value,
			text: markRect.text
		};
		this.socket.emit('send_mark', params);
	}
	//マーク消したら送る
	deleteMark (markRect, scale) {
		this.mark = new Mark(this.pdfUrl, document.getElementById('note_layer_canvas'));
		for (let i = 0; i < markRect.rects.length; ++i) {
			this.mark.deleteMark(markRect.rects[i], scale / 100);
		}
	}

	//コメント作成機能
  renderComment (rect, commentText) {
		this.comment.store(rect,this.pageDoc.pageIndex + 1, () => {
			this.comment.load(() =>{
				this.comment.RerenderComment(currentPageNum, (markRect, commentElement) => {
					this.renderRelationLine(markRect, commentElement, true)
				}, (markRect, commentElement) => {
					this.renderRelationLine(markRect, commentElement, false);
				});
			})
		});
  }

  // MarkとNoteの線を引く
  renderRelationLine (markRect, commentElement, swi) {
		this.mark.RerenderMark();
		if(markRect == "")return;
    let noteLayerCanvas = document.getElementById('note_layer_canvas');
    let canvasRect = noteLayerCanvas.getBoundingClientRect();
    let scale = inputScale.value / 100;

    let line = {
      commentX: commentElement.left * scale,
      commentY: commentElement.top * scale,
      markX: markRect.left * scale,
      markY: markRect.top * scale + 20
    };
		if(swi){
			this._drawLineMarkToComment(noteLayerCanvas.getContext('2d'), line.commentX, line.commentY, line.markX, line.markY);
		}else{
			this._drawLineDeleteToComment(noteLayerCanvas.getContext('2d'), line.commentX, line.commentY, line.markX, line.markY, canvasRect);
		}
  }

  _drawLineMarkToComment (context, startX, startY, endX, endY) {
    const strokeStyle = '#555555';
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = strokeStyle;
    context.stroke();
  }

	_drawLineDeleteToComment (context, startX, startY, endX, endY, rect) {
		context.beginPath();
    context.clearRect(0, 0, rect.width, rect.height);
	}

  // note_for_docに書き込まれた時に共有
  sendNoteDoc (text) {
    const diff = this._getDiffToNoteText(this.oldDocText, text);
    this.note.sendNoteDoc(diff);
    this.oldDocText = text;
  }

  // note_for_pageに書き込まれた時に共有
  sendNotePage (text) {
    const diff = this._getDiffToNoteText(this.oldPageText, text);
    this.note.sendNotePage(diff);
    this.oldPageText = text;
  }

  _getDiffToNoteText (oldText, newText) {
    return newText.replace(oldText, '');
  }

	closePage() {
    this.keepUp.sendPageClose();
  }

	setPhoneScale(scale){
		this.blankModel.setPhoneScale(scale);
	}
}
