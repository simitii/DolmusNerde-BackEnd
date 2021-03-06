var http = require('http');
var https = require('https');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var DataLogger = require('./DataLogger');

//logging usage statistics reqularly(per minute)
DataLogger.logUsageStatistics();


// import api route
var api = require('./api/Api'); 

//ssl security (https) configuration
//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

// create servers
var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);


// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// for parsing cookies
app.use(cookieParser()); 


app.use(function(req,res,next){
	DataLogger.logHttpCommunication(req.headers['x-real-ip'],'client',req.cookies,req.body,req.originalUrl,req.files);
	res.sendResponse = res.send;
	res.send = function(response){
		DataLogger.logHttpCommunication(req.headers['x-real-ip'],'server',res.cookieSended,response,req.originalUrl,undefined);
		res.sendResponse(response);
	};
	next();
});


// api route
app.use('/api/',api);

//opening page
app.use('/', function (req, res) {
	res.send("Server is up!");
});

var port = process.env.PORT || 3000;

// start servers
httpServer.listen(port,function(){
	console.log('HTTP SERVER listening on port ' + port);
}); 

/*
httpsServer.listen(8443,function(){
	console.log('HTTPS SERVER listening on port 8443!');
});  

*/