var Constants = require('./Constants');
var cookie = require('./Cookie');

exports.init = function(db){
	//Index For admin DB
	db.ensureIndex('admin',{'username':1},{unique: true,background:true});

	//Index For driver DB 
	db.ensureIndex('driver',{'phone':1},{unique:true,background:true});

	//Index For licence DB
	db.ensureIndex('licence',{'licence':1},{unique:true,background:true});

	//Create First Admin Account IF NOT EXIST
	createFirstAdminAccount(db);
};

function createFirstAdminAccount(db){
	db.find('admin',{},function(err,docs){
		if(err!=null){
			console.log(err);
			console.log("createFirstAdminAccount FAILED");
			return;
		}
		if(docs.length>=1){
			console.log("Admin Account Already Exist!");
		}else{
			var admin = {
				'username':Constants.Defaults.ADMIN_USERNAME,
				'pass':Constants.Defaults.ADMIN_PASS
			};
			db.insert('admin',admin,function(err){
				if(err!=null){
					console.log(err);
					console.log("createFirstAdminAccount FAILED");
				}else{
					console.log("Admin Account Successfully Created!");
				}
			});
		}
	});
};

exports.changeAdminPassword = function(db,req,res){
	if(req.body.username==undefined || req.body.pass==undefined || 
					req.body.username==null || req.body.pass==null){
		res.send(Constants.Responses.INVALID_INPUT);
		return;
	}
	db.update('admin',{'username':req.body.username},{$set:{'pass':req.body.pass}},function(err,r){
		if(err!=null){
			console.log(err);
			res.send(Constants.Responses.DB_ERROR);
		}else if(r.result.nModified<1){
			res.send(Constants.Responses.INVALID_INPUT);
		}else{
			res.send(Constants.Responses.SUCCESS);
		}
	});
};

exports.createNewAdminAccount = function(db,req,res){
	if(req.body.username==undefined || req.body.pass==undefined || 
					req.body.username==null || req.body.pass==null || req.body.username=='admin'){
		res.send(Constants.Responses.INVALID_INPUT);
		return;
	}
	var admin = {
		'username':req.body.username,
		'pass':req.body.pass
	};
	db.insert('admin',admin,function(err){
		if(err!=null){
			console.log(err);
			res.send(Constants.Responses.DB_ERROR);
		}else{
			console.log("Admin Account Successfully Created!");
			res.send(Constants.Responses.SUCCESS);
		}
	});
};

exports.login = function(db,req,res){
	if(req.body.username==undefined || req.body.pass==undefined || 
					req.body.username==null || req.body.pass==null){
		res.send(Constants.Responses.ACCESS_DENIED);
		return;
	}
	var admin = {
		'username':req.body.username,
	};
	db.find('admin',admin,function(err,docs){
		if(err!=null){
			res.send(Constants.Responses.DB_ERROR);
		}else if(docs.length<1){
			res.send(Constants.Responses.ACCESS_DENIED);
		}else{
			var user = docs[0];
			if(user.pass === req.body.pass){
				var data = {'loginTime':Date.now()};
				cookie.addToResponse(res,admin.username,data,Constants.UserTypes.ADMIN);
				res.send(Constants.Responses.SUCCESS);
			}else{
				res.send(Constants.Responses.ACCESS_DENIED);
			}
		}
	});
};

exports.deleteAdminAccount = function(db,req,res){
	if(req.body.username==undefined || req.body.username==null || req.body.username=='admin'){
		res.send(Constants.Responses.INVALID_INPUT);
		return;
	}
	db.remove('admin',{'username':req.body.username},function(err){
		if(err!=null){
			console.log(err);
			res.send(Constants.Responses.DB_ERROR);
		}else{
			console.log("Admin Account Successfully Deleted!");
			res.send(Constants.Responses.SUCCESS);
		}
	});
};
