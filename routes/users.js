const express = require('express');
const router = express.Router();
const session = require('express-session');
const passwordHash = require('password-hash');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('posts.db');
let db2 = new sqlite3.Database('user.db');


// Register Page
router.get('/register', function (req, res, next){
    res.render('register', {
        "title": "Registrieren"
    });
});

//Logout
router.post('/logout', function (request, response) {
	delete request.session.authenticated;
	delete request.session.user;
	response.redirect('/');
});
// Login
router.post('/login', function(request, response, next) {
	const user = request.body['username'];
	const password = request.body['password'];
	
	let sql = `SELECT * FROM user WHERE username='${user}'`;
	db2.get(sql, function(err, row){
		if (err) {
			console.log(err.message);
		} else {
			if (row != undefined) {
				if (passwordHash.verify(password, row.password)) {
					request.session['authenticated'] = true;
					request.session['user'] = user;
					response.location('/');
					response.redirect('/');
				}
			}
			else {
				response.render('register');
			}
		}
	});
});

// Register
router.post('/newUser', function(request, response, next) {
	const username = request.body['username'];
	const password = request.body['password'];

	if (password == "" || password == null || username == "" || username == null){
		response.render('register', {
            "title": "Fehler beim Registrieren!"
        });		
	} else {
		const pass = passwordHash.generate(password);
		let sql = `SELECT * FROM user WHERE username='${username}'`;
		db2.get(sql, function(error, row){
			if (error) {
				console.log(error.message);
			} else {
				if (row == undefined){
					sql = `INSERT INTO user(username, password) VALUES('${username}', '${pass}')`;
					db2.run(sql);
					response.render('register', {"title": "Du bist erfolgreich registriert!"});
			}
				else {
					response.render('register', {"title" : "Benutzername gibt es bereits!"});	
				}
			}
		});
	}
});

module.exports = router;
