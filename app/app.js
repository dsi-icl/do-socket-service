
var express = require('express');
var app = express();


var cors = require('cors');
app.use(cors());


var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');



app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/about.html');
});


var socket = io.of('/dsistatic');
socket.on('connection', function(client) {
    var clientIP = client.request.connection.remoteAddress;
    console.log('Client '+ clientIP +' connected...');

	client.on('messages', function(data) {
      client.emit('broad', data);
      client.broadcast.emit('broad',data);
  });
});


server.listen(process.env.PORT || 8080);
