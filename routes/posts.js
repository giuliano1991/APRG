const express = require('express');
const router = express.Router();
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('posts.db');
let db2 = new sqlite3.Database('user.db');
let db3 = new sqlite3.Database('comments.db');

router.get('/show/:id', function(req, res, next){
    const id = req.params.id;
    let sql = `SELECT * FROM posts WHERE id_posts='${id}'`;
    let sql2 = `SELECT * FROM comments WHERE id_posts='${id}'`;
    db.get(sql, function(err, row) {
        db3.all(sql2, function(error, rows) {
        if (req.session.user){
            const user = req.session['user'];
            res.render('show', {
            "post": row,
            "user": user,
            "comments": rows
        });
    } else {
        res.render('show', {
            "post": row,
            "comments": rows
        });
    }
	});
    });
});

router.get('/add', function (req, res, next){
    res.render('addpost', {
        "title": "Beitrag hinzufügen"
    });
});

router.post('/add', function(req, res, next){
    // Get Form  Values
    const title = req.body['title'];
    const description = req.body['description'];
    const body = req.body['body'];
    const author = req.body['author'];
    const information = req.body['information'];
    const date = new Date();

   /* if(req.files.mainimage){
        const mainImageOriginalName = req.files.mainimage.originalname;
        const mainImageName = req.files.mainimage.name;
        const mainImageMime = req.files.mainimage.mimetype;
        const mainImagePath = req.files.mainimage.path;
        const mainImageExt = req.files.mainimage.extension;
        const mainImageSize = req.files.mainimage.size;
    } else {
        const mainImageName = 'noimage.jpg';
    }*/

    // Form Validation
    req.checkBody('title', 'Titel darf nicht leer stehen').notEmpty();
    req.checkBody('body', 'Textfeld darf nicht leer sein').notEmpty();
    req.checkBody('information', 'Informationen fehlen').notEmpty();

    //Check Errors
    const errors = req.validationErrors();

    if(errors){
        res.render('addpost', {
            errors: errors,
            "title": title,
            body: body
        });
    } else {

		//Submit to db
		let sql = `INSERT INTO posts(title, body, description, date, author, information) VALUES ('${title}', '${body}', '${description}', '${date}', '${author}', '${information}')`;
        db.run(sql);
        req.flash('success', 'Post erfolgreich gespeichert');
        res.location('/');
        res.redirect('/');
		}
});

router.post('/addcomment', function(req, res, next){
    // Get Form  Values
    const name = req.body.name;
    const body = req.body.body;
    const postid = req.body.postid;
    const commentdate = new Date();

    // Form Validation
    req.checkBody('body', 'Kommentar darf nicht leer sein').notEmpty();

    //Check Errors
    const errors = req.validationErrors();

    if(errors){
        db.all("SELECT * FROM posts", function(err, rows) {
            if (req.session.user){
                const user = req.session['user'];
                res.render('index', {
                    "posts": rows,
                    errors: errors,
                    "user": user
                });
            } else {
                res.render('index', {
                    "posts": rows,
                    errors: errors
                });
            }
        });
    } else {
        //Submit to db
        let sql = `INSERT INTO comments(id_posts, comment, username, date) VALUES ('${postid}', '${body}', '${name}', '${commentdate}')`;
        db3.run(sql)
        req.flash('success', 'Post erfolgreich gespeichert');
        res.location('/posts/show/'+postid);
        res.redirect('/posts/show/'+postid);
    }
});

module.exports = router;