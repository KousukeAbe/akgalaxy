'use strict';
//なにかあるごとにこのろぐを行っている
class Log {
	constructor(url, page, operation, note) {
		this.note = note;
		this.operation = operation;
		this.student_number = ' ';
		this.date = new Date();
		this.url = url;
		this.page = page;
	}

	//ここらへん全部ゲッターメソッド。何をしたかってのをやっている
	static get Start() { return 'Start' } // 開いた時
	static get End() { return 'End' } // 閉じた時
	static get Enter() { return 'Enter' } // ウィンドウフォーカス
	static get Leave() { return 'Leave' } // ウィンドウブラー
	static get Move() { return 'Move' }   // ページめくり
	static get Mark() { return 'Mark' } // アンダーライン
	static get WriteNote() { return 'WriteNote' } // ノートテイク時
	static get CreateNote() { return 'CreateNote'}
	static get Blank() { return 'Blank' } // 空欄関連操作時
	static get pNote() { return 'pNote' } // ページノート更新
	static get dNote() { return 'dNote' } // 全体ノートテイク
	static get Drag() { return 'Drag' } // マウスドラッグ時
	static get Drop() { return 'Drop' } // マウスドロップ時
	static get TextSelect() { return 'TextSelect' } // テキスト入力時
	static get UpdateComment() { return 'UpdateComment' } // コメント更新時
	static get CreateComment() { return 'CreateComment' } // コメント作成時
}

let logs = [];
//一分おきに実行
let interval = 60000;
let flag = true;

//おそらくこのログはグローバルなメソッドになっている説。ここではどんなアクションをしたかを採っている１
let log = (url, page, op, note) => {
	//ここでログクラスを生成
	let log = new Log(url, page, op, note);
	this.student_number = document.getElementById('student_number').innerText;

	logs.push(log);

	if(op === Log.Start){
		op_count.entertime = 0;
		op_count.staytime = 0;
	}else if (op === Log.Enter) {
		//画面にフォーカスが復活した時の処理。
		op_count.staytime += log.date - op_count.entertime;
		op_count.entertime = 0;
	}else if (op === Log.Leave) {
		//画面からフォーカスが外れた時の処理。
		op_count.entertime = log.date;
	}
	// console.log(`${date_str(log.date)}: ${log.url} ${log.page} ${Log[op]} `, (log.note ? log.note : ""), this.student_number);
	const requestUrl = '/api/insertActionLog';
	const fileUrl = document.getElementById('file_name').innerText.replace('ファイル名: ', '');
	const params = {
		url: fileUrl,
		page: page,
		op: Log[op],
		note: note,
		student_number: this.student_number,
		created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
	};
	window.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then((response) => {
	}).catch((error) => {
    throw error;
  });
};

const makeOpCount = () => { return { date: new Date(), key: 0, mouseup: 0, wholetime: 0, staytime: 0, entertime: 0 } };
const op_log = [];
let op_count = makeOpCount();
//let op_cumulative_count = { key: 0, mouseup: 0, wholetime: 0, staytime: 0 };
let totalstaytime = 0;
setInterval(() => {
	let now = new Date();
	//キー操作集計
	// op_cumulative_count.key += op_count.key;
	// op_cumulative_count.mouseup += op_count.mouseup;
	if (op_count.entertime) {
		op_count.staytime += now - op_count.entertime;
  }
	op_count.wholetime = now - op_count.date;
	let staying = op_count.entertime;
	// op_cumulative_count.staytime += op_count.staytime;
	// op_cumulative_count.wholetime += op_count.wholetime;
	totalstaytime += op_count.staytime;
	if(totalstaytime > 1800000 && flag == true){
		flag = false;
		ownFunction.sendretire();
	}
  let url = document.getElementById('file_name').innerText.replace('ファイル名: ', '');
  let requestUrl = '/api/insertOperationLog';
  let params = {
    url: url,
    page_num: document.getElementById('page_num').value,
    student_number: document.getElementById('student_number').innerText,
    op_count_key: op_count.key,
    op_count_mouseup: op_count.mouseup,
    op_count_staytime: op_count.staytime,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  window.superagent.post(requestUrl).send(params).set('Accept', 'application/json').then((response) => {
    console.log('keep up then');
  }).catch((error) => {
    throw error;
  });

	op_log.push(op_count);
	op_count = makeOpCount();
	if (staying) op_count.entertime = op_count.date;
}, interval);

let date = (dt) => {
	if (!dt) dt = new Date();
	let that = {};
	that.Y = (`0${dt.getFullYear()}`).slice(-4);
	that.M = (`0${dt.getMonth() + 1}`).slice(-2);
	that.D = (`0${dt.getDate()}`).slice(-2);
	that.h = (`0${dt.getHours()}`).slice(-2);
	that.m = (`0${dt.getMinutes()}`).slice(-2);
	that.s = (`0${dt.getSeconds()}`).slice(-2);
	return that;
};

let date_str = (dt) => {
	if (!dt) dt = new Date();
	let datetime = date(dt);
	return `${datetime.Y}/${datetime.M}/${datetime.D} ${datetime.h}:${datetime.m}:${datetime.s}`;
};
