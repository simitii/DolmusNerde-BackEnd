var cookie = require('./Cookie');
var validate = require('./Validation');
var phoneNOParser = require('libphonenumber-js').parse;
var phoneNOFormat = require('libphonenumber-js').format;
var Constants = require('./Constants');

exports.register = function(db,req,res){
	var driver = {};
	driver.name = req.body.name;
	driver.phone = req.body.phone;
	driver.licence = req.body.licence;
	if(!validate.phone(driver.phone)){
		res.send(Constants.Responses.INVALID_PHONE);
		return;
	}
	driver.phone = phoneNOParser(driver.phone).phone;
	if(!validate.name(driver.name)){
		res.send(Constants.Responses.INVALID_NAME); 
		return;
	}
	validate.licence(driver.licence,db,function(success){
		if(success){
			db.insert('driver',driver,function(err){
				if(err === null){
					var data = {
						'name' : driver.name,
						'licence': driver.licence,
					}
					cookie.addToResponse(res,driver.phone,data,Constants.UserTypes.DRIVER);
					res.send(Constants.Responses.SUCCESS);
					setLicenceStatusUsed(driver.licence);
				}
				else
					res.send(Constants.Responses.DB_ERROR);
			});
		}else{
			res.send(Constants.Responses.INVALID_LICENCE);
		}
	});
	function setLicenceStatusUsed(licence){
		db.update('licence',{licence:licence},{$set:{used:true}},function(err,r){
			if(err!=null || r.result.nModified<1){
				console.log("!!!!!!!!!!ACTION NECCESSARY!!!!!!!!!");
				console.log("LICENCE CODE : " + licence);
				console.log("LICENCE USED BUT STATUS COULDN'T BEEN UPDATED.\nPLEASE UPDATE MANUALLY!!!");
			}
		});
	};
};

exports.delete = function(db,req,res){
	var phone = req.body.phone;
	if(!validate.phone(driver.phone)){
		res.send(Constants.Responses.INVALID_PHONE);
		return;
	}
	db.remove('driver',{phone:phone},function(err,r){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
			return;
		}
		if(r.result.nModified<1){
			res.send(Constants.Responses.INVALID_PHONE);
		}else{
			res.send(Constants.Responses.SUCCESS);
		}
	});
}


exports.generateLicences = function(db,req,res){
	/*if(req.loginData.type != Constants.UserTypes.ADMIN){
		res.send(Constants.Responses.ACCESS_DENIED);
		return;
	}*/
	function generateLicence(){
		var str = "";
		for(var i=0;i<9;i++){
			str += (Math.floor(Math.random() * 36)).toString(36);
		}
		return str.toUpperCase();
	};
	var numberOfLicences = req.body.numberOfLicences;
	var currentLicences = [];
	var newLicences = [];
	db.find('licence',{},function(err,docs){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
			return;
		}
		if(docs.length>0){
			currentLicences = docs.map(function(doc){
				return doc.licence;
			});
		}
	});
	for(var i=0;i<numberOfLicences;i++){
		var licence = generateLicence();
		while(currentLicences.indexOf(licence)!=-1){
			licence = generateLicence();
		}
		newLicences.push(licence);
		currentLicences.push(licence);
	}
	newLicences = newLicences.map(function(licence){
		return {'licence':licence,used:false,given:false};
	});
	db.insertMany('licence',newLicences,function(err){
		if(err===null){
			res.send(newLicences);
		}else{
			res.send(Constants.Responses.DB_ERROR);
		}
	});
};

exports.setLicenceStatusToGiven = function(db,req,res){
	/*if(req.loginData.type != Constants.UserTypes.ADMIN){
		res.send(Constants.Responses.ACCESS_DENIED);
		return;
	}*/
	var licences = [];
	if(req.body.licence!=undefined && req.body.licence!=null){
		licences = licences.concat(req.body.licence);
	}
	db.update('licence',{licence: {$in : licences} },{ $set : {given:true} },function(err,r){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
			return;
		}
		if(r.result.nModified<1){
			res.send(Constants.Responses.INVALID_LICENCE);
		}else{
			res.send(Constants.Responses.SUCCESS);
		}
	});
};

exports.setLicenceStatusToNotGiven = function(db,req,res){
	/*if(req.loginData.type != Constants.UserTypes.ADMIN){
		res.send(Constants.Responses.ACCESS_DENIED);
		return;
	}*/
	var licences = [];
	if(req.body.licence!=undefined && req.body.licence!=null){
		licences = licences.concat(req.body.licence);
	}
	db.update('licence',{licence: {$in : licences} },{ $set : {given:false} },function(err,r){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
			return;
		}
		if(r.result.nModified<1){
			res.send(Constants.Responses.INVALID_LICENCE);
		}else{
			res.send(Constants.Responses.SUCCESS);
		}
	});
};

exports.getNotGivenLicences = function(db,req,res){
	db.find('licence',{given:false},function(err,docs){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
		}else{
			docs = docs.map(function(doc){
				return doc.licence;
			});
			res.send(docs);
		}
	});
};

exports.getLicenceUsage = function(db,req,res){
	if(req.body.licence==undefined || req.body.licence==null){
		res.send(Constants.Responses.INVALID_LICENCE);
	}else{
		db.find('driver',{licence:req.body.licence},function(err,docs){
			if(err!=null){
				res.send(Constants.Responses.DB_ERROR);
				return;
			}else{
				docs = docs.map(function(doc){
					return {
						'Licence':doc.licence,
						'DriverName':doc.name,
						'DriverPhone':phoneNOFormat(doc.phone,'TR','International')
					};
				});
			}
		});
	}
};

exports.deleteLicence = function(db,req,res){
	if(req.body.licence==undefined || req.body.licence==null){
		res.send(Constants.Responses.INVALID_LICENCE);
		return;
	}
	db.find('driver',{licence:req.body.licence},function(err,docs){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
			return;
		}
		if(docs.length>0){
			res.send(Constants.Responses.THERE_IS_REGISTERED_DRIVER_TO_THE_LICENCE);
		}else{
			deleteLicence(req.body.licence);
		}
	});
	function deleteLicence(licence){
		db.remove('licence',{licence:licence},function(err,r){
			if(err!=null){
				res.send(Constants.Responses.DB_ERROR);
				return;
			}
			if(r.result.nModified<1){
				res.send(Constants.Responses.INVALID_LICENCE);
			}else{
				res.send(Constants.Responses.SUCCESS);
			}
		});
	}
};


exports.pushPositionData = function(req,res,db){
	//TODO  GET DATA FROM req.body and PUSH NOTIFICATION USING ONESIGNAL
};


/*
var sendSmsKey = function(db,phone,callback){
	var query = {};
	query.phone = phone;
	var smsKey = Math.floor((Math.random() * 9000) + 1000);
	db.update('driver',query,{$set : {'smsKey':smsKey}},function(err,res){
		if(err === null){
			if(res.result.nModified<1){
				callback(false); //Invalid PHONE
			}else{
				//VALID PHONE
				//TODO SEND THE SMS
				callback(true);
			}
		}else{
			console.log(err);
			callback(false); // DB ERROR
		}
	});
};
*/

