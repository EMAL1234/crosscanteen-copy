var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')

var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const  ExpressHandlebars  = require('express-handlebars');
var app = express();
var session=require('express-session')
var fileupload=require('express-fileupload')
var db=require('./config/connection');
const productHelpers = require('./helpers/product-helpers');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())
app.use(session({secret:"key",cookie:{maxAge:600000},resave:true,saveUninitialized:true}))
db.connect(function(err)
{
  if(err)
  console.log('error')
  else
  console.log('DB Conncted')
})
app.use('/', userRouter);
app.use('/admin', adminRouter);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials'
}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
