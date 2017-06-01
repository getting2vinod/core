var logger = require('_pr/logger')(module);


module.exports = function(app) {

    // logger.debug('Setting up application routes');
    var routes = require('../../routes/v1.0/routes.js');
    //console.log(routes);
    console.log("**********************************************************");

    var routerV1 = app.loopback.Router();
    routes.setRoutes(routerV1);
    app.use(routerV1);

    app.use('/api/v1.0', routerV1);


    var routerV2 = require('../../routes/v2.0');

    //console.log(routerV2);
    logger.debug('Setting up version 2 routes');

    app.use('/api/v2.0', routerV2);
    logger.debug("done");


    
}
