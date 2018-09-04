'use strict';

class BlankModel extends BaseBlankModel {
	constructor(url, pdfDoc, scale, socket) {
		super(url);

		this.pdfDoc = pdfDoc;
		this.scale = scale;
		this.socket = io('192.168.2.76:8001').connect();
		this.superagent = window.superagent;

		this.prezen = [];
		this.prezennow = [];
		this.comp = [];
		this.num = 1;
		this.timetable;

		this.population = document.getElementById('population');
		this.retire = document.getElementById('retire');
		this.userlist = [];
		this.retirelist = [];

		this.socket.on(`event:get_correct_answer:${url}`, (data) => {
			//this.renderCorrectStatus(data, this.num);　//パーセンテージ表示
		});

		this.socket.on(`update_userlist`, (data) => {
			this.userlist = data;
			this.population.innerText = `閲覧人数 ${data.length - 1}人`;
		});

		this.socket.on(`update_retirelist`, (data) => {
			this.retirelist = data;
			this.retire.innerText = `画面外時間30分以上の人数:  ${data.length}人`;
		});

		this.socket.on(`update_complist`, (data) => {
			console.log(data);
			if(data.pagenum == currentPageNum){
				if(!this.comp.includes(data.student_number))this.comp.push(data.student_number);
				document.getElementById('answer_title').innerText = `回答状況 全問解答人数: ${this.comp.length}人`;
			}
		});

		this.socket.on(`insert_mark`, (data) => {
			console.log("fsd");
			document.getElementById('mark_for_mark').value += `${data.student_number}: ラインしたテキスト「${data.text}」    ページ${data.pagenum}\n`;
		});

		this.socket.on(`insert_comment`, (data) => {
			console.log("fsd");
			document.getElementById('mark_for_comment').value += `${data.student_number}: ノート内容「${data.text}」    ページ${data.pagenum}\n`;
		});
	}

	//ここでソケット作ってたから仕方なくゲッターメソッド
	getsocket(){
		return this.socket;
	}

	// そのページの全ての空欄を描画
	render (currentPageNum, scale) {
		this.comp = [];
		document.getElementById('answer_title').innerText = `回答状況 全問解答人数: ${this.comp.length}人`;
		this.scale = scale;

		let spaceRects = this.spaces.filter(rects => {
			return currentPageNum === parseInt(rects.page_num);
		});
		for (let spaceRect of spaceRects) {
			this.renderSpace(spaceRect.id, spaceRect.rect, spaceRect.rect.text);
		}
		this.renderAnswer(spaceRects, currentPageNum);
	}

	renderAnswer(spaceRects, pagenum){
		let num = this.userlist.length;
		window.clearTimeout(this.timetable);
		let requestUrl = '/api/getanswer';
		let params = {
			url: this.url,
			num: currentPageNum
		};
		this.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			document.getElementById('answerbox').innerHTML = "";
			for(let n = 0; n < spaceRects.length; n++){
				let correct = 0;
				for(let i = 0; i < this.userlist.length; i++){
					if(this.retirelist.includes(this.userlist[i]))continue;
					for(let p = 0; p < response.body.length; p++){
						if(this.userlist[i] == response.body[p].student_number && spaceRects[n].id == response.body[p].blank_id){
							correct++;
							break;
						}
					}
				}
				let percent = 0;
				if(num > 1){
					if(correct / (num - 1) * 100 > 100){
						percent = 100;
					}else{
						percent = correct / (num - 1) * 100;
					}
				}
				let box = document.getElementById('answerbox');
				box.innerHTML += `
					<div id="answer_${spaceRects[n].id}" class="innerbox">
						<p>${spaceRects[n].rect.text}</p>
						<p>正答率: ${percent}%</p>
						<meter min=0 max=100 value=${percent}>
					</div>
				`;
			}
			this.timetable = window.setTimeout(() => {this.renderAnswer(spaceRects, response, currentPageNum);}, 10000);
		}).catch((error) => {
			throw error;
		});
	}

	// 渡された空欄ひとつを描画
	renderSpace (id, rect, text) {
		let scale = this.scale;
		let renderTarget = document.getElementById(`pdf_viewer`).firstElementChild;
		let div = document.createElement('div');

		let textbox = this._createSpace(rect, text, scale, id);
		div.appendChild(textbox);
		renderTarget.appendChild(div);
	}

	//空欄スペースの作成
	_createSpace (rect, text, scale, id) {
		let textbox = document.createElement('input');
		let textboxStyle = textbox.style;

		textbox.className = 'space';
		textbox.id = id;
		textbox.type = 'text';

		textboxStyle.top = `${rect.top * scale}px`;
		textboxStyle.left = `${rect.left * scale}px`;
		textboxStyle.width = `${(rect.right - rect.left) * scale + 6}px`;
		textboxStyle.height = `${(rect.bottom - rect.top) * scale}px`;

		textbox.readOnly = true;
		textboxStyle.display = 'block';
		return textbox;
	}

	getprezen(pageNum, completion) {
		this.prezen = [];
		this.prezennow = [];
		let requestUrl = '/api/getprezen';
		let params = {
			url: this.url,
			num: pageNum
		};
		this.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			console.log(response);

			this.num = pageNum;
			if(response.body.length > 0)this.prezen = response.body[0].slide.split(',');
			for(let i = 0; i < this.prezen.length; i++ ){
				this.prezen[i] = parseInt(this.prezen[i]);
				this.prezennow[i] = parseInt(this.prezen[i]);
			}
			completion();
		}).catch((error) => {
			throw error;
		});
	}

	nextslide(completion){
		console.log(this.prezennow);
		if(this.prezennow.length <= 0){
			completion();
			document.getElementById('note_for_page').value = "";
			page_num.innerText = currentPageNum;
			return;
		}
		let target = this.prezennow.shift();
		console.log(document.getElementById(target));
		document.getElementById(target).parentNode.parentNode.removeChild(document.getElementById(target).parentNode);
	}

	backslide(completion){
		if(this.prezen.length == this.prezennow.length){
			completion();
			document.getElementById('note_for_page').value = "";
			page_num.innerText = currentPageNum;
			return;
		}
		let target = this.prezen[this.prezen.length - this.prezennow.length - 1];
		this.prezennow.unshift(this.prezen[this.prezen.length - this.prezennow.length - 1]);

		let spaceRect = this.spaces.filter(rects => {
			return target === parseInt(rects.id);
		});
		this.renderSpace(spaceRect[0].id, spaceRect[0].rect, spaceRect[0].rect.text);
	}

	// 空欄の一つ一つの矩形情報と解答情報から描画
	renderCorrectStatus (answerStatus, currentPageNum) {
		let pageFilterSpaces = this.spaces.filter((space) => {
			return parseInt(space.page_num) === currentPageNum;
		});
		let pageFilterAnswerStatus = answerStatus.data.filter((status) => {
			return parseInt(status.page_num) === currentPageNum;
		});
		console.log(pageFilterSpaces)

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
}
