const express = require('express');
const router = express.Router();
const fs = require('fs');
const config = require('./../config.js');

/* GET waypoints listing. */
router.get('/', function (req, res, next) {
  const param = req.query;
  const input = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
  const googleMapsClient = require('@google/maps').createClient({
    key: input.key
  });
  const query = {
    origin: JSON.parse(param.origin),
    destination: JSON.parse(param.destination),
  }
  googleMapsClient.directions(query, (err, response) => {
    if (err) {
      res.send({ "status": false, error: err });
    }
    config.waypoints = response.json;
    console.log("config ==> ", config);
    res.send({ "status": true, wayPoints: response.json });
  });

});

module.exports = router;
