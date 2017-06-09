var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var FileUpload = require('./api/FileUpload');
var DataLogger = require('./DataLogger');

//logging usage statistics reqularly(per minute)
require('./DataLogger').logUsageStatistics();


// import api route
var api = require('./api/Api'); 

//ssl security (https) configuration
//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

// create servers
var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

// start socket-io
//socket.start(httpServer);

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// for parsing cookies
app.use(cookieParser()); 

// for parsing files
app.use(function(req,res,next){
	FileUpload(req,res,function(err){
		next();
	});
});

app.use(function(req,res,next){
	DataLogger.logHttpCommunication(req.ip,'client',req.cookies,req.body,req.originalUrl,req.files);
	res.sendResponse = res.send;
	res.send = function(response){
		DataLogger.logHttpCommunication(req.ip,'server',res.cookieSended,response,req.originalUrl,undefined);
		res.sendResponse(response);
	};
	next();
});

// api route
app.use('/api/',api);

//opening page
app.use('/', function (req, res) {
	res.send("opening page!");
});


// import socket module which manages connection over WebSocket(socket.io) 
var io = require('./api/Socket')(httpServer);
if(io !== undefined && io !== null){
	console.log("socket-io successfully started");
}else{
	console.log("socket-io failed");
}

var port = process.env.PORT || 8080;

// start servers
httpServer.listen(port,function(){
	console.log('HTTP SERVER listening on port 8080!');
}); 

/*
httpsServer.listen(8443,function(){
	console.log('HTTPS SERVER listening on port 8443!');
});  

*/