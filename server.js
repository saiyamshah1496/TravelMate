/*
This is the NODE.js Server that handles the requests from the setRequestHeader
On getting the input and output, the GOOGLE maps API is called to fetch the route directions resultArray
On getting the points along the route DARK SKY Weather API is called to display the weather conditions at
that points
We first check the results in the database, if it is not present then we hit the API
Also we create another server that handles the request of 8001 port to handle the request of global weather display
TECHNOLOGIES: Node.JS, MongoDB, JavaScript
Created by: Saiyam Shah
*/
var myExpressInstance = require("express");
var myBodyParser = require("body-parser");
var path = require("path");
var app = myExpressInstance();
var app2 = myExpressInstance();
var request= require("request");
var dist = require("./directions");
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var temperature,summary,icon,lat,lng;
var url = 'mongodb://localhost:27017/weather';

app2.set('view engine','ejs');
app2.set('views',path.join(__dirname,'views'));
app2.use(myBodyParser.json());                       //middleware to check the data
app2.use(myBodyParser.urlencoded({extended: true}));
app2.use(myExpressInstance.static(path.join(__dirname,'clients')));


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(myBodyParser.json());                       //middleware to check the data
app.use(myBodyParser.urlencoded({extended: true}));
app.use(myExpressInstance.static(path.join(__dirname,'clients')));  //middleware to load the css contents  and jquery files
app.get('/',function(request,response)
{
response.render('Page.ejs');    //When you visit a website it is GET request
});

//for handling the world weather
app2.get('/weather', function(request, response) {
        response.render('Weather.ejs');
});
//for handling the directions
app.post('/directions', function (req, res) {
  count=0;
  var originId= req.body.coordinates[0].origin;
var destinationId= req.body.coordinates[0].destination;
//We first check in the database whether the item is present or not

      dbfinddirection(originId,destinationId,function(obj,bool)
      {

        if(bool)
        {
          res.setHeader('Content-Type', 'application/json');
          res.send(obj);


      }

      //else we hit the GOOGLE maps API
      else  {

        var url = "https://maps.googleapis.com/maps/api/directions/json?origin=place_id:" +originId+   "&destination=place_id:" + destinationId +"&key=Enter Your Key Here";;

              request.get(
                  url,
                function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                        mongoClient.connect('mongodb://localhost:27017/', function(err, db) {
                          // If a database called "myNewDatabase" exists, it is used, otherwise it gets created.
                          if (err) throw err;
                          var dbo=db.db("weather");
                          dbo.collection("directions").createIndex({"origin":1,"destination":1}, {unique:true}, (err, result) => {
                             if(err) {console.error("Failed to create index")};
                             console.log("Unique Index created successfully");
                              })
                          var directionobj = {origin:originId,destination:destinationId,direction:body};
                          dbo.collection("directions").insertOne(directionobj, function(err, res) {
                          if (err) {console.log("not inserted")};
                          console.log("1 document inserted");
                          db.close();
                           });
                          // If a collection called "myNewCollection" exists, it is used, otherwise it gets created.
                        });


                          res.setHeader('Content-Type', 'application/json');
                          res.send(body);
                      }

                 })



    }
    });
    });



app.post('/', function (req, res) {
  var apiKey = "Enter Your Maps API Key here";
  var data = req.body.location;
  var datalength= data.length;
  var dbArray = new Array();
  var resultArray = new Array();
  var myArray=new Array();
  var dbSuccess = false;
  var count;
  for(var i=0;i<data.length;i++)
  {
    var lat=data[i].latitude;
    var lng=data[i].longitude;
    //we check the DB for weather and return callback to get the status
    dbfind(lat,lng,datalength,resultArray,function(obj,bool)
    {

      if(bool)
      {

      for(var j=0;j<obj.length;j++)
      {
        let weatherdetail = obj[j];
        for(var k=0;k<weatherdetail.length;k++)
        {
          var weatherItemDB =
          {
            "temperature": weatherdetail[k].temperature,
            "summary" : weatherdetail[k].summary,
            "icon" : weatherdetail[k].icon,
            "latitude" : weatherdetail[k].latitude,
            "longitude" : weatherdetail[k].longitude
          };
          dbArray.push(weatherItemDB);
          if(dbArray.length==datalength)
            {
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify({weatherInformation: dbArray}));

            }
        }
      }

    }
    else  {
      for(var h=0;h<datalength;h++)
      {
      var url = "https://api.darksky.net/forecast/Enter Weather API Key here/" +data[h].latitude+ "," +data[h].longitude;
      request.get(
          url,
        function (error, response, body) {
              if (!error && response.statusCode == 200) {
                let weather = JSON.parse(body);
                icon=weather.currently.icon;
                summary=weather.currently.summary;
                temperature=weather.currently.temperature;
                lat=weather.latitude;
                lng=weather.longitude;
                var weatherItem =
                {
                  "temperature": temperature,
                  "summary" : summary,
                  "icon" : icon,
                  "latitude" : lat,
                  "longitude" : lng
                };
                myArray.push(weatherItem);
                dbinsert(temperature,summary,icon,lat,lng);
                if(myArray.length==datalength)
                {
                  res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({weatherInformation: myArray}));
                }
              }
         })
    }
  }
  });

}



})
app.listen(8000, function(){
console.log("Server is up and running and listening at port 8000");
});
app2.listen(8001, function(){
console.log("Server 2 is up and running and listening at port 8001");
});
//Function to insert in the database if found for the first time
function dbinsert(tmp,summ,icon,lat,lng)
{
  mongoClient.connect('mongodb://localhost:27017/', function(err, db) {
    // If a database called "myNewDatabase" exists, it is used, otherwise it gets created.
    if (err) throw err;
    var dbo=db.db("weather");
    dbo.collection("weather").createIndex({"latitude":1,"longitude":1}, {unique:true}, (err, result) => {
       if(err) {console.error("Failed to create index")};
       console.log("Unique Index created successfully");
        })
    var myobj = {latitude:lat,longitude:lng,temperature: tmp, summary: summ,icon:icon };
    dbo.collection("weather").insertOne(myobj, function(err, res) {
    if (err) {console.log("not inserted")};
    console.log("1 document inserted");
    db.close();
     });
    // If a collection called "myNewCollection" exists, it is used, otherwise it gets created.
  });
}
//Searches the MONGOdb database
function dbfinddirection(originId,destinationId,fn)
{
  console.time("dbstart");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var check;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("weather");
  var query = { origin : originId, destination:destinationId };
  dbo.collection("directions").find(query).toArray(function(err, result) {
    if (err) throw err;
    if(result.length>0)
    {
      var obj=result[0].direction;
    fn(obj,true);
}
else {
fn(null,false);
}

    db.close();

  });
});
console.timeEnd("dbstart");
}




var count;
//Searches the database for weather
function dbfind(lat,lng,datalength,resultArray,fn)
{
  console.time("weatherstart");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var check;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("weather");
  var query = { latitude : lat, longitude:lng };
  dbo.collection("weather").find(query).toArray(function(err, result) {
    if (err) throw err;
    if(result.length>0)
    {
      count++;
    resultArray.push(result);
    if(resultArray.length == datalength)
    {
      fn(resultArray,true);
      // Do what you want with the data
  }
  else if(count==datalength) {
  fn(null,false);
  }
}
else {
  count++;
//  console.log(count);

  if(count==datalength)
  {

  fn(null,false);
}
}

    db.close();
  });
});
console.timeEnd("weatherstart");
}
