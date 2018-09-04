'use strict';

const mysql = require('mysql');
const config = require('config');
const DB_Model = require('../models/db_model');

class User_Model extends DB_Model {
  //データベースにログイン
  constructor () {
    super();
  }

  //実質親クラスのメソッドをもって来ているだけ
  getConnection () {
    super.getConnection();
  }

  //ユーザー情報をDBで参照、取得する
  getUser(username, password, completion) {
    let queryString = 'SELECT * FROM user_info WHERE `login_name` = ? AND `login_password` = ?'
    let holder = [username, password];

    //コールバック
    this.con.query(queryString, holder, (err, results, fields) => {
      if (err) {
        completion(err, null);
      } else {
        completion(null, results);
      }
    });
  }

  //ユーザーの登録ができる
  storeUser(username, password, status, studentnum) {
    if(!studentnum){
      var number = 999999;
    }else{
      var number = studentnum;
    }
    let queryString = `insert into user_info(name, year, student_number, department, login_name, login_password, createdate) values(?, ?, ?, ?, ?, ?, now());`;
    let holder = ["hoge", "24", number, status, username, password, Date.now()];

    //コールバック
    this.con.query(queryString, holder, (err) => {
      if(err){
        console.log(err);
      }
      console.log(username + "  OK");
    });
  }

  storePdf(pdfname, username, completion){
    let queryString = `insert into pdf(name, create_number, create_date) values(?, ?, now());`;
    let holder = [pdfname, username, Date.now()];

    //コールバック
    this.con.query(queryString, holder, (err) => {
      if(err){
        console.log(err);
      }
      completion();
    });
  }

  getPdfList(completion){
    let queryString = `select * from pdf;`;

    //コールバック
    this.con.query(queryString, "", (err, result) => {
      if(err){
        console.log(err);
      }
      completion(result);
    });
  }
}

module.exports = User_Model;
