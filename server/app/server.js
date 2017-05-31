'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var childProcess = require('child_process');
var socketIo = require('_pr/socket.io');
var logger = require('_pr/logger')(module);
var expressLogger = require('_pr/logger').ExpressLogger();
var globalData = require('_pr/config/global-data.js');
var Tail = require('tail').Tail;
var expressCompression = require('compression');
var expressFavicon = require('serve-favicon');
var expressCookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressBodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var expressMultipartMiddleware = multipart();
var appConfig = require('_pr/config');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(expressSession);
var mongoDbConnect = require('_pr/lib/mongodb');
var mongoose = require('mongoose');

var catalystSync = require('_pr/cronjobs/catalyst-scheduler/catalystScheduler.js');

//*************** Had Socket IO server reference ****************
var notification = require('_pr/routes/v1.0/routes_notification');
//************************

var app = module.exports = loopback();


//app.set('view engine', 'ejs');
app.set('json spaces', 2);



var init = function(app) {

    var dboptions = {
        host: process.env.DB_HOST || appConfig.db.host,
        port: appConfig.db.port,
        dbName: appConfig.db.dbName
    };
    mongoDbConnect(dboptions, function(err) {
        if (err) {
            logger.error("Unable to connect to mongo db >>" + err);
            throw new Error(err);
        } else {
            logger.debug('connected to mongodb - host = %s, port = %s, database = %s', dboptions.host, dboptions.port, dboptions.dbName);
        }
    });
    globalData.init();
    var mongoStore = new MongoStore({
        mongooseConnection: mongoose.connection
    }, function() {

    });
    var sessionMiddleware = expressSession({
        secret: 'sessionSekret',
        store: mongoStore,
        resave: false,
        saveUninitialized: true
    });
    app.use(sessionMiddleware);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // app.set('port', process.env.PORT || appConfig.app_run_port);
    // app.set('sport', appConfig.app_run_secure_port);


}
//console.log(appConfig);
console.log("About to boot path " + __dirname + '/loopback');
var server = null;
boot(app, __dirname + '/loopback', function(err) {
    if (err){
    	console.log(err);
    }

    // start the server if `$ node server.js`
    console.log('Done LB Boot');

    init(app);
    //starting express

    app.use(expressCompression());
    app.use(expressFavicon(__dirname + '/../../client/htmls/private/img/favicons/favicon.ico'));
    app.use(expressCookieParser());


    logger.debug("Initializing Session store in mongo");

    

    app.listen(appConfig.app_run_port, function(server) {
    	console.log('Application Started and listening on port: ' +  appConfig.app_run_port);
        var io = socketIo.getInstance(server, {
            log: false,
            authFunc: function(socket, next) {
                sessionMiddleware(socket.request, socket.request.res, next);
            }
        });

        notification.setRoutes(app,io);

    })

});
