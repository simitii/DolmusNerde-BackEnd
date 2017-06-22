const Email = require('./Email');
const Constants = require('./Constants');

/**
 *	req.body.err should be defined!
 */
exports.errorReport = function(req,res){
	if(req.body.err===undefined || req.body.err===null){
		res.send(Constants.Responses.INVALID_INPUT);
	}else{
		var subject = "Error Report #" + Date.now();
		var error = req.body.err;
		Email.sendToAdmins(subject,error,function(result){
			res.send(result);
		});
	}
};

/**
 *	req.body.subject should be defined!
 *  req.body.text should be defined!
 *  req.body.contact should be defined!
 */
exports.tellUs = function(req,res){
	if(req.body.subject===undefined || req.body.subject===null 
		||req.body.text===undefined || req.body.text===null
		||req.body.contact===undefined || req.body.contact===null){
		res.send(Constants.Responses.INVALID_INPUT);
	}else{
		var subject = "Contact #" + Date.now() + " : " + req.body.subject;
		var text = req.body.text + "\n\n\nCONTACT=> " + req.body.contact;
		Email.sendToAdmins(subject,text,function(result){
			res.send(result);
		});
	}
};