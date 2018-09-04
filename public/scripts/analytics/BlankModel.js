'use strict';

class BlankModel extends BaseBlankModel {
	constructor(url, pdfDoc, scale, socket) {
		super(url);

		this.pdfDoc = pdfDoc;
		this.scale = scale;
		this.socket = socket;
		this.superagent = window.superagent;
		this.socket = io('192.168.2.76:8001').connect();

		this.socket.on(`event:get_correct_answer:${url}`, (data) => {
			let pageNum = parseInt(document.getElementById('page_num').value);
			this._clearNoteLayer();　//全てを消しとばす
			this.render(pageNum);　//空白レンダリング
			this.renderCorrectStatus(data, pageNum);　//パーセンテージ表示
		});
	}

	//ここでソケット作ってたから仕方なくゲッターメソッド
	getsocket(){
		return this.socket;
	}

	//ここは一緒。空白のレンダリング
	render (currentPageNum) {
		let spaceRects = this.spaces.filter(rects => {
			return currentPageNum === parseInt(rects.page_num);
		});

		for (let spaceRect of spaceRects) {
			this.renderSpace(spaceRect.rect);
		}
	}

	// 空欄の矩形の枠園を描画,これもいつもの
	renderSpace (rect) {
        let canvas = document.getElementById('note_layer_canvas');
        let context = canvas.getContext('2d');
        let scale = document.getElementById('scale').value / 100;
        let margin = 3; // 枠線のmargin
        let lineWidth = 0.5;

        let x = rect.left - margin;
        let y = rect.top - margin;
        let w = ((rect.right - rect.left) * scale) + margin;
        let h = ((rect.bottom - rect.top) * scale) + margin;

        context.lineWidth = lineWidth;
        context.rect(x, y, w, h);
        context.stroke();
    }

	// 空欄の一つ一つの矩形情報と解答情報から描画
	renderCorrectStatus (answerStatus, currentPageNum) {
		let pageFilterSpaces = this.spaces.filter((space) => {
			return parseInt(space.page_num) === currentPageNum;
		});
		let pageFilterAnswerStatus = answerStatus.data.filter((status) => {
			return parseInt(status.page_num) === currentPageNum;
		});

		pageFilterAnswerStatus.filter((status) => {
			return pageFilterSpaces.filter((space) => {
				if (status.blank_id === space.id) {
					this._renderStatus(space.rect, status)
				}
			});
		});
	}

	// 正解数、不正解数の表示
	_renderStatus (rect, answerStatus) {
        let canvas = document.getElementById('note_layer_canvas');
        let context = canvas.getContext('2d');
        let scale = document.getElementById('scale').value / 100;
        let blankWidth = (rect.right - rect.left) * scale;
        let blankHeight = (rect.bottom - rect.top) * scale;
        let unanswerPercent = 100 - answerStatus.correct_in_percent - answerStatus.incorrect_in_percent;
        let correctPercent = 100 - answerStatus.incorrect_in_percent - unanswerPercent;
        let incorrectPercent = 100 - answerStatus.correct_in_percent - unanswerPercent;

        let correctWidth = blankWidth * (correctPercent / 100);
        let incorrectWidth = blankWidth * (incorrectPercent / 100);

        // 正解数の描画
        context.fillStyle = `rgb(0, 255, 255)`;
        context.globalAlpha = `0.3`;
        context.fillRect(rect.left, rect.top, correctWidth, blankHeight);
        // 不正解数の描画
        context.fillStyle = 'rgb(240, 128, 128)';
        context.globalAlpha = '0.3';
				context.fillRect(rect.left + correctWidth, rect.top, incorrectWidth, blankHeight);
				context.fillStyle = 'black';
				context.globalAlpha = '1';
        context.fillText(`正答率 ${correctPercent}%`, rect.left, rect.top + blankHeight + 20, correctWidth + incorrectWidth);
	}

	_clearNoteLayer () {
		let canvas = document.getElementById('note_layer_canvas');
		let context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
}
