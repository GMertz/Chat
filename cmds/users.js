var users = [];

exports.isUser = function (name){
	if(name.length === 0)
		return false;
	for(let u of users){
		if(u.name !== null)
			if (name.toLowerCase() === u.name.toLowerCase()){
				return u;
			}
	}
	return false;}
exports.getUser =  function(socketid){
	return getUsr(socketid);
}
exports.newUsr = function(socketid){
	var newuser = new user(socketid);
	users.push(newuser);
	return newuser.giveData;
}
exports.updateUser = function(socketid,info){
	u = getUsr(socketid).update(info)
	console.log(u);
	return u;
}
exports.delSess = function(socketid){
	var u = getUsr(socketid);
	if(u.name !== null){
		console.log(u.name,"... is gone sir");	
	}
	u = users.indexOf(u);
	users.splice(u,1);
	return true;}
function getUsr(id){
	for(var i = 0; i<users.length; i++){
		var u = users[i];
		if(u.id === id)
			return u;
	}
	console.log("no luck");
	return false;}

var user = function(id){
	this.sessId;
	this.name = null;
	this.id = id;
	this.notif = [false];
	this.pass = null;
	this.friends = [];
	this.messages = {};
	this.blocked = [];

	this.notify = function(type,senderid,data){
		if(this.isBlocked(getUsr(senderid).name) === true)
			return 0;
		this.notif[0] = true;
		if(type === 'Friend Request'){
			if(this.isFriend(getUsr(senderid))===false)
				this.notif.push([type,getUsr(senderid).name]);
			else
				this.notif.push([type,getUsr(senderid).name+" (added you back)"]);
		}else if(type === 'Private Message'){
			this.notif.push([type,getUsr(senderid).name,data]);
		}else if(type === 'Block'){
			this.notif.push([type,senderid]);
		}
	}
	this.giveData = function(){
		return {name:this.name,id:this.id};
	}
	this.update = function(info){
		if(info.name != undefined)
			this.name = info.name;
		return this.giveData;
	}
	this.addFriend = function(user){
		if(this.isBlocked(user.name) === false)
			this.friends.push(user);
	}
	this.removeFriend = function(user){
		var i = this.friends.indexOf(user);
		this.friends.splice(i,1);
		console.log("removed",user.name,"now, ",this.friends);
		return true;
	}
	this.isFriend = function(user){
		for(let f of this.friends){
			if(f === user){
				return true;
			}
		}
		return false;
	}
	this.newData = function(){
		if(this.notif[0] === false)
			return false;
		this.notif[0] = false;
		this.notif.slice(1);
		var info = this.notif.slice(1);
		this.notif = [false];
		return info;
	}
	this.printFriends = function(){
		var msg = '';
		for(let f of this.friends)
			msg+= f.name+ '\n ';
		return msg;
	}
	this.printBlocked = function(){
		var msg = '';
		for(let b of this.blocked)
			msg+= b+ '\n ';
		return msg;
	}
	this.block = function(user){
		if(this.isFriend(user))
			this.removeFriend(user)

		this.blocked.push(user);
		this.notify("Block",user.id);
		return true;
	}
	this.isBlocked = function(user){
		for(let b of this.blocked){
			if(b === user)
				return true;
		}
		return false;
	}
}