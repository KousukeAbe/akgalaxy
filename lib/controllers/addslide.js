let fs = require('fs');
const UserModel = require('../models/user.models');

//モードセレクトをレンダリングするだけ
class Add_Slide {
    static getIndex (req, res) {
      console.log(req.session);
      res.render('add_slide', {username: req.session.user.username, status: req.session.user.status, student_number: req.session.user.student_number});
    }

    static storePdf(req, res){
      const user = new UserModel();
      user.getConnection();

      user.storePdf(req.files.pdffile[0].originalname, req.session.user.username, function(){
        let oldpath = req.files.pdffile[0].path;
        let newpath = './public/documents/' + req.files.pdffile[0].originalname;
        fs.rename(oldpath, newpath, function(err){
          res.render('index', {
      			//セッションが残っているならusernameを返す。これはExpressのセッションの機能っぽい
      			username: req.session.user && req.session.user.username,
      			status:  req.session.user && req.session.user.status,
      			student_number: req.session.user && req.session.user.student_number,
      			validationErrors: null
      		});
          res.end();
        });
      });
    }
}

module.exports = Add_Slide;
