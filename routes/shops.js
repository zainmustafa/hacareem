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
        "lat": 24.8847882,
        "lng": 67.0631257,
        "dealDescription": '',
        "category" : 'food'
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
        .then((restrauntsArr) => {
            const mapArr = restrauntsArr[0].results.map((place) => {
                const { lat, lng} = place.geometry.location; 
                return { lat, lng , name: place.name };
            });
            const relevantPlaces = filterRelevantPlaces(mapArr);
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
        let req = null, distance = 0, fixedDistance = 0, minRadius = 100, maxRadius = 5000, maxReq = 5 , minReq = 1;
        let dis = distanceInMeters(routes)[0];
        const totalDistance = dis.distance;
        req = parseFloat(totalDistance / 4000);
        if(req > maxReq) {
            req = maxReq;
        } 
        if (req < minReq) {
            req = minReq;
        } 

        let radius = parseFloat(totalDistance / req);
        if(radius >= maxRadius) {
            radius = maxRadius;
        }
        if (radius <= minRadius) {
            radius = minRadius;
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
                restrauntsArr.push(restraunts);
                i === steps.length - 1 ? resolve(restrauntsArr) : ''; 
            });
            
        }
    })

}

function filterRelevantPlaces(placesArr) {
    let arr = [];
    for(var j =0; j< placesArr.length; j++ ) {
        for(var i =0; i< discountedPlaces.length; i++ ) {
            if(placesArr[j].lat == discountedPlaces[i].lat && placesArr[j].lng == discountedPlaces[i].lng) {
                arr.push(placesArr[j]);
                break;
            }
        }
    }
    return arr;
}

module.exports = router;
