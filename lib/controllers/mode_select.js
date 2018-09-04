'use strict';

//モードセレクトをレンダリングするだけ
class Mode_Select {
    static getIndex (req, res) {
      console.log(req.session);
      res.render('mode_select', {username: req.session.user.username, status: req.session.user.status, student_number: req.session.user.student_number});
    }
}

module.exports = Mode_Select;
