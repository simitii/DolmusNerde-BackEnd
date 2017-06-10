var router = require('express').Router()
var db = require('./DataBase');
var driver = require('./Driver');
var cookie = require('./Cookie');
var Constants = require('./Constants');
var admin = require('./Admin');

var dbConnect = function(callback){
	db.connect(function(err){
		if(err === null){
			console.log("DB CONNECTED!");
			callback(true);
		}
		else{
			console.log("DB CONNECTION FAILED!");
			console.log(err);
			callback(false);
		}
	});
}

dbConnect(function(success){
	if(success){
		admin.init(db);
	}else{
		console.log("Initial Settings Failed Because DB Connection Failed!");
	}
});

//MiddleWares

// CHECKS DB CONNECTION
router.use(function(req,res,next){
	function isDBNeeded(path){
		switch(path){
			// DB_NEEDED
			case '/adminLogin':
			case '/createNewAdminAccount':
			case '/changeAdminPassword':
			case '/deleteAdminAccount':
			case '/driverRegister': 
			case '/driverDelete': 
			case '/generateLicences':
			case '/setLicenceStatusToGiven':
			case '/setLicenceStatusToNotGiven':
			case '/getNotGivenLicences':
			case '/getLicenceUsage':
			case '/deleteLicence':
				return true;
			// DB_NOT_NEEDED
			case '/logout':
			case '/pushPositionData':
				return false;

			default : return false;
		}
	};
	if(isDBNeeded(req.path) && !db.isConnected()){
		dbConnect(function(success){
			if(success){
				next();
			}else{
				res.send(Constants.Responses.DB_ERROR);
			}
		});
	}else{
		next();
	}
});

// CHECKS NECCESSARY PERMISSIONS
router.use(function(req,res,next){
	function hasPermissionsNeeded(path,loginData){
		switch(path){
			// Permissions.NO_NEED
			case '/adminLogin':
			case '/driverRegister':
			case '/logout': 
				return true;

			// Permissions.DRIVER
			case '/pushPositionData':
				return loginData!=null && loginData.usertype == Constants.UserTypes.DRIVER;

			// Permissions.ADMIN
			case '/createNewAdminAccount':
			case '/changeAdminPassword':
			case '/deleteAdminAccount':
			case '/driverDelete': 
			case '/generateLicences':
			case '/setLicenceStatusToGiven':
			case '/setLicenceStatusToNotGiven':
			case '/getNotGivenLicences':
			case '/getLicenceUsage':
			case '/deleteLicence':
				return loginData!=null && loginData.usertype == Constants.UserTypes.ADMIN;

			default : return true;
		}
	};
	req.loginData = cookie.verifyAndGetData(req.cookies.info);
	var access = hasPermissionsNeeded(req.path,req.loginData);
	if(access){
		next();
	}else{
		res.send(Constants.Responses.ACCESS_DENIED); //access denied
	}
});

// split up route handling
//=========USER-IN-GENERAL====
router.use('/logout',function(req,res){
	res.clearCookie("info");
	res.send(Constants.Responses.SUCCESS);
});

//=========ADMIN==============
router.use('/createNewAdminAccount',function(req,res){
	admin.createNewAdminAccount(db,req,res);
});

router.use('/adminLogin',function(req,res){
	admin.login(db,req,res);
});
router.use('/changeAdminPassword',function(req,res){
	admin.changeAdminPassword(db,req,res);
});
router.use('/deleteAdminAccount',function(req,res){
	admin.deleteAdminAccount(db,req,res);
});

//=========DRIVER=============

router.use('/driverRegister', function(req,res){
	driver.register(db,req,res);
});
router.use('/driverDelete', function(req,res){
	driver.delete(db,req,res);
});

//=========LICENCE===========
router.use('/generateLicences',function(req,res){
	driver.generateLicences(db,req,res);
});
router.use('/setLicenceStatusToGiven',function(req,res){
	driver.setLicenceStatusToGiven(db,req,res);
});
router.use('/setLicenceStatusToNotGiven',function(req,res){
	driver.setLicenceStatusToNotGiven(db,req,res);
});
router.use('/getNotGivenLicences',function(req,res){
	driver.getNotGivenLicences(db,req,res);
});
router.use('/getLicenceUsage',function(req,res){
	driver.getLicenceUsage(db,req,res);
});
router.use('/deleteLicence',function(req,res){
	driver.deleteLicence(db,req,res);
});

router.use('/pushPositionData',function(req,res){
	driver.pushPositionData(db,req,res);
});


//========INVALID_SUBPATH======
router.use('/',function(req,res){
	res.send(Constants.Responses.INVALID_SUBPATH);
});

// return the router
module.exports = router;
