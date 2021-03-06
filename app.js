var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// var multer = require('multer');

var settings = require('./setting');
var flash = require('connect-flash');
//引入index的路由
var routes = require('./routes/index');


// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

//设定端口
app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));//改为true之后可以嵌套解析，并且可以解析数组
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use(session(
    {
      secret: settings.cookieSecret,
      key: settings.db,//cookiename
      cookie:{maxAge: 1000 * 60 * 60 * 24 * 30},
      store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port : settings.port,
        url: 'mongodb://localhost:27017/blog'
      })
    }
));

//添加上传文件模块
/*app.use(multer({
    dest : './public/images/',
    rename: function (fieldname, filename) {
        return filename;
    }
}));*/



/*
app.use('/', index);
app.use('/users', users);
*/

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

// error handler
/*
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
//调用
routes(app);//注意，这个放到最后面，因为前面很多设置
module.exports = app;
