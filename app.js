'use strict';
//npmモジュール達
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Mecab = new require('mecab-async');
let socketio = require('socket.io').listen(8001);
//自作モジュール達
const Analytics_Model = require('./lib/models/analytics.models');
const session = require('./lib/modules/session');
const Router = require('./router');
const router = new Router({});
const app = express();
//クラス作成
let mecab = new Mecab();
let model = new Analytics_Model();
//接続ユーザーの管理用変数
let userlist = {};
let roomlist = {};
let retirelist = {};

let interval = 5000;
let studentNums = [];

model.getConnection();

let intervalInstance = null;

socketio.sockets.on('connection', (socket) => {
	//ルーム設立
	socket.on('join', function(msg){
		userlist[socket.id] = {
			'url' : msg.url,
			'number': msg.student_number
		}
		if(!roomlist[msg.url])roomlist[msg.url] = [];
		if(!retirelist[msg.url])retirelist[msg.url] = [];
		roomlist[msg.url].push(msg.student_number);

		socket.join(msg.url);
		socketio.to(msg.url).emit('update_userlist', 	roomlist[msg.url]);
		socketio.to(msg.url).emit('update_retirelist', 	retirelist[msg.url]);

		//ココ微妙
		model.getDistinctStudentNumForKeepUp(msg.url, (studentNumbers) => {
			studentNums = studentNumbers;
		});
	});

	socket.on('retire', function(msg){
		if(!retirelist[msg.url])retirelist[msg.url] = [];
		retirelist[msg.url].push(msg.student_number);
		socketio.to(msg.url).emit('update_retirelist', retirelist[msg.url]);
	});

	socket.on('compAnswer', function(msg){
		socketio.to(msg.url).emit('update_complist', {pagenum: msg.page_num, student_number: msg.student_number});
	});

	socket.on('send_what', function(msg){
		socketio.to(msg.url).emit('update_what', {pagenum: msg.page_num, student_number: msg.student_number});
	});

	socket.on('send_mark', function(msg){
		socketio.to(msg.url).emit('insert_mark', {pagenum: msg.page_num, student_number: msg.student_number, text: msg.text});
		mecab.parse(msg.text, function(err, result) {
			if (err) throw err;
			let text = [];
			for(let i of result){
				if(i[1] != ('名詞'))continue;
					text.push(i[0]);
			}
			for(let i of text){
				model.storetext(msg.url, msg.page_num, msg.student_number, i);
			}
		});
	});

	socket.on('send_comment', function(msg){
		socketio.to(msg.url).emit('insert_comment', {pagenum: msg.page_num, student_number: msg.student_number, text: msg.text});
	});

	socket.on('disconnect', function() {
		if(userlist[socket.id]){
			let url = userlist[socket.id].url;
			let target = roomlist[userlist[socket.id].url].indexOf(userlist[socket.id].number);
			if(target >= 0) roomlist[userlist[socket.id].url].splice(target, 1);
			target = retirelist[userlist[socket.id].url].indexOf(userlist[socket.id].number);
			if(target >= 0) retirelist[userlist[socket.id].url].splice(target, 1);
			delete userlist[socket.id];
			socketio.to(url).emit('update_userlist', roomlist[url]);
			socketio.to(url).emit('update_retirelist', retirelist[url]);
		}
	});

	socket.on('slidenext', function(){
		socket.broadcast.emit("slidechange", "");
	});

	socket.on('slideback', function(){
		socket.broadcast.emit("slideback", "");
	});

	//こめんとを受け取ったらそれをそのまんま先生へ
	socket.on('update_note', (data) => {
		socketio.sockets.emit('event:update_note_browsing', data);
	});

  // Browsingからページ番号と学籍番号、URLを受け取ってテーブルに保存する。これが閲覧人数となる
	socket.on('browsing:page_turning', (data) => {
		model.storeBrowsingPage(data.url, data.student_number, data.page_num, data.created_at);
	});
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/dist')));

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/libs', express.static(path.join(__dirname, 'public/lib')));

// modules
app.use('/libs/pdfjs/', express.static(path.join(__dirname, 'node_modules/pdfjs-dist/build/')));
app.use('/libs/text-layer-builder', express.static(path.join(__dirname, 'public/scripts/text_layer_builder/text_layer_builder-2.js'))); // このファイルだけが外部ファイルなので別に用意したディレクトリに配置する
app.use('/libs/superagent/', express.static(path.join(__dirname, 'node_modules/superagent/')));
app.use('/scripts/', express.static(path.join(__dirname, 'public/scripts/')));

// 講義資料の提供
app.use('/documents/', express.static(path.join(__dirname, 'public/documents/')));

// StyleSheets
app.use('/styles/full/', express.static(path.join(__dirname, 'public/styles/full/')));
app.use('/styles/midium/', express.static(path.join(__dirname, 'public/styles/midium/')));

app.use(session); // SocketはこれでOK
app.use('/', router);
//様式美
module.exports = app;
