'use strict';

let Analytics_Model = require('../models/analytics.models');

class Browsing {
	static getIndex(req, res) {
		res.render('browsing', {student_number: req.session.user.student_number});
	}

	static correctBlank(req, res) {
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let page_num = req.body.page_num;
		let log = req.body.log;
		let blankId = req.body.blank_id;
		let answerText = req.body.answerText;
		let inputText = req.body.input_text;
		let correct = req.body.correct;
		let studentNumber = req.body.student_number;

		model.checkExistStudentNumber(studentNumber, blankId, result => {
			// 既に学生が解答を保存しているかどうかチェックしてそれによってinsertかupdateを実行する
			if (!result.length) {
				model.insertCorrectBlank(url, page_num, log, blankId, answerText, inputText, studentNumber, correct, () => {
					model.disconnetion();
					res.end();
				});
			} else {
				model.updateCorrectBlank(blankId, inputText, studentNumber, correct, () => {
					model.disconnetion();
					res.end();
				});
			}
		});
	}

	static insertActionLog (req, res) {
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let page = req.body.page;
		let op = req.body.op;
		let studentNumber = req.body.student_number;
		let createdAt = req.body.created_at;

		model.insertActionLog(url, page, op, studentNumber, createdAt, () => {
			model.disconnetion();
			res.end();
		});
	}

	static insertOperationLogOld (req, res) {
        let model = new Analytics_Model();
        model.getConnection();

        let since = req.body.since;
        let url = req.body.url;
        let op = {};
        let cumulativeOp = {};
        let studentNumber = req.body.student_number;
        let createdAt = req.body.created_at;

        op.key = req.body.op_count_key;
        op.mouseup = req.body.op_count_mouseup;
        op.wholetime = req.body.op_count_wholetime;
        op.staytime = req.body.op_count_staytime;

        cumulativeOp.key = req.body.op_cumulative_count_key;
        cumulativeOp.mouseup = req.body.op_cumulative_count_mouseup;
        cumulativeOp.wholetime = req.body.op_cumulative_count_wholetime;
        cumulativeOp.staytime = req.body.op_cumulative_count_staytime;

        model.insertOperationLogOld(since, url, studentNumber, createdAt, op, cumulativeOp, () => {
            model.disconnetion();
            res.end();
        });
	}

	static insertNotes (req, res) {
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let studentNumber = req.body.student_number;
		let pageNum = req.body.page_num;
		let div = {};
		let mark = {};
		let createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

		div.top = req.body.div_top;
		div.left = req.body.div_left;
		div.text = req.body.div_text;
		mark.top = req.body.mark_top;
		mark.left = req.body.mark_left;
		mark.right = req.body.mark_right;
		mark.bottom = req.body.mark_bottom;

		model.insertNote(url, studentNumber, pageNum, div, mark, createdAt, () => {
			model.disconnetion();
			res.end();
		});
	}

    static insertOperationLog (req, res) {
        let model = new Analytics_Model();
        model.getConnection();

				console.log(req.body);

        let url = req.body.url;
        let pageNum = req.body.page_num;
        let studentNumber = req.body.student_number;
        let createdAt = req.body.created_at;
        let key = req.body.op_count_key;
        let mouseup = req.body.op_count_mouseup;
        let staytime = Math.floor(req.body.op_count_staytime / 1000);

		model.storeKeepUp(url, studentNumber, pageNum, key, mouseup, staytime, createdAt, () => {
			model.disconnetion();
			res.end();
		});
    }

	static storeComment(req, res){
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let pageNum = req.body.num;
		let rect_top = req.body.rect.rects[0].top;
		let rect_left = req.body.rect.rects[0].left;
		let base_top = req.body.rect.rects[0].top;
		let base_left = req.body.rect.rects[0].left - 170;
		let studentNumber = req.body.student_number

		model.storeComment(url, pageNum, rect_top, rect_left, base_top, base_left, studentNumber, () => {
			model.disconnetion();
			res.end();
		});
	}

	static storeMark(req, res){
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let pageNum = req.body.num;
		let rect_top = req.body.rect.y.toFixed(3);
		let rect_left = req.body.rect.x.toFixed(3);
		let width = req.body.rect.w.toFixed(3);
		let height = req.body.rect.h.toFixed(3);
		let studentNumber = req.body.student_number;

		model.storeMark(url, pageNum, rect_top, rect_left, width, height, studentNumber, (result) => {
			model.disconnetion();
			res.send(result);
		});
	}

	static changeCommentText(req, res){
		let model = new Analytics_Model();
		model.getConnection();

		let url = req.body.url;
		let id = req.body.id;
		let text = req.body.text;

		model.changeCommentText(url, id, text, () => {
			model.disconnetion();
			res.end();
		});
	}

	static changeCommentPosition(req, res){
		let model = new Analytics_Model();
		model.getConnection();

		let id = req.body.id;
		let rect = req.body.rect;

		model.changeCommentPosition(id, rect, () => {
			model.disconnetion();
			res.end();
		});
	}


		static loadComment (req, res) {
			let model = new Analytics_Model();
			model.getConnection();

			let url = req.query.url;

			model.loadComment(url, results => {
				let response = [];
				if (results === null) { // ここでresponceしてないのがダメだった
					model.getDisconnection();
					// response[0].result = false;
					res.send(null);
				} else {
					let spaces = [];
					for (let i = 0; i < results.length; ++i) {
						let result = results[i];
						let space = {
							id: result.id,
							url: result.url,
							page_num: result.page_num,
							text: result.text,
							rect: {
								rect_top: result.rect_top,
								rect_left: result.rect_left,
								base_top: result.base_top,
								base_left: result.base_left,
								text: result.rect_text
							},
							student_number: result.student_number,
							result: true
						};
						space.result = false;
						response.push(space);
					}
					model.getDisconnection();
					res.send(JSON.stringify(response));
				}
			});
		}


		static loadMark (req, res) {
			let model = new Analytics_Model();
			model.getConnection();

			let url = req.query.url;

			model.loadMark(url, results => {
				let response = [];
				if (results === null) { // ここでresponceしてないのがダメだった
					model.getDisconnection();
					// response[0].result = false;
					res.send(null);
				} else {
					let spaces = [];
					for (let i = 0; i < results.length; ++i) {
						let result = results[i];
						let space = {
							id: result.id,
							url: result.url,
							page_num: result.page_num,
							rect: {
								x: result.rect_left,
								y: result.rect_top,
								w: result.width,
								h: result.height,
							},
							student_number: result.student_number,
							result: true
						};
						space.result = false;
						response.push(space);
					}
					model.getDisconnection();
					res.send(JSON.stringify(response));
				}
			});
		}

		static removeComment(req, res) {
			let model = new Analytics_Model();
			model.getConnection();
			model.removeComment(req.body.id, () => {
				model.getDisconnection();
				res.send("");
			});
		}

		static removeMark(req, res) {
			let model = new Analytics_Model();
			model.getConnection();
			model.removeMark(req.body.id, () => {
				model.getDisconnection();
				res.send("");
			});
		}
}


module.exports = Browsing;
