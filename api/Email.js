const nodemailer = require('nodemailer');
const Constants = require('./Constants');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'minibusnerede@gmail.com',
    pass: 'qwertyklavye'
  }
});

/**
 * subject => subject string
 * text => text string
 * to => e-mail address array
 */
var send = function(subject,text,to,callback){
	var fixedTo = "";
	if(Array.isArray(to)){
		for(var i=0;i<to.length;i++){
			if(i>0){
				fixedTo += ", ";
			}
			fixedTo += to[i];
		}
	}else if(to===null || to===undefined){
		console.log("@param to must set properly!");
		if(callback!==undefined && callback!==null)
			callback(Constants.Responses.INVALID_INPUT);
	}else{
		fixedTo = to;
	}
	var mailOptions = {
	  from: 'minibusnerede@gmail.com',
	  to: fixedTo,
	  subject: subject,
	  text: text
	};
	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	    if(callback!==undefined && callback!==null)
	    	callback(Constants.Responses.MAIL_SERVER_ERROR);
	  } else {
	    console.log('Email sent: ' + info.response);
	    if(callback!==undefined && callback!==null)
	    	callback(Constants.Responses.SUCCESS);
	  }
	});
};
exports.send = send;

exports.sendToAdmins = function(subject,text,callback){
	send(subject,text,Constants.AdminEmails,callback);
};