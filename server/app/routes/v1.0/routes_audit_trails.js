/*
Copyright [2016] [Relevance Lab]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var logsDao = require('_pr/model/dao/logsdao.js');
var async = require('async');
var instanceService = require('_pr/services/instanceService');
var auditTrailService = require('_pr/services/auditTrailService');
var logger = require('_pr/logger')(module);
var taskService = require('_pr/services/taskService');
var instanceLogModel = require('_pr/model/log-trail/instanceLog.js');
var containerLogModel = require('_pr/model/log-trail/containerLog.js');
var apiUtil = require('_pr/lib/utils/apiUtil.js');
var botService = require('_pr/services/botService');
var botAuditTrail = require('_pr/model/audit-trail/bot-audit-trail.js');
var moment = require('moment');
var uuid = require('node-uuid');
var botDao = require('_pr/model/bots/1.1/bot.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/audit-trail*', sessionVerificationFunc);

    app.get('/audit-trail', function(req,res){

        //adding user to query
        req.query.user = req.session.user.cn;
        logger.info(req.query.user)
        auditTrailService.getAuditTrailList(req.query,function(err,auditTrailList){
            if(err){
                logger.error(err);
                return res.status(500).send(err);
            }
            return res.status(200).send(auditTrailList);
        })
    });

    app.get('/audit-trail/:actionId/logs', function(req,res){
        auditTrailService.getAuditTrailActionLogs(req.params.actionId,req.query.timestamp,function(err,auditTrailActionLogs){
            if(err){
                logger.error(err);
                return res.status(500).send(err);
            }
            return res.status(200).send(auditTrailActionLogs);
        })
    });

    app.get('/audit-trail/bots-summary', function(req,res){
        var loggedUser = req.session.user.cn;
        logger.info('Entered - bots-summary')
        //Enabling session caching for summary data.
        if(req.session.botcache){
            if(moment().diff(req.session.botcache.lastrequestdate,'minutes') < 5){
                //read from cache if query matches
                if(JSON.stringify(req.session.botcache.lastquery) === JSON.stringify(req.query) && req.session.botcache.botSummary){
                    logger.info('Serving from cache..last request was sooner ');
                    logger.info('Exited - bots-summary');
                    return res.status(200).send(req.session.botcache.botSummary);
                }
                else{
                    req.session.botcache.lastquery = req.query;
                }
            }
        }
        //end session caching.
        auditTrailService.getBOTsSummary(req.query,'BOT',loggedUser,function(err,botSummary){
            if(err){
                logger.error(err);
                return res.status(500).send(err);
            }
            logger.info('Exited - bots-summary');
            if(req.session.botcache){
                req.session.botcache.lastrequestdate = moment();
                req.session.botcache.lastquery = req.query;
                req.session.botcache.botSummary = botSummary;

            }
            else
                botSummary.lastrequestdate = new Date();
            req.session.botcache = {
                lastrequestdate : moment(),
                lastquery : req.query,
                botSummary : botSummary
            }
            return res.status(200).send(botSummary);
        })
    });

    app.get('/audit-trail/:auditId/srnTicketSync', function(req,res){
        auditTrailService.syncCatalystWithServiceNow(req.params.auditId,function(err,srnTicketSync){
            if(err){
                logger.error(err);
                return res.status(500).send(err);
            }
            return res.status(200).send(srnTicketSync);
        })
    });

    app.get('/audit-trail/servicenowsync/status',function(req,res){

    })
    app.post('/audit-trail/:botid/updateAuditTrail', function(req,res){
        // auditTrailService.syncCatalystWithServiceNow(req.params.auditId,function(err,srnTicketSync){
        //     if(err){
        //         logger.error(err);
        //         return res.status(500).send(err);
        //     }
        //     return res.status(200).send(srnTicketSync);
        // })

        //fetch bot details
        var refId = [];
        var uid = uuid.v4();
        refId.push(uid);
        refId.push("Snow Explicit Sync");

        async.waterfall([
            function(next){
                botDao.getAllBots({},function(err,botList){
                    if(!err){
                        var snowbotsid = [];
                       // botList = botList.bots;
                        for(var h = 0; h < botList.length;h++){
                            logger.info(botList[h].input);
                            if(botList[h].input){
                                //logger.info("Found one with input " + topBotList[i].input.length);
                                for(var j = 0; j < botList[h].input.length; j++){
                                    //logger.info(topBotList[i].input[j]["name"]);
                                    if(botList[h].input[j]["name"] == "sysid"){
                                        snowbotsid.push(botList[h]);
                                    }
                                }
                            }
                        }
                        next(null,snowbotsid);
                    }
                })
            },
            function(botList){
                //Generating log reference number

                res.status(202).send("Sync started. Use /audit-trail/task-action/"+ uid + "/logs to track" );
                async.eachSeries(botList,function(botid,seriesnext){
                    botService.getBotById(botid.id,function(err,bot){
                    if(err){
                        logger.error(err);
                        logsDao.insertLog({
                            referenceId: refId,
                            err: true,
                            log: "Error fetching BOT details of " + botid + " " + err,
                            timestamp: new Date().getTime()
                        });
                        seriesnext();
                    }
                    else{
                        //return res.status(200).send(bot);
                        //fetching audit log for bot
                        if(bot){
                        var auditId = bot._id.toString();
                            botAuditTrail.find({"auditId":auditId},function(errba,auditlist){
                                if(err){
                                    logger.error(errba);
                                    logsDao.insertLog({
                                        referenceId: refId,
                                        err: true,
                                        log: "Error fetching audit details of " + botid + " " + errba,
                                        timestamp: new Date().getTime()
                                    });
                                    seriesnext();
                                }
                                else {
                                    //return res.status(200).send(auditlist[0]);
                                    //generating a log re
                                    logsDao.insertLog({
                                        referenceId: refId,
                                        err: false,
                                        log: "Starting Audit Sync for bot " + auditId + "Found " + auditlist.length + " entries.",
                                        timestamp: new Date().getTime()
                                    });

                                    var count = 0;
                                    async.eachSeries(auditlist,function(audit,callback){
                                        count++;
                                        logger.info("Trying to Sync : " + audit._id.toString());
                                        //push to sync only if the auditTrailConfig.serviceNowTicketRefObj.state is undefined
                                        if(audit.auditTrailConfig.serviceNowTicketRefObj){
                                            if(!audit.auditTrailConfig.serviceNowTicketRefObj.state)
                                                auditTrailService.syncCatalystWithServiceNow(audit._id.toString(),function(err,srnTicketSync){
                                                    if(err){
                                                        logger.error(err);
                                                        logger.error("Got an error during sync.");
                                                        logsDao.insertLog({
                                                            referenceId: refId,
                                                            err: true,
                                                            log: err,
                                                            timestamp: new Date().getTime()
                                                        });
                                                    }
                                                    else{
                                                        logger.info("Updated audit item : " + audit._id.toString() + " Completed " + ((count/auditlist.length) * 100).toFixed(2) + "%");
                                                        logsDao.insertLog({
                                                            referenceId: refId,
                                                            err: false,
                                                            log: "Updated audit item : " + audit._id.toString() + " Completed " + ((count/auditlist.length) * 100).toFixed(2) + "%",
                                                            timestamp: new Date().getTime()
                                                        });
                                                    }
                                                    callback();
                                                });
                                            else{
                                                logger.info("Skipping audit item : " + audit._id.toString() + ". State is defined.");
                                                logsDao.insertLog({
                                                    referenceId: refId,
                                                    err: false,
                                                    log: "Skipping audit item : " + audit._id.toString() + ". State is defined.",
                                                    timestamp: new Date().getTime()
                                                });
                                                callback();
                                            }

                                        }
                                        else{
                                            //no serviceNowObjectfound in audit
                                            logger.error("serviceNowTicketRefObj is not defined for " + audit._id.toString());
                                            logsDao.insertLog({
                                                referenceId: refId,
                                                err: true,
                                                log: "serviceNowTicketRefObj is not defined for " + audit._id.toString(),
                                                timestamp: new Date().getTime()
                                            });
                                            callback();
                                        }

                                    },function(err1){
                                        if(err1){
                                            logger.error(err1);
                                            logger.error("Got an error during sync. Terminating.");
                                            logsDao.insertLog({
                                                referenceId: refId,
                                                err: true,
                                                log: err1,
                                                timestamp: new Date().getTime()
                                            });
                                        }
                                        else{
                                                logger.info("Completed Sync");
                                                logsDao.insertLog({
                                                    referenceId: refId,
                                                    err: false,
                                                    log: "Completed Sync",
                                                    timestamp: new Date().getTime()
                                                });
                                            }
                                        return;
                                    })
                                }

                            })
                        }
                        else{
                            logger.error("Bot : " + req.params.botid + " not found");
                            return res.status(404).send("Bot : " + req.params.botid + " not found");
                        }
                    }
                })
                },function(err2){
                    if(err2){
                        logger.error(err2);
                        logger.error("Got an error during sync. Botlisting.");
                        logsDao.insertLog({
                            referenceId: refId,
                            err: true,
                            log: err2,
                            timestamp: new Date().getTime()
                        });
                    }
                    else{
                        logger.info("Completed Full Sync");
                        logsDao.insertLog({
                            referenceId: refId,
                            err: false,
                            log: "Completed Full Sync",
                            timestamp: new Date().getTime()
                        });
                    }
                    return;

                })
            }],
            function(err) {
                if (err)
                {
                    logger.error(err);
                    logger.error("Got an error during sync.");
                    logsDao.insertLog({
                        referenceId: refId,
                        err: true,
                        log: err,
                        timestamp: new Date().getTime()
                    });
                }
                else
                    return res.status(200).send({});
            });

    });

    app.get('/audit-trail/instance-action', getInstanceActionList);

    function getInstanceActionList(req, res, next) {
        var reqData = {};
        async.waterfall(
            [
                function(next) {
                    apiUtil.paginationRequest(req.query, 'instanceLogs', next);
                },
                function(paginationReq, next) {
                    reqData = paginationReq;
                    instanceLogModel.getInstanceActionList(paginationReq, next);
                },
                function(instanceActions, next) {
                    apiUtil.paginationResponse(instanceActions, reqData, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }

    app.get('/audit-trail/instance-action/:actionId', getInstanceAction);

    function getInstanceAction(req, res, next) {
        async.waterfall(
            [

                function(next) {
                    instanceLogModel.getLogsByActionId(req.params.actionId, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }

    app.get('/audit-trail/task-action', getTaskActionList);

    function getTaskActionList(req, res, next) {
        var reqData = {};
        async.waterfall(
            [

                function(next) {
                    apiUtil.paginationRequest(req.query, 'taskLogs', next);
                },
                function(paginationReq, next) {
                    reqData = paginationReq;
                    taskService.getTaskActionList(paginationReq, next);
                },
                function(taskActions, next) {
                    apiUtil.paginationResponse(taskActions, reqData, next);
                }

            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }

    app.get('/audit-trail/task-action/:actionId', getTaskAction);

    function getTaskAction(req, res, next) {
        async.waterfall(
            [

                function(next) {
                    instanceLogModel.getLogsByActionId(req.params.actionId, next);
                }

            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }

    app.get('/audit-trail/instance-action/:actionId/logs', pollInstanceActionLog);

    function pollInstanceActionLog(req, res, next) {
        var timestamp = req.query.timestamp;
        if (timestamp) {
            timestamp = parseInt(timestamp);
        }
        async.waterfall(
            [
                function(next) {
                    logsDao.getLogsByReferenceId(req.params.actionId, timestamp, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }
    app.get('/audit-trail/task-action/:actionId/logs', pollTaskActionLog);

    function pollTaskActionLog(req, res, next) {
        var timestamp = req.query.timestamp;
        if (timestamp) {
            timestamp = parseInt(timestamp);
        }
        async.waterfall(
            [
                function(next) {
                    logsDao.getLogsByReferenceId(req.params.actionId, timestamp, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }


    app.get('/audit-trail/container-action', getContainerActionList);

    function getContainerActionList(req, res, next) {
        var reqData = {};
        async.waterfall(
            [
                function(next) {
                    apiUtil.paginationRequest(req.query, 'containerLogs', next);
                },
                function(paginationReq, next) {
                    paginationReq['searchColumns'] = ['platformId', 'status', 'action', 'user', 'actionStatus', 'orgName', 'bgName', 'projectName', 'environmentName', 'containerName', 'image'];
                    reqData = paginationReq;
                    apiUtil.databaseUtil(paginationReq, next);
                },
                function(dataQuery, next) {
                    containerLogModel.getContainerActionLogs(dataQuery, next);
                },
                function(instanceActions, next) {
                    apiUtil.paginationResponse(instanceActions, reqData, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }

    app.get('/audit-trail/container-action/:actionId/logs', pollContainerActionLog);

    function pollContainerActionLog(req, res, next) {
        var timestamp = req.query.timestamp;
        if (timestamp) {
            timestamp = parseInt(timestamp);
        }
        async.waterfall(
            [
                function(next) {
                    logsDao.getLogsByReferenceId(req.params.actionId, timestamp, next);
                }
            ],
            function(err, results) {
                if (err)
                    return res.status(500).send(err);
                else
                    return res.status(200).send(results);
            });
    }


};
