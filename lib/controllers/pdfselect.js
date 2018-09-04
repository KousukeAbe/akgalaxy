const UserModel = require('../models/user.models');

//モードセレクトをレンダリングするだけ
class Pdf_Select {
  static getPdfList(req, res){
    const user = new UserModel();
    user.getConnection();
    user.getPdfList(function(data){
      res.send(data);
      res.end();
    });
  }
}

module.exports = Pdf_Select;
