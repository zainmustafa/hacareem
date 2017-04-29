var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var param = req.query;
  
  var obj = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
  var googleMapsClient = require('@google/maps').createClient({
    key: obj.key
    });
   var a =  JSON.parse(param.origin);
   var b =  JSON.parse(param.destination);
   console.log(a);
   console.log(b);
var query = {
  origin: a,
  destination: b,
 }
googleMapsClient.directions(query, (err, response) => {
      if (err) console.log(err)
       res.send({"status" : true, wayPoints : response.json});
    })
    
});

module.exports = router;
