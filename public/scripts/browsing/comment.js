'use strict';

//これが。PDF上に出てくるコメントみたいなやつ
class Comment {
	constructor(url, wrapper, noteLayerCanvas, socket) {
		this.url = url;
		this.socket = socket;
		this.comments = [];
		this.wrapper = wrapper;
		this.noteLayerCanvas = noteLayerCanvas;
		this.superagent = window.superagent;

		this.placeHolder = 'ここにコメントを入力.';
	}

	//大元。このクラスのメイン。コメントのレンダリングとイベント登録を行なっている
	RerenderComment (currentPageNum, completion,deleteco) {
		let scale = (inputScale.value / 100);
		let inputDiv = document.getElementById('input_div');
		//コメントレイヤーの設定
		let commentLayer = document.getElementById('input_div');
		commentLayer.innerHTML = `<textarea id="input_text" rows="3" cols="20"></textarea>`;
		let spaceRects = this.comments.filter(rects => {
			if(rects.student_number ==  document.getElementById('student_number').innerText){
				return currentPageNum === parseInt(rects.page_num);
			}else{
				return false;
			}
		});
		if(spaceRects.length == 0){
			completion("");
			return;
		}
		for (let spaceRect of spaceRects) {
			let inputText = inputDiv.firstChild.cloneNode(true);

			inputText.placeholder = this.placeHolder;
			inputText.id = spaceRect.id;
			inputText.className = 'comment_text';
			inputText.value = spaceRect.text;
			inputText.style.position = 'absolute';
			inputText.style.top = `${spaceRect.rect.base_top * scale}px`;
			if(spaceRect.rect.base_left < 0){
				inputText.style.left = '0px';
			}else{
				inputText.style.left = `${spaceRect.rect.base_left * scale}px`;
			}

			let moveKnob = document.createElement('div');
			//矩形の値の集合を収集できる
			let inputTextRect = inputText.getBoundingClientRect();

			moveKnob.className = 'comment_knob';
			moveKnob.innerText = '◆';

			moveKnob.style.top = `${spaceRect.rect.base_top * scale - 20}px`;
			if(spaceRect.rect.base_left < 0){
				moveKnob.style.left = '0px';
			}else{
				moveKnob.style.left = `${spaceRect.rect.base_left * scale}px`;
			}

			inputDiv.appendChild(moveKnob);
			inputDiv.appendChild(inputText);
			inputText.focus();

			let removeKnob = document.createElement('div');

			removeKnob.className = 'remove_knob';
			removeKnob.innerText = '×';

			removeKnob.style.top = `${spaceRect.rect.base_top * scale - 20}px`;
			if(spaceRect.rect.base_left < 0){
				removeKnob.style.left = '20px';
			}else{
				removeKnob.style.left = `${spaceRect.rect.base_left * scale + 30}px`;
			}

			inputDiv.appendChild(removeKnob);

			// メモした内容を送信
			inputText.addEventListener('change', (e) => {
				this.changeText(e);
			});

			let dragging = false;
			let target = null;

			removeKnob.addEventListener('click', (e) => {
				this.remove(e.target.previousElementSibling.id, completion, deleteco);
			}, false);

			moveKnob.addEventListener('mousedown', (e) => {
				dragging = true;
				target = e;
			}, false);

			moveKnob.addEventListener('mouseup', () => {
				dragging = false;
				let noteLayerCanvas = document.getElementById('note_layer_canvas');
				let canvasRect = noteLayerCanvas.getBoundingClientRect();
				var size = target.target.nextElementSibling.getBoundingClientRect();
				var scale = (inputScale.value/ 100);

				this.changePosition(target.target.nextElementSibling.id, {top: (size.y - canvasRect.y) / scale, left: (size.x - canvasRect.x) / scale}, () => {
					this.load(() => {
						this.RerenderComment(currentPageNum, completion,deleteco);
					});
				});
			});

			window.addEventListener('mousemove', (e) => {
				if (dragging) {
					deleteco({top: spaceRect.rect.rect_top, left: spaceRect.rect.rect_left}, {top: spaceRect.rect.base_top, left: spaceRect.rect.base_left});
					this._move(target, inputDiv, completion, e, {top: spaceRect.rect.rect_top, left: spaceRect.rect.rect_left}, {top: spaceRect.rect.base_top, left: spaceRect.rect.base_left});
				}
			});
			completion({top: spaceRect.rect.rect_top, left: spaceRect.rect.rect_left}, {top: spaceRect.rect.base_top, left: spaceRect.rect.base_left}); // コメントを保持するためにcallback引数にする
		}
  }

