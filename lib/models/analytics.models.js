'use strict';

const DB_Model = require('../models/db_model');

class Analytics_Model extends DB_Model {
	constructor () {
		super();
	}

	getConnection () {
		super.getConnection();
	}

	disconnetion () {
		super.getDisconnection();
	}

	// 行動ログ収集のために
	insertCorrectBlank (url, pageNum, log, blankId, answerText, inputText, studentNumber, correct, completion) {
		const QUERY_STRING = `INSERT INTO correct_answers
			(url, page_num, blank_id, answer_text, input_text, student_number, correct_answer_status, created_at)
			values (?, ?, ?, ?, ?, ?, ?, ?)`;
		const HOLDER = [url, pageNum, blankId, answerText, inputText, studentNumber, correct, new Date().toISOString().slice(0, 19).replace('T', ' ')];

		this.con.query(QUERY_STRING, HOLDER, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	updateCorrectBlank (blankId, inputText, studentNumber, correct, completion) {
		const QUERY_STRING = `UPDATE correct_answers SET input_text=?, correct_answer_status=?, update_at=? WHERE student_number=? AND blank_id=?`;
		const HOLDER = [inputText, correct, new Date().toISOString().slice(0, 19).replace('T', ' '), studentNumber, blankId];

		this.con.query(QUERY_STRING, HOLDER, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	// 既にその学生が解答をしているかどうか調べる もし回答しているならupdate_atカラムにnow()を追加する していなければupdate_atには追加しない
	// return: Bool (解答情報登録済み: true)
	checkExistStudentNumber (studentNumber, blankId, completion) {
		const QUERY_STRING = `SELECT * FROM correct_answers WHERE student_number=? AND blank_id=?`;
		const HOLDER = [studentNumber, blankId];
		this.con.query(QUERY_STRING, HOLDER, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	//生徒が実際に答えたものを取得（もっと賢くしたい）
	getCorrectAnswer (completion) {
		const QUERY_STRING = `SELECT * FROM correct_answers`;
		this.con.query(QUERY_STRING, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	// 空欄IDで検索してその空欄に対する正解情報を取得する
	getAnswers (blankId, completion) {
		const QUERY_STRING = `SELECT * FROM correct_answers WHERE blank_id = ?`;
		const HOLDER = [blankId];
		this.con.query(QUERY_STRING, HOLDER, (error, results) => {
			completion(results);
		});
	}

	insertActionLog (url, page, op, studentNumber, createdAt, completion) {
		const QUERY_STRING = `INSERT INTO learning_action_log (url, page_num, student_number, type, created_at) values(?, ?, ?, ?, ?)`;
		const HOLDER = [url, page, studentNumber, op, createdAt];
		this.con.query(QUERY_STRING, HOLDER, (error, results) => {
			if (error) throw error;
			completion();
		});
	}

	insertOperationLogOld (since, url, studentNumber, createdAt, op, cumOp, completion) {
		const QUERY_STRING = `INSERT INTO learning_operation_log_old (url, student_number, since, count_key, count_mouseup, count_wholetime, count_staytime, cum_count_key, cum_count_mouseup, cum_count_wholetime, cum_count_staytime, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		const HOLDER = [url, studentNumber, since, op.key, op.mouseup, op.wholetime, op.staytime, cumOp.key, cumOp.mouseup, cumOp.wholetime, cumOp.staytime, createdAt];
		this.con.query(QUERY_STRING, HOLDER, (error, results) => {
			if (error) throw error;
			completion();
		});
	}

	insertNote (url, studentNumber, pageNum, div, mark, createdAt, completion) {
		this.deleteNote(url, pageNum, studentNumber, () => {
			let insertQUERY_STRING = `INSERT INTO notes (url,student_number,page_num,div_top,div_left,div_text,mark_top,mark_left,mark_right,mark_bottom,created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
			let HOLDER = [url, studentNumber, pageNum, div.top, div.left, div.text, mark.top, mark.left, mark.right, mark.bottom, createdAt];
			this.con.query(insertQUERY_STRING, HOLDER, (error) => {
				if (error) throw error;
				completion();
			});
		});
	}

	// そのページのそのURLのノートを削除する
	deleteNote (url, pageNum, studentNumber, completion) {
		const QUERY_STRING = `DELETE FROM notes WHERE url=? AND page_num=? AND student_number=?`;
		const HOLDER = [url, pageNum, studentNumber];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	removeComment (id, completion) {
		const QUERY_STRING = `DELETE FROM comment WHERE id=?`;
		const HOLDER = [id];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	removeMark(id, completion) {
		const QUERY_STRING = `DELETE FROM mark WHERE id=?`;
		const HOLDER = [id];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	storeKeepUp (url, studentNumber, pageNum, countKey, countMouseUp, countStayTime, createdAt, completion) {
		const QUERY_STRING = `INSERT INTO learning_operation_log
			(url, student_number, page_num, count_key, count_mouseup, count_staytime, created_at)
			values (?, ?, ?, ?, ?, ?, ?)`;
		const HOLDER = [url, studentNumber, pageNum, countKey, countMouseUp, countStayTime, createdAt];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	storeComment(url, pageNum, rect_top, rect_left, base_top, base_left, studentNumber, completion){
		const QUERY_STRING = `INSERT INTO comment
			(url, page_num, rect_top, rect_left, base_top, base_left, student_number)
			values (?, ?, ?, ?, ?, ?, ?)`;
		const HOLDER = [url, pageNum, rect_top, rect_left, base_top, base_left, studentNumber];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	storeMark(url, pageNum, rect_top, rect_left, width, height, studentNumber, completion){
		let QUERY_STRING = `INSERT INTO mark
			(url, page_num, rect_top, rect_left, width, height, student_number)
			values (?, ?, ?, ?, ?, ?, ?)`;
		let HOLDER = [url, pageNum, rect_top, rect_left, width, height, studentNumber];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			QUERY_STRING = `select max(id) from mark where
				url = ? and page_num = ? and student_number = ?; `;
		  HOLDER = [url, pageNum, studentNumber];
			this.con.query(QUERY_STRING, HOLDER, (error, result) => {
				console.log(HOLDER);
				if (error) throw error;
				completion(result);
			});
		});
	}

	changeCommentText(url, id, text, completion){
		const QUERY_STRING = `UPDATE comment SET comment.text = ? WHERE comment.id = ?`;
		const HOLDER = [text, id];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	changeCommentPosition(id, rect, completion){
		const QUERY_STRING = `UPDATE comment SET comment.base_top = ?, comment.base_left = ? WHERE comment.id = ?`;
		const HOLDER = [rect.top, rect.left, id];
		this.con.query(QUERY_STRING, HOLDER, (error) => {
			if (error) throw error;
			completion();
		});
	}

	loadComment (url, completion) {
		const queryString = `SELECT * FROM comment WHERE url = ?`;
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

	loadMark (url, completion) {
		const queryString = `SELECT * FROM mark WHERE url = ?`;
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

	getDistinctStudentNumForKeepUp (url, completion) {
		const QUERY_STRING = `SELECT DISTINCT student_number FROM learning_operation_log WHERE url = ?`;
		const HOLDER = [url];

		this.con.query(QUERY_STRING, HOLDER, (error, result) => {
			if (error) throw error;
			completion(result);
		});
	}

	// 学籍番号とページ番号から過去1分間のデータを取得する
	getKeepupLatestMinute (url, studentNumber, pageNum, completion) {
		let queryString = ``; // 学籍番号とページ番号から1分以内のデータを取得
		let holder = [url, studentNumber, pageNum];

		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
			console.log('get keep up latest minute');
			console.dir(result);
			completion(result);
		});
	}

	// 学生のブラウジングモードのページ参照情報を保存する
	storeBrowsingPage (url, studentNumber, pageNum, createdAt) {
		console.log("fsddaze");
		let queryString =
			`INSERT INTO student_page_turning (url, student_number, page_num, created_at)
			 values(?, ?, ?, now())`;
		let holder = [url, studentNumber, pageNum];

		this.con.query(queryString, holder, (error) => {
			if (error) throw error;
		});
	}

	// その学籍番号の学生が最後に参照したページの番号を取得する
	getBrowsingPage () {
        let queryString = `select * from student_page_turning as s where id =
        (select max(id) from student_page_turning as sp  where s.student_number=sp.student_number AND created_at in
        (select max(created_at) from student_page_turning as sp where s.student_number = sp.student_number) AND
				CURRENT_TIMESTAMP + INTERVAL -3 minute < (select max(created_at) from student_page_turning as sp where s.student_number = sp.student_number))
				order by id`;

		return new Promise((resolve, reject) => {
			this.con.query(queryString, (error, result) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(result);
			});
		});
	}

	getBlank (url, pageNum) {
		return new Promise((resolve, reject) => {
			let queryString = `SELECT * FROM blank WHERE url = ? AND page_num = ?`;
			let holder = [url, pageNum];

			this.con.query(queryString, holder, (error, results) => {
				if (error) {
					reject(error);
					return;
                }
				resolve(results);
			});
		});
	}

	getBlankAnswer (url, pageNum, studentNumber) {
		let queryString = `SELECT * FROM correct_answers WHERE
			correct_answer_status=1 AND url=? AND page_num=? AND student_number=?`;

		let holder = [url, pageNum, studentNumber];

		return new Promise((resolve, reject) => {
            this.con.query(queryString, holder, (error, results) => {
				if (error) {
					reject(error);
					return;
                }
				resolve(results);
            });
		});
	}

	storetext(url, page_num, student_number, text){
		const queryString = `INSERT INTO  selectText(url, page_num, text, student_number, createdate) values (?, ?, ?, ?, now());`;
		let holder = [url, page_num, text, student_number];
		this.con.query(queryString, holder, (error, result) => {
			if (error) throw error;
		});
	}
}

module.exports = Analytics_Model;
