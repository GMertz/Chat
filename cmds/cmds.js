var users = require('./users.js');
var cmds = [//to add, block, print blocked, remove friend
{n:"n",f:rname,d:"/n <name> \n  sets users name to <name>"},
{n:"add",f:add,d:"/add <name-1> ... <name-n> \n  send users friend request"},
{n:"msg",f:msg,d:"/msg <name> <message> \n  Send a friend a message"},
/*{n:"whois",f:users.isUserm,d:"/whois <name> \n  Check who user <name> is"},*/
{n:"help",f:help,d:"/help \n  You just used this one!"},
{n:"friends",f:prntFriends,d:"/friends prints all friends"},
{n:"block",f:block,d:"/block <name-1> ... <name.n> \n  Block some jerks"},
{n:"rm",f:removeFriend,d:"/rm <name-1> ... <name-n> \n  Un-friend a person"},
{n:"blocked",f:prntBlocked,d:"/blocked \n  print all people you've blocked"}];

/* -----  Exports  -----*/
exports.run =function(cmd,socketid){//test
	var args = cmd.split(" ");
	var cmd = args[0];
	var res = null;
	for(var i = 0; i<cmds.length; i++){
		var c = cmds[i];
		if(c.n === cmd){
			res = c.f(args.slice(1),socketid);
		}
	}
	if(res === null)
		return resultify("No command named: |" + cmd + "| found!",false,socketid,"server message");
	return res;
}
exports.getChanges = function(socketid){
	var user = users.getUser(socketid);
	var info = user.newData();
	if(info === false)
		return false;

	return info;
}

/* ------   Commands  ------ */
function help(args,socketid){
	var msg = '';
	for(let cmd of cmds){
		msg += cmd.d+ '\n';
	}
	return resultify(msg,true,socketid,'server message');
}
function printu(args,socketid){//test
	return resultify("sorry, I killed this cmd.",true,socketid,'server message');
}
function rname(args, socketid){//seems to work
	if(args.length != 1)
		return resultify("Invalid amount of arguments, name should be a single word, no spaces.", false, socketid, 'server message');
	var name = args[0];
	if(users.isUser(name) !== false)
		return	resultify("Name already in use!", false, socketid, 'server message');
	if(validName(name) === false)
		return resultify("Invalid name! Please use only letters and numbers.", false, socketid, 'server message');
	console.log(socketid,"Is now: ",name);
	var res = users.updateUser(socketid,{name:name});
	return resultify("Name changed to: "+name, true, socketid, 'server message',{data:res,type:"user data"});
}
function add(args, socketid){//wip
	var me = users.getUser(socketid);
	var unadded = [];
	for (let a of args){
		var friend = users.isUser(a);
		if(friend !== false && friend !== me){
			if(me.isFriend(friend) === false){//test, add console.logz if still not work
				friend.notify("Friend Request",socketid);
				me.addFriend(friend);
			}else
				unadded.push(friend.name+"(already on your friend list)");
		}
		else
			unadded.push(a);
	}
	if(unadded.length === 0)
		return resultify("added "+ args.join(', '),true,socketid,'server message');
	return resultify("Unable to add: " + unadded.join(', ') ,false,socketid,'server message');

}
function msg(args, socketid){
	var me = users.getUser(socketid);
	var receiver = args[0];
	var u = users.isUser(receiver); 
	if(me === u)
		return resultify("dont you have any friends to message?",false,socketid,'server message');
	if(me.isFriend(u) === false)
		return resultify(receiver+" isn't on your friend list, add them with /add!",false,socketid,'server message');
	if(u.isFriend(me) === false)
		return resultify(u.name +" hasn't added you yet!, awkward",false,socketid,'server message');

	var message = args.slice(1).join(' ');
	u.notify('Private Message',me.id,message);
	return true;
}
function prntFriends(args,socketid){return resultify(users.getUser(socketid).printFriends(),true,socketid,'server message');}
function prntBlocked(args,socketid){return resultify(users.getUser(socketid).printBlocked(),true,socketid,'server message');}
function block(args, socketid){//finish this
	var me = users.getUser(socketid);
	var unblocked = [];
	for (let a of args){
		var jerk = users.isUser(a);
		if(jerk !== false && jerk !== me){
			if(me.isBlocked(jerk) === false){//test, add console.logz if still not work
				me.block(jerk);
			}else
				unblocked.push(jerk.name+"(already on your blocked list)");
		}
		else
			unblocked.push(a);
	}
	if(unblocked.length === 0)
		return resultify("blocked "+ args.join(', '),true,socketid,'server message');
	return resultify("Unable to block: " + unblocked.join(', ') ,false,socketid,'server message');

}
function removeFriend(args,socketid){//make this, add comands for this and above
	var me = users.getUser(socketid);
	var unremoved = [];
	for (let a of args){
		var friend = users.isUser(a);
		if(friend !== false && friend !== me){
			if(me.isFriend(friend) === true){
				me.removeFriend(friend);
			}else
				unremoved.push(friend.name+"(not a friend)");
		}
		else
			unremoved.push(a);
	}
	if(unremoved.length === 0)
		return resultify("removed "+ args.join(', '),true,socketid,'server message');
	return resultify("Unable to remove: " + unremoved.join(', ') ,false,socketid,'server message');	
}


/* -----  AUX Functions  -----*/
function validName(name){
	for(var i = 0; i <name.length; i++){
		var c = name[i].charCodeAt();
		if(c <'0'.charCodeAt() || 
			(c >'9'.charCodeAt() && c <'A'.charCodeAt()) || 
			(c >'Z'.charCodeAt() && c <'a'.charCodeAt()) || 
			(c >'z'.charCodeAt()) ){
			console.log("lmao you cant name urself ",name);
			return false;
		}
	}
	return true;
}
function resultify(msg,res,dest,type,data){
	data = {};
	data.msg = msg;
	data.res = res;
	data.dest = dest;
	data.type = type;
	data.e = (data.data,data.type)|| null
	return data;
}

