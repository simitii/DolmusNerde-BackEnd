var Cookie = require('./Cookie');
var cookieParser = require('socket.io-cookie-parser');
var DataLogger = require('../DataLogger');
//var Database = require('./Database');


module.exports=function(app){
	var allClients = [];
	var newClient = function(username,socket){
		var client = {};
		client.username = username;
		client.socket = socket;
		allClients.push(client);
		console.log(allClients);
	};
	var deleteClient = function(socket){
	  console.log('deleteClient');
	  for(var i = 0;i<allClients.length;i++){
	  	if(allClients[i].socket === socket){
        socket = null;
	  		allClients.splice(i, 1);
	  		break;
	  	}
	  }
	};
	var getIndexOfUsername = function(username){
		for (var i = allClients.length - 1; i >= 0; i--) {
			if(allClients[i].username === username){
				return i;
			}
		}
		return null;
	};
	var io = require('socket.io')(app);
	io.use(cookieParser());
	io.on('connection', function (socket) {
  	  cookie = Cookie.verifyAndGetData(socket.request.cookies.info);
      var ip = socket.request.connection.remoteAddress;
      DataLogger.logSocketIOCommunition(ip,'client','connection','');
  		if(cookie != undefined && cookie != null){
  			newClient(cookie.username,socket);
        //CONNECTION SUCCEED
  		}else{
  			socket.disconnect();
        	DataLogger.logSocketIOCommunition(ip,'server','disconnect','Authentication Error');
		  }
  		//handling socket removal from client list
  		socket.on('disconnect',function(){
        DataLogger.logSocketIOCommunition(ip,'client','disconnect','');
  			deleteClient(socket);
  		});
  		socket.on('message',function(message){
  			DataLogger.logSocketIOCommunition(ip,'client','message',message);
  			console.log(message);
  			var i = getIndexOfUsername(message.toWhom._id);
  			if(i !== undefined && i !== null){
  				console.log(i);
  				var recieverSocket = allClients[i].socket;
  				recieverSocket.emit('message',message);
          		DataLogger.logSocketIOCommunition(ip,'server','message',message);
  			}else{
  				//Store message in Database for future
  			}
  		});
	});
	return io;
}