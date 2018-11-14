var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	cmds = require('./cmds'),
	users = require('./cmds/users.js');

app.get('/',function(req,res){
	res.sendFile(__dirname + '/chat-client.html');
});

/*
Things to add
	session cookies
	private messages div
	command alias' (other names for existing commands (/n or /name))

*/
io.on('connection', function(socket){

	socket.emit("user data",users.newUsr(socket.id));

	socket.emit("server message", "Log-in with /n <name> ! \n (Type /help to for more information on commands)");
	
	socket.on('chat message', function(msg){

		//if you arent logged in, you can only use '/n' and '/help' commands
		if(users.getUser(socket.id).name === null && msg.slice(0,5) !== '/help' && msg.slice(0,2) !== '/n'){
			socket.emit('server message', 
					"You are not logged on! use '/n <name>' to set a name and log on!");
		//commands
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
	
	//client frequently requests updates to check for notifications
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
