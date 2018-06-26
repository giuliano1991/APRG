const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('posts.db');
let db2 = new sqlite3.Database('user.db');
let db3 = new sqlite3.Database('comments.db');
const multer = require('multer');
const flash = require('connect-flash');

const routes = require('./routes/index');
const posts = require('./routes/posts');
const users = require('./routes/users');

const app = express();

app.locals.moment = require('moment');

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle File Uploads & Mulitpart Data
app.use(multer({dest: './public/images/uploads'}).any());
//const upload = multer({ dest: './public/images/uploads'});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());

// Express Session
app.use(session({ 
	secret: 'example',
	resave: false,
	saveUninitialized: true
}));

// Express Validator (For Formating the Errors)
app.use(expressValidator({
    errorFormatter: function(param,msw,value){
        const namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg : msg,
        value : value
    };
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Connect-Flash
app.use(flash());
app.use(function (req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//DB erstellen
/*app.get(['/','index'], (request,response) =>{
	db.run('CREATE TABLE posts (id_posts INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL, description TEXT NOT NULL, date NUMERIC NOT NULL, author TEXT NOT NULL, information TEXT, mainimage TEXT, comments TEXT)');
	db2.run('CREATE TABLE user (id_user INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)');
});*/

// Make our db accessible to our router
app.use(function(req, res, next){
    req.db = db;
    req.db2 = db2;
    req.db3 = db3;
    next();
});

app.use('/', routes);
app.use('/posts', posts);
app.use('/users', users);

// Catch 404 and forward to Error Handler
app.use(function(req,res,next){
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handlers

// Development Error Handler
// Will Print Stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production Error Handler
// No stacktraces leaked to user
app.use(function(err,req,res,next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;