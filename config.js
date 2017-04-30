var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
var config = {};
var redis = require('redis');

config.applicationPort = process.env.PORT || 3000;;
config.waypoints = null;
config.dbName = 'addnotifier';
config.dbHost = 'mongodb://'+obj.name+':'+obj.password+'@ds123361.mlab.com:23361/addnotifier';




// create a new redis client and connect to our local redis instance
config.client = redis.createClient();

// if an error occurs, print it to the console
config.client.on('error', function (err) {
    console.log("Error " + err);
});

module.exports = config;