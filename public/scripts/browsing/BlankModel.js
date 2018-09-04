'use strict';

class BlankModel extends BaseBlankModel {
	constructor (pdfUrl, pdfDoc, scale) {
		super(pdfUrl);
		this.pdfDoc = pdfDoc;
		this.scale = scale;
		this.superagent = window.superagent;
    this.blankAnswers = [];

		this.load();
	}

	// そのページの全ての空欄を描画
	render (currentPageNum) {
		let spaceRects = this.spaces.filter((rects) => {
			//ページ番号が合っているか？
			return currentPageNum === parseInt(rects.page_num);
		});

		this._loadAnswerBlanks(document.getElementById('student_number').innerText, (answers) => {
			let filterAnswer = answers.filter((answer) => {
				//ここもページ番号が合っているかを調べてる
				return parseInt(currentPageNum) === parseInt(answer.page_num);
			});

			//空白の数だけレンダリングかな
      for (let spaceRect of spaceRects) {
				if (filterAnswer.length < 1) {
          this.renderSpace(spaceRect.id, spaceRect.rect, spaceRect.rect.text);
				} else {
					let spaceId = parseInt(spaceRect.id);
					let total = filterAnswer.filter(filAns => parseInt(filAns.blank_id) == spaceId);
					if(total.length <= 0){
						this.renderSpace(spaceRect.id, spaceRect.rect, spaceRect.rect.text);
					};
				}
      }
			document.getElementById(`page_${currentPageNum}`).style.display = `block`;

			if(document.getElementsByClassName('blank').length == 0 && spaceRects.length != 0){
				ownFunction.compAnswer(currentPageNum);
			}
		});
	}

	//配置設定
	renderSpace (id, rect, text) {
		let scale = (inputScale.value / 100);
		let renderTarget = document.getElementById('pdf_viewer').firstElementChild;
		let textbox = document.createElement('input');
    textbox.className = 'blank';
    textbox.type = 'text';
    textbox.style.top = `${rect.top * scale}px`;
    textbox.style.left = `${rect.left * scale}px`;
    textbox.style.width = `${(rect.right - rect.left) * scale + 10}px`;
    textbox.style.height = `${(rect.bottom - rect.top) * scale}px`;
		renderTarget.appendChild(textbox);
		textbox.id = `blank_${id}`;
		textbox.style.fontSize= "20px";//`${(rect.bottom - rect.top) * scale}px`;

		let answerEventListener = (e) => this.removeBlank(e);

		textbox.addEventListener('change', answerEventListener);
	}

	//空欄に何か打てば動作する関数。まず答え合わせしてあってれば空欄削除。また正解不正解問わず履歴は保存する
	removeBlank (e) {
		let target = e.target;
		let input = target.value;
		let id = target.id.slice(6);
		let i = 0;
		let pageNum = document.getElementById('page_num').value;

		let params = {
			url: this.url,
			page_num: pageNum,
			blank_id: id,
			input_text: input,
			student_number: document.getElementById('student_number').innerText,
			log: 'Blank'
		};

		for (i; i < this.spaces.length; ++i) {
			if (this.spaces[i].id === parseInt(id)) {
				params.answerText = this.spaces[i].rect.text;
				break;
			}
		}

		//正解すればstoreAnswerにぶち込む
		if (params.answerText === input) {
			target.parentNode.removeChild(target);
			log(this.url, document.getElementById('page_num').value, Log.Blank, params.answerText);
			let answerTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
			this._storeAnswer(id, params.answerText, this.url, params.page_num, answerTime);
			params.correct = true;
			if(document.getElementsByClassName('blank').length == 0){
				ownFunction.compAnswer(params.page_num);
			}
		} else {
			alert("不正解！");
			target.value = "";
			params.correct = false;
		}

		this._sendBlankCorrect(params);
	}

	// 空欄解答情報を送信する
	_storeAnswer (blankId, answerText, url, pageNum, answerTime) {
		let requestUrl = '/api/saveAnswer';
		let params = {
			blankId: blankId,
			answerText: answerText,
			url: url,
			num: pageNum,
			time: answerTime,
			student_number: document.getElementById('student_number').innerText
		};
		window.superagent.post(requestUrl).send(params)
			.set('Accept', 'application/json')
			.end((error) => {
				if (error) throw error;
		});
	}

	//正解不正解問わず答えたら登録
	_sendBlankCorrect (params) {
		let requestUrl = '/api/correctBlank';

		window.superagent.post(requestUrl).send(params).set('Accept', 'application/json').end((error) => {
			if (error) throw error;
		});
	}

	//空欄たちを用意する
	_loadAnswerBlanks (studentNumber, completion) {
		//正解を確かめる
		let requestUrl = '/api/getAnswerBlanks';
		let params = {
			url: this.url,
			student_number: parseInt(studentNumber)
		};
		window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			this.blankAnswers = [];

			let parse = JSON.parse(response.text);
			for (let i = 0; i < parse.length; ++i) {
				this.blankAnswers.push(parse[i]);
			}
      completion(parse);
    }).catch((error) => {
			throw error;
		});
	}

	setPhoneScale(scale){
		this.scale = scale;
	}
}
