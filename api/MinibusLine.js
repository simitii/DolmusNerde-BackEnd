var Constants = require('./Constants'); 

var newMinibus = function(data){
	var minibus = {};
	var object = {
		get: function(){
			return minibus;
		},
		set: function(data){
			minibus = {
				'latitude': data.latitude,
				'longitude': data.longitude,
				'speed': data.speed,
				'licencePlate': data.licencePlate,
				'index': data.index,
				'lastUpdate': Date.now()
			};
		},
		isOld: function(){
			return minibus.lastUpdate!=undefined && (Date.now() - minibus.lastUpdate)>Constants.Defaults.DEAD_LIMIT;
		}
	};
	object.set(data);
	return object;
};
exports.newMinibusLine = function(line){
	var minibusLine = {
		minibusLine:line,
		minibuses:{},
		minibusNumber: 0,
	};
	var deleteMinibusIfNeeded = function(licencePlate){
			if(minibusLine.minibuses[licencePlate]){
				if(minibusLine.minibuses[licencePlate].isOld()){
					delete minibusLine.minibuses[licencePlate];
					minibusLine.minibusNumber = minibusLine.minibusNumber-1;
				}
			}
	};
	return {
		getActiveMinibuses: function(){
			var result = [];
			for(var licencePlate in minibusLine.minibuses){
				var minibus = minibusLine.minibuses[licencePlate].get();
				result.push(minibus);
			}
			return result;
		},
		isEmpty: function(){
			return minibusLine.minibusNumber == 0;
		},
		newPositionData: function(data){
			if(minibusLine.minibuses[data.licencePlate]){
				minibusLine.minibuses[data.licencePlate].set(data);
			}else{
				minibusLine.minibuses[data.licencePlate] = newMinibus(data);
				minibusLine.minibusNumber = minibusLine.minibusNumber + 1;
			}
		},
		garbageCollector: function(){
			for(var licencePlate in minibusLine.minibuses){
				deleteMinibusIfNeeded(licencePlate);
			}
			return minibusLine.minibusNumber==0; //Returns True if empty
		}
	};
};
