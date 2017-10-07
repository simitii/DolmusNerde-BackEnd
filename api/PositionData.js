var Constants = require('./Constants');

var newMinibusLine = require('./MinibusLine').newMinibusLine;
var MemoryData = {};

var sendNotification = function(data) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic YTgyZmMzOTYtNDYzMy00ZWQyLTlhODktZjZlYjEyYzg5NTRi"
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
  var https = require('https');
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};

var updatePositionData = function(data){
  if(MemoryData[data.minibusLine] == undefined){
    //NEW MINIBUSLINE NEEDED
    MemoryData[data.minibusLine] = newMinibusLine(data.minibusLine);
    var garbageTimeInterval = setInterval(function(){
      var isEmpty = MemoryData[data.minibusLine].garbageCollector();
      if(isEmpty){
        clearInterval(garbageTimeInterval);
        delete MemoryData[data.minibusLine];
      }
      console.log("GARBAGES COLLECTED!");
    },Constants.Defaults.GARBAGE_INTERVAL);
  }
  MemoryData[data.minibusLine].newPositionData(data);
};

/** GETS DATA FROM req.body and PUSH NOTIFICATION USING ONESIGNAL
 * @params req.body.data = {
 *            minibusLine  : 'HAT KODU',
 *            licencePlate : 'DOLMUS PLAKASI',
 *            driver       : 'Name of Driver',
 *            latitude     : 'Latitude of Position',
 *            longitude    : 'Longitude of Position',
 *            speed        : 'DOLMUSUN ANLIK HIZI'
 *         }
 */
exports.pushPositionData = function(db,req,res){
  if(req.body.minibusLine==undefined || req.body.minibusLine==null ||
    req.body.licencePlate==undefined || req.body.licencePlate==null ||
    req.body.index==undefined || req.body.index==null){
      res.send(Constants.Responses.INVALID_INPUT);
      return;
  }
  var data = {
    'index': req.body.index,
    'minibusLine': req.body.minibusLine,
    'licencePlate': req.body.licencePlate,
    'latitude': req.body.latitude,
    'longitude': req.body.longitude,
    'speed': req.body.speed
  }

  //PREPARE AND SEND MESSAGE(NOTIFICATION) USING ONESIGNAL
  var message = { 
    app_id: "64478bcd-cc2a-47dc-8ec5-c87c00701b4a",
    contents: {"en": "data"},
    content_available: true,
    filters: [
        {"field": "tag", "key": "MinibusLine", "relation": "=", "value": data.minibusLine},
        {"operator": "OR"},
        {"field": "tag", "key": "MinibusLine2", "relation": "=", "value": data.minibusLine},
        {"operator": "OR"},
        {"field": "tag", "key": "MinibusLine3", "relation": "=", "value": data.minibusLine},
    ],
    data: data
  };
  sendNotification(message);
  updatePositionData(data);
  res.send(Constants.Responses.SUCCESS);
};

exports.pullPositionData = function(db,req,res){
  if(req.body.minibusLine==undefined || req.body.minibusLine==null){
      res.send(Constants.Responses.INVALID_INPUT);
      return;
  }
  var minibusLine = req.body.minibusLine;
  if(MemoryData[minibusLine] == undefined || MemoryData[minibusLine].isEmpty()){
    res.send(Constants.Responses.NO_ACTIVE_MINIBUS);
  }else{
    res.send(MemoryData[minibusLine].getActiveMinibuses());
  }
};