	//マウスムーブした時コメントをズラしているのがこれ
  _move (target, inputDiv, completion, e, markRect, commentElement) {
		//必要なものを取得
		var scale = (inputScale.value / 100);
		var y = window.pageYOffset ;
		var x = window.pageXOffset ;
		var base = inputDiv.getBoundingClientRect();
		//移動ボタンの設定
		target.target.style.left = `${(e.pageX - base.left - x - 10)}px`;
		target.target.style.top = `${(e.pageY - base.top -y - 10)}px`;
		// target.target.style.left = `${(e.pageX - base.left - x - 10) / scale}px`;
		// target.target.style.top = `${(e.pageY - base.top -y - 10) / scale}px`;
		//コメント欄本体の設定
		target.target.nextElementSibling.style.left = `${(e.pageX - base.left - 10 - x)}px`;
		target.target.nextElementSibling.style.top =`${(e.pageY - base.top + 10 - y)}px`;
		//削除ボタンの設定
		var next = target.target.nextElementSibling.nextElementSibling;
		next.style.left = `${(e.pageX - base.left - x + 20)}px`;
		next.style.top = `${(e.pageY - base.top - y - 10)}px`;
		//コールバック関数のための準備
		let noteLayerCanvas = document.getElementById('note_layer_canvas');
		let canvasRect = noteLayerCanvas.getBoundingClientRect();
		var size = target.target.nextElementSibling.getBoundingClientRect();
		completion(markRect, {top: (size.y - canvasRect.y) / scale, left: (size.x - canvasRect.x) / scale});
	}

	//コメントのロード。てか更新。イベントがある度これを実行している
	load (completion) {
		let requestUrl = '/api/loadComment';
		let params = {url: this.url};

		window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			this.comments = [];
			if(response.text != ""){
				let parse = JSON.parse(response.text);
				for (let i = 0; i < parse.length; ++i) {
					this.comments.push(parse[i]);
				}
			}
			completion();
		}).catch((error) => {
			throw error;
		});
	}

	//コメントの登録（削除も作らなきゃ...）
	store (rect, pageNum, completion) {
		let requestUrl = '/api/storeComment';
		let params = {
			url: this.url,
			num: pageNum,
			rect: rect,
			student_number: document.getElementById('student_number').innerText
		};

		this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then((response) => {
			completion();
		}).catch((error) => {
			throw error;
		});
	}

	//テキスト変更をAPIに投げてる
	changeText(element){
		let requestUrl = '/api/changeCommentText';
		let params = {
			url: this.url,
			id: element.target.id,
			text: element.target.value,
			student_number: document.getElementById('student_number').innerText,
			page_num: document.getElementById('page_num').value
		};

		this.socket.emit('send_comment', params);
		this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then(() => {
			console.log("ok");
		}).catch((error) => {
			throw error;
		});
	}

	remove(number, completion,deleteco){
		let requestUrl = '/api/removeComment';
		let params = {
			id: number
		};
		this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then(() => {
			this.load(() => {
				let noteLayerCanvas = document.getElementById('note_layer_canvas');
				let context = noteLayerCanvas.getContext('2d');
				context.beginPath();
				context.clearRect(0, 0, 900,900);
				this.RerenderComment(currentPageNum, completion, deleteco);
			});
		}).catch((error) => {
			throw error;
		});
	}

	//マウスアップの時に座標の更新をAPIで投げてる
	changePosition(id, rect, completion){
		let requestUrl = '/api/changeCommentPosition';
		let params = {
			id: id,
			rect: rect
		};

		this.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then(() => {
			completion();
		}).catch((error) => {
			throw error;
		});
	}
}
