var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('data/development.json', 'utf8'));
var config = {};

config.applicationPort = process.env.PORT || 3000;;
config.dbName = 'addnotifier';
config.dbHost = 'mongodb://'+obj.name+':'+obj.password+'@ds123361.mlab.com:23361/addnotifier';

// config.direction = function(){
//   return  
// }

module.exports = config;