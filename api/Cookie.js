var crypto = require("crypto");

//setting key
var serverKey = '$2B+f8VGumW&DhF3_3&kve=4Q*V@f!+k6BGbS-X2WmFzJdzMf?QRjmHc5pPMfcu8';


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
	//console.log(cookie);
	if(cookie == undefined || cookie.key==undefined || cookie.data==undefined || cookie.hash==undefined){
		return null;
	}
	//getting info located in cookie
	var key = cookie.key;
	var expires = cookie.expires;
	var encryptedData = cookie.data;
	var hash = cookie.hash;

	//check if cookie is expired
 	if(Date.now() > cookie.extime){
 		return null;
 	}

 	var object = {};
 	object['key'] = key;
 	object['expires'] = expires;
 	var tempKey = hmac(object,serverKey);
 	//console.log("EX " + expires);
 	//console.log(tempKey);
 	var data = decipher(encryptedData,tempKey);
 	object = {};
 	object['key'] = key;
 	object['expires'] = expires;
 	object['data'] = data;
 	object['serverKey'] = serverKey;
 	var verificationCode = hmac(object,tempKey);
 	if(verificationCode !== hash){
 		return null;
 	}
 	data['key'] = key;
 	return data;
}
function create(info){
	var key = info.key;
	//EXPIRES Approximately Fri, 31 Dec 9999 23:59:59 GMT
	var expires = new Date(253402300000000);
	var data = info.data;
	var object = {};
	object['key'] = key;
	object['expires'] = expires;
	var tempKey = hmac(object,serverKey);
	var encryptedData = cipher(data,tempKey);
	object = {};
	object['key'] = key;
	object['expires'] = expires;
	object['data'] = data;
	object['serverKey'] = serverKey;
	var hash = hmac(object,tempKey);
	var cookie = {};
	cookie['key'] = key;
	cookie['expires'] = expires;
	cookie['data'] = encryptedData;
	cookie['hash'] = hash;
	return cookie;
}

exports.addToResponse = function(res,key,data,usertype){
	if(data === null || typeof yourVariable !== 'object'){
		data = {};
	}
	data['login'] = true;
	data['usertype'] = usertype;
	var info = {};
	info['key'] = key;
	info['data'] = data;
	//console.log(info);
	//console.log(data);
	var newCookie = create(info);
	var cookieOptions = {};
	cookieOptions['expires'] = newCookie.expires;
	res.cookie('info',newCookie,cookieOptions);
	res.cookieSended = {};
	res.cookieSended.info = newCookie;
}

