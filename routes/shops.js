const express = require('express');
const router = express.Router();
const config = require('./../config.js');
const GooglePlaces = require( 'node-googleplaces');
const fs = require('fs');
const input = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
const places = new GooglePlaces(input.key);
const googleMapsClient = require('@google/maps').createClient({
  key: input.key
});

const discountedPlaces = [
    {
        "name" : 'United King',
        "lat": "24.8712801",
        "lng": "67.06038389999999",
        "dealDescription": "",
        "category" : "food"
    },
    {
        "name" : 'J.',
        "lat": '1000.02',
        "lng": '1111.012332',
        "dealDescription": '',
        "category" : 'clothing'
    },
    {
        "name" : 'foot wear',
        "lat": '23482309482.080',
        "lng": '28732.00',
        "dealDescription": '',
        "category" : 'shopping'
    }
];


/* GET shops listing. */
router.get('/', function (req, res, next) {
    const param = req.query;
    config.client.get('user', function(err, result){
        if(err) throw err;
        const waypoints = JSON.parse(result);
        const route = waypoints.routes[0].legs;
        calculateRadius(route)
        .then((relevantPlaces) => {
            res.send({ "status": true, relevantPlaces });
        })
        .catch((err) => {
            res.send({ "status": false, err });
        });
    })
});

function reqRestraunts(lat, lng, radius) {
    return new Promise((resolve, reject) => {
        const latLng = `${lat},${lng}`;
        const request = {
            location: latLng,
            radius: radius,
            types: ['store']
        };
        places.nearbySearch(request)
        .then((res) => {
            resolve(res.body);
        })
        .catch((err) => {
            reject(err);
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
    return new Promise((resolve, reject) => {
        let req = null, fixedDistance = 0, minRadius = 100, maxRadius = 5000, maxReq = 5 , minReq = 1;
        let dis = distanceInMeters(routes)[0];
        const totalDistance = dis.distance;
        req = parseInt(totalDistance / 500);
        if(req > maxReq) {
            req = maxReq;
        } 
        if (req < minReq) {
            req = minReq;
        } 

        let radius = parseInt(totalDistance / req);
        if(radius >= maxRadius) {
            radius = maxRadius;
        }
        if (radius <= minRadius) {
            radius = minRadius;
        } 
        const steps = routes[0].steps;
        fixedDistance = radius;
        let restrauntsArr = [];
        let distance = 0;
        for(let i=0; i < steps.length ; i++) {
            const dist = kmToMeter(steps[i].distance) + distance;
            if(dist >= fixedDistance) {
                distance = 0;
                const { lat, lng } = steps[i].end_location; 
                reqRestraunts(lat,lng,radius)
                .then((restraunts) => {

                    const mapArr = restraunts.results.map((place) => {
                    const { lat, lng} = place.geometry.location; 
                        return Object.assign({}, place, { lat, lng });
                    });
                    const relevantPlaces = filterRelevantPlaces(mapArr);
                    relevantPlaces.length && restrauntsArr.push(relevantPlaces);
                    i === (steps.length - 1) ? resolve(restrauntsArr) : ''; 
                });
            } else {
                distance += kmToMeter(steps[i].distance);
            }
            
        }
    })

}

function kmToMeter(dist) {
    const str = dist.text.split(" ")
    let unit = str[1]; 
    let distance = parseFloat(str[0]);
    if(unit == 'km') {
        distance = (distance * 1000);
        unit = 'm'; 
    } 
    return distance; 
}

function filterRelevantPlaces(placesArr) {
    let arr = [];
    for(var j =0; j< placesArr.length; j++ ) {
        for(var i =0; i< discountedPlaces.length; i++ ) {
            if(placesArr[j].lat == discountedPlaces[i].lat && placesArr[j].lng == discountedPlaces[i].lng) {
                const key = "${placesArr[j].lat},${placesArr[j].lng}";
                config.client.setex("key", 50000, JSON.stringify(placesArr[j]));
                arr.push(placesArr[j]);
                break;
            }
        }
    }
    return arr;
}

module.exports = router;
