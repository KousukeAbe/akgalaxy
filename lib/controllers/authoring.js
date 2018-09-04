'use strict';

let LectureModel = require('../models/Lecture.models');

class Authoring {
	//ここはお決まりレンダリング。
	static getIndex(req, res, next) {
		res.render('authoring', {});
	}
	//あっちから来た空欄のデータをDBに登録
	static storeBlank(req, res, next) {
		let model = new LectureModel();
		model.getConnection();
		let url = req.body.url;
		let num = req.body.num;
		let space = req.body.space.rect;
		let text = req.body.space.text;

		model.insertBlanks(url, num, space, text, (id) => {
			model.getDisconnection();
			res.send(JSON.stringify({ id: id }));
		});
	}

	//BaseBlankから来た空白の要求のための関数
	static loadBlanks (req, res, next) {
		//準備
		let url = req.query.url;
		let model = new LectureModel();
		model.getConnection();
		//実際に接続。下の長い分は全て第二引数
		model.loadBlanks(url, results => {
			let response = [];
			if (results === null) { // ここでresponceしてないのがダメだった
				model.getDisconnection();
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
							top: result.rect_top,
							left: result.rect_left,
							right: result.rect_right,
							bottom: result.rect_bottom,
							text: result.rect_text
						},
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

	//空欄の削除をDBに連絡
	static deleteBlank(req, res, next) {
		let model = new LectureModel();
		let id = req.body.id;
		model.getConnection();
		model.deleteBlank(id, () => {
			model.getDisconnection();
			res.send("");
		});
	}

	static saveAnswer(req, res, next) {
		let model = new LectureModel();
		let blankId = req.body.blankId;
		let answerText = req.body.answerText;
		let url = req.body.url;
		let time = req.body.time;
		let pageNum = req.body.num;
		let studentNumber = req.body.student_number;

		console.log('url  : ' + url);

		model.getConnection();
		model.saveAnswer(blankId, answerText, url, pageNum, studentNumber, time, () => {
			model.getDisconnection();
			res.end();
		});
	}

	static loadAnswerBlanks (req, res, next) {
		let model = new LectureModel();
		let url = req.query.url;
		let studentNumber = req.query.student_number;

		model.getConnection();
		model.loadAnswerBlanks(url, studentNumber, result => {
			model.getDisconnection();
			res.send(JSON.stringify(result));
		});
	}

	static storePrezen(req, res, next){
		let str;
		if(req.body.data.length <= 0){
			str = [];
		}else{
			str = req.body.data[0];
			for(let i = 1; i < req.body.data.length; i++){
				str += "," + req.body.data[i];
			}
		}

		let model = new LectureModel();
		model.getConnection();
		model.storePrezen(req.body.url, req.body.num, str, result => {
			model.getDisconnection();
			res.end();
		});
	}

	static getPrezen(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getPrezen(req.query.url, req.query.num, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getanswer(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getanswer(req.query.url, req.query.num, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getheatmap(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getKeepUp(req.query.url, req.query.num, (result) => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static sendheatmap(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.sendheatmap(req.query.url, req.query.per, (result) => {
			model.getDisconnection();
			res.send("");
		});
	}
}

module.exports = Authoring;
