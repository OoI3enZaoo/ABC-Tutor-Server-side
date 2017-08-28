var Express = require('express')
var app = new Express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')

var Log = require('log')
var log = new Log('debug')
var port = process.env.PORT || 5000
var path = require('path');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: false
}));
// app.use(bodyParser.json());
app.use(cors())
app.use(Express.static(path.join(__dirname, '/public')));
app.get('/', function (req, res) {
 res.redirect('index.html')
})

app.get('/visualizar', function (req, res) {
 res.redirect('visualizar.html')
})

io.on('connection', function (socket) {
  console.log('a user connected ', socket.id)
  // user ที่เปิดหรืออก browser
  socket.on('disconnect', function () {
    console.log('user disconnected ', socket.id)
  })
  socket.on('subscribe', function(room) {
    console.log('joining room', room);
    socket.join(room);
  });
  socket.on('leaveRoom',function(room){
    console.log('leave Room', room);
    socket.leave(room)
  });
  socket.on('private_message',function(data){
    console.log("send from room: " + data.room);
    io.to(data.room).emit('conversation_private', data);
    io.emit('admin', data)
  });
  socket.on('toUser',function(data){
      data.type = "admin"
      io.to(data.room).emit('fromAdmin', data)
  })
  socket.on('addNewCourse' ,function(data){
    console.log('addNewCourse: ' + data)
      io.emit('newCardData',data)
  })
  socket.on('removeCourse' ,function(data){
    console.log('removeCourse: ' + data)
      io.emit('removeCourse',data)
  })
	socket.on('stream',function(image) {
		socket.broadcast.emit('stream',image)
	});
})

http.listen(port, function () {
  log.info('Run Port // localhost:', port)
})
