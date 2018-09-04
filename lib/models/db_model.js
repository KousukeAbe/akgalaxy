'use strict';

const mysql = require('mysql');
const config = require('config');

class DB_Model {
	//DBにコネクション
	getConnection () {
		this.con = mysql.createConnection({
			host: config.get('db.host'),
			user: config.get('db.username'),
			password: config.get('db.password'),
			database: config.get('db.database')
		});
		this.con.connect();
		let box = this;
		//一定時間すぎるとMySQLとコネクションが切れてサーバーがクラッシュするのでそれを阻止
		this.con.on('error', function(err) {
        console.log('ERROR.DB: ', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('ERROR.CONNECTION_LOST: ', err);
            box.getConnection();
        } else {
            throw err;
        }
    });
	}

	getDisconnection () {
		this.con.end();
	}
}

module.exports = DB_Model;
