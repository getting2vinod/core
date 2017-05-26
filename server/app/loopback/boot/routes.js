module.exports = function(app){

	var router = app.loopback.Router();
	router.get('/test',function(req,res){
		res.send("testing...");
	});

	router.get('/lbapi',function(req,res,next){
		console.log('hit');
		next();
	});
	
	app.use(router);
}