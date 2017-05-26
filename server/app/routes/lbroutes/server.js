
var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');

var app = loopback();

app.set('json spaces', 2); 
console.log(__dirname + '/../../loopback');
console.log(boot);
boot(app, __dirname + '/../loopback', function(err) {
	console.log('returned from boot...');
  if (err) 
  	console.log(err);
  else{
  	//console.log(app);
  	app.use(loopback.rest());
  }
});



module.exports = function(callback){
 boot(app, __dirname + '/../loopback', function(err) {
	console.log('returned from boot...');
  if (err) 
  	console.log(err);
    callback(err);
  else{
  	//console.log(app);
  	app.use(loopback.rest());
  	callback(null,app)
  }
});
}; 



