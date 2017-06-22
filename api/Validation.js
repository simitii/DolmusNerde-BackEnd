var isValidNumber = require('libphonenumber-js').isValidNumber;
var phoneNOParser = require('libphonenumber-js').parse;

exports.phone = function(db,phone,callback){ 
	if(phone==undefined || !isValidNumber(phone,'TR')){
		callback(false);
	}else{
		phone = phoneNOParser(phone,"TR").phone;
		db.find('driver',{'phone':phone},function(err,docs){
			if(err === null && docs.length == 0){
				callback(true);
			}else{
				callback(false);
			}
		});
	}
};

exports.name = function(name){
	return name!=undefined && name.match(/^[a-zA-Z ]{2,30}$/);
};

exports.licence = function(licence,db,callback){
	var query = {
		'licence' : licence
	};
	db.find('licence',query,function(err,docs){
		if(err === null && docs.length == 1 && docs[0].used == false){
			callback(true);
		}else{
			callback(false);
		}
	});
};