var crypto = require("crypto");

//setting key
var serverKey = '1#Hello World, I am The Fucker!#2';


function hmac(data, key){
	data = JSON.stringify(data);
	var hmac = crypto.createHmac('sha1', key);
	hmac.setEncoding('hex');
	hmac.write(data);
	hmac.end();
	var hash = hmac.read();
	return hash;
}

function cipher(data,key){
	data = JSON.stringify(data);
	var cipher = crypto.createCipher('aes192', key);
	cipher.write(data,'utf8');
	cipher.end();
	var encrypted = cipher.read();
	encrypted = encrypted.toString('hex');
	return encrypted;
}

function decipher(encryptedData,key){
	var decipher = crypto.createDecipher('aes192', key);
	decipher.write(encryptedData,'hex');
	decipher.end();
	var decrypted = decipher.read();
	decrypted =decrypted.toString('utf8');
	return JSON.parse(decrypted);
}

/*
 * verifies given cookie and 
 * returns hidden data inside
 * the cookie
 * @param cookie  given cookie
 * @return data   hidden data
 * if verification fails, it 
 * returns null
 */
exports.verifyAndGetData = function(cookie){
	if(cookie === undefined){
		return null;
	}
	//getting info located in cookie
	var phone = cookie.phone;
	var encryptedData = cookie.data;
	var hash = cookie.hash;  
 	var object = {};
 	object['phone'] = phone;
 	var key = hmac(object,serverKey);
 	var data = decipher(encryptedData,key);
 	object = {};
 	object['phone'] = phone;
 	object['data'] = data;
 	object['serverKey'] = serverKey;
 	var verificationCode = hmac(object,key);
 	if(verificationCode !== hash){
 		return null;
 	}
 	data['phone'] = phone;
 	return data;
}
function create(info){
	var phone = info.phone;
	//30 days expiration time
	var data = info.data;
	var object = {};
	object['phone'] = phone;
	var key = hmac(object,serverKey);
	var encryptedData = cipher(data,key);
	object = {};
	object['phone'] = phone;
	object['data'] = data;
	object['serverKey'] = serverKey;
	var hash = hmac(object,key);
	var cookie = {};
	cookie['phone'] = phone;
	cookie['data'] = encryptedData;
	cookie['hash'] = hash;
	return cookie;
}

exports.addToResponse = function(res,phone,name,licence,usertype){
	var data = {};
	data['login'] = true;
	data['licence'] = licence;
	data['name'] = name;
	data['usertype'] = usertype;
	var info = {};
	info['phone'] = phone;
	info['data'] = data;
	var newCookie = create(info);
	var cookieOptions = {};
	res.cookie('info',newCookie,cookieOptions);
	res.cookieSended = {};
	res.cookieSended.info = newCookie;
}

