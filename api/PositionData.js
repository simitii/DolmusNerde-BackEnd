var Constants = require('./Constants');

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

var updatePositionData = function(db,data){
  db.updateWithOptions('PositionData',{'licencePlate':data.licencePlate},
                          {$set:data},{upsert:true},
    function(err,r){
      if(err!=null){
        console.log(err);
      }
  });
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
  if(req.body.data==undefined || req.body.data==null || 
    req.body.data.minibusLine==undefined || req.body.data.minibusLine==null ||
    req.body.data.licencePlate==undefined || req.body.licencePlate==null){
      
      res.send(Constants.Response.INVALID_INPUT);
      return;
  }

  //PREPARE AND SEND MESSAGE(NOTIFICATION) USING ONESIGNAL
  var message = { 
    app_id: "64478bcd-cc2a-47dc-8ec5-c87c00701b4a",
    contents: {"en": "DO NOT SHOW THIS"},
    filters: [
        {"field": "tag", "key": "MinibusLine", "relation": "=", "value": req.body.data.minibusLine},
        {"operator": "OR"},
        {"field": "tag", "key": "MinibusLine2", "relation": "=", "value": req.body.data.minibusLine},
        {"operator": "OR"},
        {"field": "tag", "key": "MinibusLine3", "relation": "=", "value": req.body.data.minibusLine},
    ],
    content_available: true,
    data: req.body.data
  };
  sendNotification(message);
  updatePositionData(db,data);
  res.send(Constants.Response.SUCCESS);
};

exports.pullPositionData = function(db,req,res){
  if(req.body.minibusLine==undefined || req.body.minibusLine==null){
      res.send(Constants.Response.INVALID_INPUT);
      return;
  }
  db.find('PositionData',{'minibusLine':req.body.minibusLine},function(err,docs){
    if(err!=null){
      console.log(err);
      res.send(Constants.Response.DB_ERROR);
    }else if(docs.length<1){
      res.send(Constants.Response.NO_ACTIVE_MINIBUS);
    }else{
      res.send(docs);
    }
  });
};
