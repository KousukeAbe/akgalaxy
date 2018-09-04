'use strict';

// モデルの読み込み
const UserModel = require('../models/user.models');

class AuthController {
  //loginにリダイレクトされたらこれが実行される
  static getSignup(req, res) {
    // ログインセッションの有無で処理を帰る
    if (AuthController.authorized(req)) {
      //その名の通りリダイレクトする。今回はモードセレクトに。
      res.render('index', {username: req.session.username, status: req.session.status, student_number: req.session.student_number, validationErrors: null});
    } else {
      //セッションがなければloginをレンダリング。エラーも初期化しとく
      res.render('signup', { validationErrors: null });
    }
  }

  //login処理
  static postLogin(req, res, next) {
    // Callback は Promise で書き換えたい
    AuthController.validateLogin(req.body, (validateResults, data) => {
      //エラーが存在すれば内容を送って同じ画面をレンダリング
      if (validateResults) {
        res.render('index', {
          username: req.session.user && req.session.user.username,
    			status:  req.session.user && req.session.user.status,
    			student_number: req.session.user && req.session.user.student_number,
          validationErrors: validateResults});
      } else {
        // ログイン成功時セッション保持と同時にモードセレクトをレンダリング
        AuthController.login(req, data, err => {
          if (err) return next(err);
          res.render('index', {
            username: req.session.user && req.session.user.username,
      			status:  req.session.user && req.session.user.status,
      			student_number: req.session.user && req.session.user.student_number,
            validationErrors: null});
        });
      }
    });
  }

  static postSignup(req, res, next) {
    // Callback は Promise で書き換えたい
    AuthController.validateSignup(req.body, (validateResults) => {
      //エラーが存在すれば内容を送って同じ画面をレンダリング
      if (validateResults) {
        res.render('signup', {validationErrors: validateResults});
      } else {
        res.redirect('/');
      }
    });
  }

  static getLogout(req, res, next) {
    AuthController.logout(req, err => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  }

  // インプットデータの確認。存在してるかとか
  static validateLogin(params, callback) {
    const errors = [];
    // クラスをもって来ている
    const user = new UserModel();

    //DBにコネクション
    user.getConnection();

    //情報がなければエラーを送信
    if (!params.username) {
      errors.push({ message: 'require username parameter' });
      callback(errors.length ? errors : null, "");
      return;
    }
    if (!params.password) {
      errors.push({ message: 'require password parameter' });
      callback(errors.length ? errors : null, "");
      return;
    }
    //データが存在するか確認
    user.getUser(params.username, params.password, (err, result) => {
      //存在しなければエラーを
      if (result.length < 1 ) {
        errors.push({ message: 'The login attempt failed. Either the user ID or password is invalid.' });
      }
      //第三引数のコールバック関数を実行
      callback(errors.length ? errors : null, result);
    });
  }

  // インプットデータの確認。存在してるかとか
  static validateSignup(params, callback) {
    const errors = [];
    // クラスをもって来ている
    const user = new UserModel();

    //DBにコネクション
    user.getConnection();

    //情報がなければエラーを送信
    if (!params.username) {
      errors.push({ message: 'require username parameter' });
    }
    if (!params.password) {
      errors.push({ message: 'require password parameter' });
    }

    //データが存在するか確認
    user.getUser(params.username, params.password, (err, result) => {
      //存在したらエラーを
      if (result.length >= 1 ) {
        errors.push({ message: 'The login attempt failed. Either the user ID or password is invalid.' });
      }
      if(errors.length <= 0){
        user.storeUser(params.username, params.password, "学生", params.studentnum);
      }
      //第三引数のコールバック関数を実行
      callback(errors.length ? errors : null);
    });
  }

  // ログインセッションの保存
  static login(req, params, next) {
    console.log(params.password);
    req.session.user = { username: params[0].login_name, password: params[0].login_password, student_number: params[0].student_number, status: params[0].department };
    req.session.save(next);
  }

  // ログアウト時の処理（セッションの削除）
  static logout(req, next) {
    // ログインセッション情報の削除
    req.session.destroy(next);
  }

  // ログインセッションの有無を確認
  static authorized(req) {
    //!!... Booleanへの型変換
    return !!req.session.user;
  }
}

module.exports = AuthController;
