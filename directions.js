var request= require("request");
module.exports.getDirections = function (data, cb) {
        var apiKey = 'AIzaSyCjJ0UxhS2ZB0v3ejzyP7-gNWW3QINEQBk';
        var origin = data.origin;
        var destination = data.destination;
        var url  = "https://maps.googleapis.com/maps/api/directions/json?origin="+origin+"&destination="+destination+"&key="+apiKey+"&units=imperial";
        console.log(url);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                var distance = json.routes[0].legs[0].distance.text.split(" ");
                var  distanceValue= Math.ceil(distance[0] * 10) / 10;
                if(distance[1]=='ft') {

                    distanceValue = distance[0] / 5280;
                    distanceValue= Math.ceil(distanceValue * 10) / 10;

                }
                var distance  = distanceValue+" Mile";
                console.log("routes == ",json.routes[0]);
                var duration=json.routes[0].legs[0].duration.text;
                var start_address=json.routes[0].legs[0].start_address;
                var end_address=json.routes[0].legs[0].end_address;

                if(distance =='' ) { distance =" 0 Mile"; }
                if(duration =='' ) { distance =" 0"; }
                if(start_address =='' ) { distance =""; }
                if(end_address =='' ) { distance =""; }

                data = {};
                data.distance=distance;
                data.duration=duration;
                data.start_address=start_address;
                data.end_address=end_address;
                //return data;
                cb(null,data)
            }
        });
  };
