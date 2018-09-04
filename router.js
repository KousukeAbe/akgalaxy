'use strict';
const express = require('express');
const Controller = require('./lib/controllers/');
var multer = require('multer');
var upload = multer({ dest: './uploads/' });

// 全体のルーティング。ExpressのRouterクラスを継承してるのでこんな感じ
class Router extends express.Router {
  constructor (options) {
    //もともとのexpress.Router()を実行してる
    super(options);
    //this.getはrouter.get()と同じ。第一引数はエンドポイントで第二引数はコールバック関数
    this.get('/', Controller.Index.getIndex);

    //ログイン関連。getとpostで別れる
    this.post('/login', Controller.Auth.postLogin);
    this.get('/logout', Controller.Auth.getLogout);
    this.get('/signup', Controller.Auth.getSignup);
    this.post('/signup', Controller.Auth.postSignup);

    //mode_selectのとき使うAPIみたいな
    this.get('/api/getPdfList', Controller.PdfSelect.getPdfList);
    this.get('/add_slide', Controller.AddSlide.getIndex);
    this.post('/storepdf', upload.fields([ { name: 'pdffile' } ]), Controller.AddSlide.storePdf);

    //５つのモード
    this.get('/authoring', Controller.Authoring.getIndex);
    this.get('/browsing', Controller.Browsing.getIndex);
    this.get('/analytics', Controller.Analytics.getIndex);
    this.get('/prezen', Controller.Prezen.getIndex);
    this.get('/watching', Controller.Watching.getIndex);

    //オーソリングで使う系
    this.get('/api/loadBlanks', Controller.Authoring.loadBlanks);
    this.post('/api/deleteBlank', Controller.Authoring.deleteBlank);
    this.post('/api/storeBlank', Controller.Authoring.storeBlank);
    this.post('/api/storePrezen', Controller.Authoring.storePrezen);
    this.get('/api/getPrezen', Controller.Authoring.getPrezen);

    //ブラウジングで使う系
    this.post('/api/saveAnswer', Controller.Authoring.saveAnswer);
    this.post('/api/correctBlank', Controller.Browsing.correctBlank);
    this.get('/api/getAnswerBlanks', Controller.Authoring.loadAnswerBlanks);
    this.post('/api/storeComment', Controller.Browsing.storeComment);
    this.post('/api/removeComment', Controller.Browsing.removeComment);
    this.post('/api/changeCommentText', Controller.Browsing.changeCommentText);
    this.post('/api/changeCommentPosition', Controller.Browsing.changeCommentPosition);
    this.get('/api/loadComment', Controller.Browsing.loadComment);
    this.post('/api/storeMark', Controller.Browsing.storeMark);
    this.get('/api/loadMark', Controller.Browsing.loadMark);
    this.post('/api/removeMark', Controller.Browsing.removeMark);
    this.post('/api/insertActionLog', Controller.Browsing.insertActionLog);
    this.post('/api/insertOperationLog', Controller.Browsing.insertOperationLog);
    this.post('/api/insertOperationLogOld', Controller.Browsing.insertOperationLogOld);


        //使ってない系
        this.post('/api/insertNotes', Controller.Browsing.insertNotes);

        //プレゼン系
        this.get('/api/getanswer', Controller.Authoring.getanswer);
        this.get('/api/getheatmap', Controller.Authoring.getheatmap);
        this.get('/api/sendheatmap', Controller.Authoring.sendheatmap);

        //アナリティクス系
        this.get('/api/getAnalyticsData', Controller.Analytics.getAnalyticsData);
        this.get('/api/getUserAnalyticsData', Controller.Analytics.getUserAnalyticsData);
        this.get('/api/getUserAnalyticsDate', Controller.Analytics.getUserAnalyticsDate);
        this.get('/api/getUserDateData', Controller.Analytics.getUserDateData);
        this.get('/api/getPageAnalyticsData', Controller.Analytics.getPageAnalyticsData);


        this.get('/api/getAllMember', Controller.Analytics.getAllMember);
        this.get('/api/getAllClicker', Controller.Analytics.getAllClicker);
        this.get('/api/getAllKey', Controller.Analytics.getAllKey);
        this.get('/api/getAllNote', Controller.Analytics.getAllNote);
        this.get('/api/getAllMark', Controller.Analytics.getAllMark);
        this.get('/api/getAllStaytime', Controller.Analytics.getAllStaytime);
        this.get('/api/getAllHeatmap', Controller.Analytics.getAllHeatmap);
        this.get('/api/getAllHeatmapDate', Controller.Analytics.getAllHeatmapDate);
        this.get('/api/getAllWords', Controller.Analytics.getAllWords);

        this.all('*', Controller.Index.notFound);
        this.use(Controller.Index.internalServerError);
    }
}

module.exports = Router;
