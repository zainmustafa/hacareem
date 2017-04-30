const express = require('express');
const router = express.Router();
const fs = require('fs');
const config = require('./../config.js');
const input = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
const googleMapsClient = require('@google/maps').createClient({
  key: input.key
});


/* GET waypoints listing. */
router.get('/', function (req, res, next) {
  const param = req.query;
  // store the key-value pair (username:totalStars) in our cache
  // with an expiry of 1 minute (60s)
  //config.client.setex("username", 60, "totalStars");
  // return the result to the user

  const query = {
    origin: JSON.parse(param.origin),
    destination: JSON.parse(param.destination),
  }
  googleMapsClient.directions(query, (err, response) => {
    if (err) {
      res.send({ "status": false, error: err });
    }
    config.client.setex("user", 50000, JSON.stringify(response.json));
    
    res.send({ "status": true, wayPoints: response.json });
  });

});

module.exports = router;
