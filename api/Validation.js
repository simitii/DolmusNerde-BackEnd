var isValidNumber = require('libphonenumber-js').isValidNumber;
exports.phone = function(phone){ 
  	return phone!=undefined && isValidNumber(phone,'TR');
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