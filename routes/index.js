const express = require('express');
const router = express.Router();
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('posts.db');
let db2 = new sqlite3.Database('user.db');

// Get Homepage
router.get('/', function(req, res, next) {

	db.all("SELECT * FROM posts", function(err, rows) {
		if (req.session.user){
			const user = req.session['user'];
			res.render('index', {
				"posts": rows,
				"user": user
			});
		} else {
			res.render('index', {
				"posts": rows
			});
		}
	});
});

module.exports = router;