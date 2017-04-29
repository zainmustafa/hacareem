const express = require('express');
const router = express.Router();
const config = require('./../config.js');

/* GET radius listing. */
router.get('/', function (req, res, next) {
    const param = req.query;
    const waypoints = config.waypoints;
    // const steps = waypoints.routes[0].legs[0].steps;
    console.log("waypoints => ", waypoints);
    // console.log("steps => ", steps);
    calculateRadius(waypoints)
        .then((data) => {

        })
    const request = {
        location: pyrmont,
        radius: '500',
        types: ['store']
    };
    googleMapsClient.nearbySearch(request, (err, response) => {
        if (err) console.log(err)
        res.send({ "status": true, wayPoints: response.json });
    });
});

function calculateRadius(steps) {
    let distanceArr = [];
    return new Promise((resolve, response) => {
        distanceArr = steps.map((d) => { distance: d.distance.text });
        console.log("distance arr", distanceArr);
        resolve(distanceArr);
    });
}

module.exports = router;
