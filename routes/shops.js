const express = require('express');
const router = express.Router();
const config = require('./../config.js');
const fs = require('fs');
const input = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
const googleMapsClient = require('@google/maps').createClient({
  key: input.key
});

/* GET radius listing. */
router.get('/', function (req, res, next) {
    const param = req.query;
    config.client.get('user', function(err, result){
        if(err) throw err;
        const waypoints = JSON.parse(result);
        const route = waypoints.routes[0].legs;
        const radiusArr = calculateRadius(route);
        console.log("radius arr => ",radiusArr);
        
        res.send({ "status": true, radius: radiusArr });
        
    })
});

function reqRestraunts(lat, lng, radius) {
    return new Promise((resolve, reject) => {
        console.log("radius => ",radius);
        const latLng = [lat,lng];
        const request = {
            location: latLng,
            radius: radius,
            types: ['store']
        };
        console.log("request => ",request);
        googleMapsClient.nearbySearch(request, (err, response) => {
            if (err) console.log(err)
            resolve(response);
        });
    })
    
}

function distanceInMeters(data) {
    return data.map((d) => {
        const str = d.distance.text.split(" ")
        let unit = str[1]; 
        let distance = parseFloat(str[0]);
        if(unit == 'km') {
            distance = (distance * 1000);
            unit = 'm'; 
        } 
        return {"distance": distance, unit: unit} 
    });
}

function calculateRadius(routes) {
    let req = null, distance = 0, fixedDistance = 0, minRadius = 100, maxRadius = 5000, maxReq = 5 , minReq = 1;
    let dis = distanceInMeters(routes)[0];
    console.log("die => ", dis);
    const totalDistance = dis.distance;
    console.log("distance => ", totalDistance);
    const noOfReq = parseFloat(totalDistance / 4000);
    console.log("no of req ",noOfReq);
    console.log("maxReq ",maxReq);
    if(noOfReq > maxReq) {
        req = maxReq;
    } else if (noOfReq < minReq) {
        req = minReq;
    } else {
        console.log("no of req else");
    }

    let radius = parseFloat(totalDistance / req);
    if(radius > maxRadius) {
        radius = maxRadius;
    } else if (radius < minRadius) {
        radius = minRadius;
    } 
    else {
        console.log("radius else");
    }
    const steps = routes[0].steps;
    fixedDistance = radius * 2;
    let restrauntsArr = [];
    for(let i=0; i < steps.length ; i++) {
        const dist = steps[i].distance + distance;
        if(dist >= fixedDistance) {
            distance = 0;
        } else {
            distance += steps[i].distance;
        }
        const { lat, lng } = steps[i].end_location; 
        reqRestraunts(lat,lng,radius)
        .then((restraunts) => {
            console.log("wah saien => ",restraunts);
        });
    }


}

module.exports = router;
