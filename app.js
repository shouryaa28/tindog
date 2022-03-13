var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const expressSession = require('express-session');
const Chat= require('./routes/chat')
const socket=require('socket.io')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const io = socket();
app.io = io;

var loggedIn = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

io.on('connection',function(socket){
  console.log("ho yga ");
  socket.on('msg',function(data){
    var newMsg = new Chat({msg:''+data});
    newMsg.save();
    socket.emit('msgsent',data)
    socket.broadcast.emit('left',data)
  });

  socket.on('username',function(data){
    loggedIn[socket.id] = data;
    io.emit('userlist',loggedIn)
  });

  socket.on('disconnect',function(){
    delete loggedIn[socket.id];
  });
  socket.on('isTyping',function(urldata){
    socket.broadcast.emit('typing',urldata);
  });

})


app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret:'facebook clone ban jaa please !'
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser())
passport.deserializeUser(usersRouter.deserializeUser())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
