exports.UserTypes = {
	'DRIVER': 0,
	'ADMIN' : 9,
	'USER'  : 1,
};

exports.Responses = {
	'SUCCESS' : '1',
	'INVALID_PHONE' : '2',
	'INVALID_LICENCE' : '3',
	'INVALID_NAME' : '4',
	'INVALID_INPUT': '5',
	'NO_ACTIVE_MINIBUS': '6',
	'THERE_IS_REGISTERED_DRIVER_TO_THE_LICENCE': '7',
	'DB_ERROR' : '9',
	'INVALID_SUBPATH' : '10',
	'ACCESS_DENIED' : '17',
	'MAIL_SERVER_ERROR': '19',
};

exports.Defaults = {
	'ADMIN_USERNAME': 'admin',
	'ADMIN_PASS': 'admin',
	'DEAD_LIMIT': 100000, // 100 seconds = 1min 40sec
	'GARBAGE_INTERVAL': 120000 // 120 seconds = 2min
}

exports.AdminEmails = ["kaandura@gmail.com","400180sd@gmail.com"];
