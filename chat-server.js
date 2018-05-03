var app = require('express')();//funtion handler you can supply to http server
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cmds = require('./cmds');//;
var users = require('./cmds/users.js');
//init socket with http server
app.get('/',function(req,res){//route handeler '/' gets called when we hit website home
	res.sendFile(__dirname + '/chat-client.html');
});

/*
Things I would Add with more time
	cookies
		give each user a unique ID, when a new user logs on (makes a name) 
		connect their sessionID to their socketID if they have cookie
		maybe add in last visit time to users, and any user that doesnt visit for a day gets deleted

	private messages div
	command alias' (other names for existing commands (/n or /name))

*/
io.on('connection', function(socket){
	socket.emit("user data",users.newUsr(socket.id));
	socket.emit("server message", "Log-in with /n <name> ! \n (Type /help to for more information on commands)");
	socket.on('chat message', function(msg){
		console.log('message received from: ',socket.id);
		if(users.getUser(socket.id).name === null && msg.slice(0,5) !== '/help' && msg.slice(0,2) !== '/n'){
			console.log(users.getUser(socket.id));
			console.log("message received from unnamed user")
				socket.emit('server message', 
					"You are not logged on! use '/n <name>' to set a name and log on!");
		}else if(msg[0] == '/'){
			var res = cmds.run(msg.slice(1),socket.id);
			if(res !== true){
				if(res.dest === socket.id)
					socket.emit(res.type,res.msg);
				if(res.data !== null)
					socket.emit(res.e.type, res.e.data);
			}
		}else{
			msg = users.getUser(socket.id).name + ": " + msg;
			socket.broadcast.emit('chat message', msg, socket.id);
		}
	});
	socket.on('request update',function(){	
		var info = cmds.getChanges(socket.id);
		socket.emit('count',users.online());
		if(info !== false)
			socket.emit('notif',info);
	});
	socket.on('disconnect', function(){
		users.delSess(socket.id);

	});
});

http.listen(3000,function(){
	console.log('listening on *:3000');//make http server listen on port 3000
});

function getUniqueId(){
	return 5;
}

/*socket io is 2 parts, 
A server that integrates with (or mounts on)
the Node,JS HTTP Server: socket.io
A client library that loads on the brower side: socket.io-client
*/
/*
Socket.IO can send and receive any events you want, with any data you want.
Any object that can be encoded as JSON, binary data also supported
*/