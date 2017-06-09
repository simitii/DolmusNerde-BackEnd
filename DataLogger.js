var os = require("os");
var fs = require("fs");
var PATH = './logs/';


exports.logHttpCommunication = function(ip,sender,cookie,message,url,files){
	var filePath = PATH + 'HttpLogs';
	var log = "================ HTTP Log ================\n";
	log += "Date                      : " + new Date() + "\n";
	log += "Sender                    : " + sender + "\n";
	log += "IP Address                : " + ip + "\n";
	log += "URL                       : " + url + "\n";
	log += "Cookie                    : " + JSON.stringify(cookie) + "\n";
	log += "Data                      : " + JSON.stringify(message) + "\n";
	log += "Files                     : " + JSON.stringify(files) + "\n";
	log += "=============================================================" + "\n";
	log += "\n";
	fs.writeFile(filePath,log,{'flag':'a'},function(err){
		console.log('Http Communication Logged!');
	});
};

exports.logDataBaseInput = function(input){
	var filePath = PATH + 'DataBaseInputLogs';
	var data = JSON.stringify(res);
	fs.writeFile(filePath,data,{'flag':'a'},function(err){
		console.log('DataBase Input Logged!');
	});
};

exports.logDataBaseOutput = function(output){
	var filePath = PATH + 'DataBaseOutputLogs';
	var data = JSON.stringify(res);
	fs.writeFile(filePath,data,{'flag':'a'},function(err){
		console.log('DataBase Output Logged!');
	});
};

exports.logSocketIOCommunition = function(ip,sender,on,data){
	var filePath = PATH + 'SocketIOLogs';
	var log = "================ Socket-IO Log ================\n";
	log += "Date                      : " + new Date() + "\n";
	log += "IP Address                : " + ip + "\n";
	log += "Sender                    : " + sender + "\n";
	log += "On                        : " + on + "\n";
	log += "Data                      : " + JSON.stringify(data) + "\n";
	log += "=============================================================" + "\n";
	log += "\n";
	fs.writeFile(filePath,log,{'flag':'a'},function(err){
		console.log('Socket-IO Communication Logged!');
	});
};

exports.logUsageStatistics = function(){
	var filePath = PATH + 'UsageStatistics';
	var counter = 1;
	setInterval(function(){
		var totalmem = os.totalmem();
		var usedmem = totalmem - os.freemem();
		var data = "================ " + "System Log #" + counter + " ================\n";
		counter++;
		data += "Date                      : " + new Date() + "\n";
		data += "Online User               : " + 0 + "\n";
		data += "Trafic(Number of request) : " + 0 + "\n";
		data += "CPU Usage                 : %" + os.loadavg()[0] + "\n";
		data += "RAM Usage                 : %" + (usedmem/totalmem)*100 + "\n";
		data += "DISK Usage                : %" + 0 + "\n";
		data += "NETWORK Usage             : %" + 0 + "\n";
		data += "=============================================================" + "\n";
		data += "\n";
		fs.writeFile(filePath,data,{'flag':'a'},function(err){
			console.log('Scheduled System Info Logged!');
		});
	},60000);
};