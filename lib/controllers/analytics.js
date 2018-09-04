'use strict';
let LectureModel = require('../models/Lecture.models');


class Analytics {
	static getIndex(req, res, next) {
		res.render('analytics', {});
	}

	static getAnalyticsData(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		console.log(req.query);
		model.getAnalyticsData(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getUserAnalyticsData(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getUserAnalyticsData(req.query.url, req.query.student_number, req.query.date, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getUserAnalyticsDate(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getUserAnalyticsDate(req.query.url, req.query.student_number, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getPageAnalyticsData(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getPageAnalyticsData(req.query.url, req.query.page_number, result => {
			model.getDisconnection();
			res.send(result);
		});
	}


	static getUserDateData(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getUserDateData(req.query.url, req.query.student_number, req.query.date, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllMember(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllMember(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllClicker(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllClicker(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllKey(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllKey(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllNote(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllNote(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllMark(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllMark(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllStaytime(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllStaytime(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllHeatmap(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllHeatmap(req.query.url, req.query.date, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllHeatmapDate(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllHeatmapDate(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}

	static getAllWords(req, res, next){
		let model = new LectureModel();
		model.getConnection();
		model.getAllWords(req.query.url, result => {
			model.getDisconnection();
			res.send(result);
		});
	}
}

module.exports = Analytics;
