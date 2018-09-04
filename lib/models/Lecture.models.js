'use strict';

const DB_Model = require('../models/db_model');

class Lecture_Model extends DB_Model {
	constructor () {
		super();
	}

	getConnection () {
		super.getConnection();
	}

    getDisconnection () {
		super.getDisconnection();
	}

	// Authoringで作成した空欄情報をDBに保存する
	insertBlanks (url, num, space, text, completion) {
		const queryString = `INSERT INTO blank (url, page_num, rect_top, rect_left, rect_right, rect_bottom, rect_text) values (?, ?, ?, ?, ?, ?, ?);`;
		let holder = [url, num, space.top, space.left, space.right, space.bottom, text];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			completion(result.insertId);
		});
	}

	// blankテーブルから空欄情報を取得する。初期化でよく使う
	loadBlanks (url, completion) {
		const queryString = `SELECT * FROM blank WHERE url = ?`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			if (result === [] || error) {
				throw error;
			} else if (result.length <= 0) {
				completion(null);
			} else {
				completion(result);
			}
		});
	}

	// オーサリングで空欄を削除した時などに使用する
	deleteBlank (id, completion) {
		const queryString = `DELETE FROM blank WHERE id=?`;
		const holder = [id];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
		});
		completion();
	}

	// 空欄に対する解答を保存する
	saveAnswer (blankId, answerText, url, num, stundetNumber, answerTime, completion) {
		const queryString = `INSERT INTO blank_answer (blank_id, url, page_num, answer_text, student_number, answer_time) values (?, ?, ?, ?, ?, ?)`;
		const holder = [blankId, url, num, answerText, stundetNumber, answerTime];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			completion();
		});
	}

	storePrezen(url, pagenum, str, completion) {
		let queryString = `SELECT * from  prezen where url = ? and page_num = ?`;
		const holder = [url, pagenum];
		this.con.query(queryString, holder, (error, result) => {
			if(result.length <= 0 && str != []){
				const queryString = `INSERT INTO prezen (url, page_num, slide) values (?, ?, ?)`;
				const holder = [url, pagenum, str];
				this.con.query(queryString, holder, (error, result) => {
					if (error) throw error;
					completion();
				});
			}else{
				if(str.length <= 0){
					const queryString = `delete from prezen where url = ? and page_num = ?`;
					const holder = [url, pagenum];
					this.con.query(queryString, holder, (error, result) => {
						if (error) throw error;
						completion();
					});
				}else{
					const queryString = `UPDATE prezen SET slide = ? where url = ? and page_num = ?`;
					const holder = [str, url, pagenum];
					this.con.query(queryString, holder, (error, result) => {
						if (error) throw error;
						completion();
					});
				}
			}
		});
	}

	getPrezen(url, pagenum, completion) {
		let queryString = `SELECT * from  prezen where url = ? and page_num = ?`;
		const holder = [url, pagenum];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	//URLに該当するログ全部持ってきている
	getKeepUp (url, num, completion) {
		let result = [];
		const QUERY_STRING = `SELECT * FROM learning_operation_log WHERE created_at > CURRENT_TIMESTAMP + INTERVAL -2 minute - INTERVAL 9 hour AND url = ? and page_num = ?`;
		// const QUERY_STRING = `SELECT * FROM learning_operation_log WHERE id >= 2171 AND id <= 2188`;
		const HOLDER = [url, num];
		this.con.query(QUERY_STRING, HOLDER, (error, myresult) => {
			result.push(myresult)
			let str = `select VARIANCE(count_mouseup + count_key) as 'hensa', avg(count_mouseup + count_key) as 'avg' from learning_operation_log;`;
		//	result.push(result);
			this.con.query(str, HOLDER, (error, result2) => {
				if (error) throw error;
				result.push(result2);
				completion(result);
			});
		});
	}

	sendheatmap(url, per, completion) {
		const queryString = `INSERT INTO learning_heatmap (url, heatup, Date) values (?, ?, now())`;
		const holder = [url, per];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			completion();
		});
	}

	getanswer(url, pagenum, completion) {
		let queryString = `SELECT * from blank_answer where url = ? and page_num = ?`;
		const holder = [url, pagenum];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}
	// 空欄の問い合わせ
	loadAnswerBlanks (url, studentNumber, completion) {
		const queryString = `SELECT * FROM blank_answer WHERE url = ? AND student_number = ?`;
		const holder = [url, studentNumber];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAnalyticsData(url, completion){
		let sendData = {};
		let queryString = ` select student_number from learning_action_log where url = ? group by student_number;`;
		let holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			sendData.totalperson = result;
			let queryString = `SELECT * FROM blank_answer WHERE url = ?`;
			let holder = [url];
			this.con.query(queryString, holder, (error, result) => {
				sendData.answer = result;
				completion(sendData);
			});
		});
	}

	getUserDateData(url, student_number, date, completion){
		let sendData = {};
		let queryString = `select page_num, created_at from student_page_turning where url = ? and student_number = ? and ? = DATE_FORMAT(created_at, '%Y-%m-%d');`;
		let holder = [url, student_number, date];
		this.con.query(queryString, holder, (error, result) => {
			sendData.pageTurning = result;
			completion(sendData);
		});
	}

	getUserAnalyticsDate(url, student_number, completion){
		let queryString = `select date_format(created_at, '%Y-%m-%d') as date from student_page_turning where url = ? and student_number = ? group by date_format(created_at, '%Y-%m-%d');`;
		const holder = [url, student_number];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getUserAnalyticsData(url, student_number, date, completion){
		let sendData = {};
		let queryString = `select student_number, sum(count_key) as '合計キー', sum(count_mouseup) as '合計マウス', sum(count_staytime) as '合計待機時間' from learning_operation_log where url = ? group by student_number;`
		let holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			sendData.keyboraddata = result;
			let queryString = `select date_format(created_at, '%Y-%m-%d') as date from student_page_turning where url = ? and student_number = ? group by date_format(created_at, '%Y-%m-%d');`;
			let holder = [url, student_number];
			this.con.query(queryString, holder, (error, result) => {
				sendData.dateTurning = result;
				let queryString = `SELECT * FROM correct_answers WHERE url = ? and student_number = ?`;
				let holder = [url, student_number];
				this.con.query(queryString, holder, (error, result) => {
					sendData.answer = result;
					let queryString = `select page_num, created_at from student_page_turning where url = ? and student_number = ? and ? = DATE_FORMAT(created_at, '%Y-%m-%d');`;
					let holder = [url, student_number, date];
					this.con.query(queryString, holder, (error, result) => {
						sendData.pageTurning = result;
						let queryString = `select student_number, count(*) from mark where url = ? group by student_number;`;
						let holder = [url];
						this.con.query(queryString, holder, (error, result) => {
							sendData.mark = result;
							let queryString = `select student_number, count(*) from comment where url = ? group by student_number;`;
							let holder = [url];
							this.con.query(queryString, holder, (error, result) => {
								sendData.comment = result;
								completion(sendData);
							});
						});
					});
				});
			});
		});
	}

	getPageAnalyticsData(url, page_num, completion){
		let sendData = {};
		let queryString = `select page_num, sum(count_key) as '合計キー', sum(count_mouseup) as '合計マウス', sum(count_staytime) as '合計待機時間' from learning_operation_log where url = ? group by page_num;`
		let holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			sendData.keyboraddata = result;
			let queryString = `select text, count(*) from selectText where url = ? and page_num = ? group by text order by count(*) desc;`;
			let holder = [url, page_num];
			this.con.query(queryString, holder, (error, result) => {
				sendData.selectText = result;
				let queryString = `SELECT * FROM correct_answers WHERE url = ? and page_num = ?`;
				let holder = [url, page_num];
				this.con.query(queryString, holder, (error, result) => {
					sendData.answer = result;
					let queryString = `select page_num, count(*) from mark where url = ? group by page_num;`;
					let holder = [url];
					this.con.query(queryString, holder, (error, result) => {
						sendData.mark = result;
						let queryString = `select page_num, count(*) from comment where url = ? group by page_num;`;
						let holder = [url];
						this.con.query(queryString, holder, (error, result) => {
							sendData.comment = result;
							completion(sendData);
						});
					});
				});
			});
		});
	}

	getAllMember(url, completion){
		const queryString = `select student_number, login_name from user_info where student_number IN (select student_number from learning_action_log where url = ? group by student_number);`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllClicker(url, completion){
		const queryString = `select student_number, sum(count_mouseup) as 'key' from learning_operation_log where url = ? group by student_number;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllKey(url, completion){
		const queryString = `select student_number, sum(count_key) as 'key' from learning_operation_log where url = ? group by student_number;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllNote(url, completion){
		const queryString = `select student_number, count(*) as 'key' from comment where url = ? group by student_number;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllMark(url, completion){
		const queryString = `select student_number, count(*) as 'key' from mark where url = ? group by student_number;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllStaytime(url, completion){
		const queryString = `select student_number, sum(count_staytime) as 'key' from learning_operation_log where url = ? group by student_number;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllHeatmapDate(url, completion){
		let queryString = `select date_format(date, '%Y-%m-%d') as date from learning_heatmap where url = ? group by date_format(date, '%Y-%m-%d');`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllHeatmap(url, date, completion){
		const queryString = `select heatup, date from learning_heatmap where url = ? and ? = DATE_FORMAT(date, '%Y-%m-%d');`;
		const holder = [url, date];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}

	getAllWords(url, completion){
		const queryString = `select text, count(*) from selectText where url = ? group by text order by count(*) desc;`;
		const holder = [url];
		this.con.query(queryString, holder, (error, result) => {
			completion(result);
		});
	}
}

module.exports = Lecture_Model;
