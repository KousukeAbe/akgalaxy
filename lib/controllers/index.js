'use strict';

class IndexController {
	// '/'が来たら
	static getIndex(req, res) {
		// index.ejs をレンダリング
		res.render('index', {
			//セッションが残っているならusernameを返す。これはExpressのセッションの機能っぽい
			username: req.session.user && req.session.user.username,
			status:  req.session.user && req.session.user.status,
			student_number: req.session.user && req.session.user.student_number,
			validationErrors: null
		});
	}

	static notFound(req, res) {
		const err = new Error('Not Found');
		res.status(404);
		res.render('error', {
			message: 'Not Found',
		});
	}

	static internalServerError(err, req, res, next) {
		res.status(err.status || 500);
		if (err && (!err.status || Math.floor(err.status / 100) === 5)) {
			console.error(err);
		}

		res.render('error', {
			message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
			error: process.env.NODE_ENV === 'production' ? {} : err
		});
	}
}

module.exports = {
	Index: IndexController,
	Auth: require('./auth'),
	Mode: require('./mode_select'),
	Authoring: require('./authoring'),
	Browsing: require('./browsing'),
	Analytics: require('./analytics'),
	Prezen: require('./prezen'),
	Watching: require('./watching'),
	AddSlide: require('./addslide'),
	PdfSelect: require('./pdfselect')
};
