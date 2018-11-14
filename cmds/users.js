var users = [];

/* -----  Exports  -----*/
exports.online = function (){return users.length;}
exports.isUser = function (name){
	if(name.length === 0)
		return false;
	for(let u of users){
		if(u.name !== null)
			if (name.toLowerCase() === u.name.toLowerCase()){
				return u;
			}
	}
	return false;
}

//return the user for a given socket id
exports.getUser =  function(socketid){
	return getUsr(socketid);
}

//create a new user, connected on the given socket
exports.newUsr = function(socketid){
	var newuser = new user(socketid);
	users.push(newuser);
	return newuser.giveData;
}

//update a users information with the given info
exports.updateUser = function(socketid,info){
	u = getUsr(socketid).update(info)
	console.log(u);
	return u;
}

//delete the user account of someone who logged off
exports.delSess = function(socketid){
	var u = getUsr(socketid);
	if(u.name !== null)
		console.log(u.name,"logged off");	
	u = users.indexOf(u);
	users.splice(u,1);
	return true;
}

//get user helper function
function getUsr(id){
	for(var i = 0; i<users.length; i++){
		var u = users[i];
		if(u.id === id)
			return u;
	}
	return false;
}

//user class
var user = function(id){

	this.sessId;
	this.name = null;
	this.id = id;
	this.notif = [false];
	this.pass = null;
	this.friends = [];
	this.messages = {};
	this.blocked = [];

	//send a notificatoin to the user
	this.notify = function(type,senderid,data){
		//if user is blocked, dont notify
		if(this.isBlocked(getUsr(senderid).name) === true)
			return 0;
		//activate new notification flag
		this.notif[0] = true;

		//format notification and add to notifications
		if(type === 'Friend Request'){
			if(this.isFriend(getUsr(senderid))===false)
				this.notif.push([type,getUsr(senderid).name]);
			else
				this.notif.push([type,getUsr(senderid).name+" (added you back)"]);
		}else if(type === 'Private Message')
			this.notif.push([type,getUsr(senderid).name,data]);
		else if(type === 'Block')
			this.notif.push([type,senderid]);
		
	}

	//supply the data for this user
	this.giveData = function(){
		return {name:this.name,id:this.id};
	}

	//update data and return new data
	this.update = function(info){
		if(info.name != undefined)
			this.name = info.name;
		return this.giveData;
	}

	//add a friend to friend list, unless blocked
	this.addFriend = function(user){
		if(this.isBlocked(user.name) === false)
			this.friends.push(user);
	}

	//remove a friend from friend list
	this.removeFriend = function(user){
		var i = this.friends.indexOf(user);
		this.friends.splice(i,1);
		console.log("removed",user.name,"now, ",this.friends);
		return true;
	}

	this.isFriend = function(user){
		for(let f of this.friends)
			if(f === user)return true;
		return false;
	}

	//if there is new info, return it
	this.newData = function(){
		if(this.notif[0] === false)
			return false;
		this.notif[0] = false;
		this.notif.slice(1);
		var info = this.notif.slice(1);
		this.notif = [false];
		return info;
	}

	//return formated list of friends names
	this.printFriends = function(){
		var msg = '';
		for(let f of this.friends)
			msg+= f.name+ '\n ';
		return msg;
	}

	//same as above but for blocked list
	this.printBlocked = function(){
		var msg = '';
		for(let b of this.blocked)
			msg+= b.name+ '\n ';
		return msg;
	}
	
	//block a user by name
	this.block = function(user){
		if(this.isFriend(user))
			this.removeFriend(user)

		this.blocked.push(user);
		this.notify("Block",user.id);
		return true;
	}
	
	this.isBlocked = function(user){
		for(let b of this.blocked)
			if(b === user)return true;
		return false;
	}
}