var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var configs = require('./config');

var index = require('./routes/index');
var waypoints = require('./routes/waypoints');
var shops = require('./routes/shops');

var obj = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));

var googleMapsClient = require('@google/maps').createClient({
    key: obj.key
});

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/waypoints', waypoints);
app.use('/shops', shops);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

db.on('connected', function () {
  console.log('Mongoose default connection open to ' + configs.dbHost);
});

// If the connection throws an error
db.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
db.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

var gracefulExit = function() {
  db.close(function () {
    console.log('Mongoose default connection with DB :' +  configs.dbHost + ' is disconnected through app termination');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

try {

  mongoose.connect( configs.dbHost );

  console.log("Trying to connect to DB " +  configs.dbHost);

} catch (err) {

  console.log("Sever initialization failed ", err.message)
};
module.exports = app;
