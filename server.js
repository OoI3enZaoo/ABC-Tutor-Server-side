var Express = require('express')
var app = new Express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')

var Log = require('log')
var log = new Log('debug')
var port = process.env.PORT || 1337
var path = require('path');
var bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({
    extended: false
}));
// app.use(bodyParser.json());
app.use(cors())
// app.use(Express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
  res.send(`<h1>555 Hello Vue.js 2 socket. io </h1> <br> <li> yarn add socket </li> <li> function socket.io  </li>`)
//   res.redirect('index.html')
})

io.on('connection', function (socket) {
    console.log('user connected: ' + socket.id);
    socket.on('subscribe', function (room) {
      socket.join(room)
      console.log('room: ' + room)
    })
    socket.on('private_message' ,function (data) {
      io.to(data.room).emit('private_message', data)
    })
    socket.on('live_message' ,function (data) {
      console.log('live_message')
      io.to(data.room).emit('live_message', data)
    })
    socket.on('live_tutor', function (data) {
      io.to(data.room).emit('live_tutor', data)
    })
    socket.on('stoplive' ,function (data) {
      io.to(data.room).emit('stoplive', data)
    })
    socket.on('requestCamera' ,function (data) {
      io.to(data.room).emit('requestCamera', data)
    })
    socket.on('refuseCamera' ,function (data) {
      io.to(data.room).emit('refuseCamera', data)
    })
    socket.on('allowCamera', function(data) {
      io.to(data.room).emit('allowCamera', data)
    })
    socket.on('live_cam_1', function(data) {      
      io.to(data.room).emit('live_cam_1', data)
    })
    socket.on('live_cam_2', function(data) {      
      io.to(data.room).emit('live_cam_2', data)
    })
    socket.on('live_cam_3', function(data) {      
      io.to(data.room).emit('live_cam_3', data)
    })
    socket.on('live_cam_4', function(data) {      
      io.to(data.room).emit('live_cam_4', data)
    })
})
http.listen(port, function () {
  log.info('Run Port // localhost:', port)
})
