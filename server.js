var express = require('express');
var app = new express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')
app.use(cors({credentials: true, origin: 'http://localhost:4000'}));

app.get('/',function(req,res) {
	res.send('for socker.ioo');
});
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
    socket.on('stopCamera' ,function (data) {
      console.log('stopCamera')
      io.to(data.room).emit('stopCamera', data)
    })
    socket.on('forceStopCamera',function (data) {
      console.log('forceStopCamera')
      io.to(data.room).emit('forceStopCamera', data)
    })
    socket.on('announcement', function (data) {
      io.to(data.room).emit('announcement', data)
    })
    socket.on('qa', function (data) {
      io.to(data.room).emit('qa', data)
    })
    socket.on('courseContent', function (data) {
      io.to(data.room).emit('courseContent', data)
    })
    socket.on('chat', function (data) {
      io.to(data.room).emit('chat', data)
    })
    socket.on('course', function (data) {
      io.to(data.room).emit('course', data)
    })
})
var api = require('./api.js');
app.use('/api', api);
var port = 4000;
app.listen(port);
