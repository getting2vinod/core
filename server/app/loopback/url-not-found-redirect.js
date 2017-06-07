'use strict'

var logger = require('_pr/logger')(module);

module.exports = function () {
	return function redirect-catalyst(req,res,next){

		/*var routes = require('../routes/v1.0/routes.js');
		var routerV1 = app.loopback.Router();
		var routerV2 = require('../routes/v2.0');*/

		logger.debug('Setting up application Catalyst routes in url not found phase');
		//routes.setRoutes(routerV1);

		app.use(routerV1);
		app.use('/api/v1.0', routerV1);

		app.use('/api/v2.0', routerV2);

		//res.end();

	};
}