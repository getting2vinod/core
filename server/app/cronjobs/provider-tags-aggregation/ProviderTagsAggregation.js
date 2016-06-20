var logger = require('_pr/logger')(module);
var CatalystCronJob = require('_pr/cronjobs/CatalystCronJob');
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var MasterUtils = require('_pr/lib/utils/masterUtil.js');
var tagsModel = require('_pr/model/tags');
var async = require('async');
var resources = require('_pr/model/resources/resources');
var unassignedInstancesModel = require('_pr/model/unassigned-instances');

var ProviderTagsAggregation = Object.create(CatalystCronJob);
ProviderTagsAggregation.execute = providerTagAggregation;

module.exports = ProviderTagsAggregation;


function providerTagAggregation() {
    MasterUtils.getAllActiveOrg(function(err, orgs) {
        if(err) {
            logger.error(err);
        } else {
            aggregateTagForProvidersOfOrg.apply(aggregateTagForProvidersOfOrg, orgs);
        }
    });
};

function aggregateTagForProvidersOfOrg(org) {
    AWSProvider.getAWSProvidersByOrgId(org._id, function(err, providers) {
        if(err) {
            logger.error(err);
        } else {
            aggregateTagForProvider.apply(aggregateTagForProvider, providers);
        }
    });
};

function aggregateTagForProvider(provider) {
    logger.info('Tags aggregation started');
    if(provider._id) {
        var tags={};
        async.waterfall([
            function (next) {
                tagsModel.getTagsByProviderId(provider._id, next);
            },
            function (tags, next) {
                var tagDetails = {};
                var count = 0;
                if (tags.length === 0) {
                    next(null, tags);
                } else {
                    for (var i = 0; i < tags.length; i++) {
                        tagDetails[tags[i].name] = tags[i];
                        if (i === tags.length - 1) {
                            next(null, tagDetails);
                        }
                    }
                }
            },
            function (tagDetails, next) {
                tags = tagDetails;
                getResourcesForTagAggregation(provider,next);
            },
            function (resourceDetails, next) {
                getResourceTags(tags,resourceDetails,provider, next);
            },
            function (tagsDetails, next) {
                saveAndUpdateResourceTags(tagsDetails,provider, next);
            }
        ], function (err, results) {
            if (err) {
                logger.error(err);
                return;
            } else {
                logger.info('Tags aggregation ended');
            }
        })
    }else{
        logger.info("Please configure Provider for Tag Aggregation Cost");
    }
};

function getResourcesForTagAggregation(provider,next){
    var resourcesList=[];
    async.waterfall([
        function(next){
            unassignedInstancesModel.getUnAssignedInstancesByProviderId(provider._id, next);
        },
        function(instances,next){
            resourcesList = instances;
            resources.getResourcesByProviderId(provider._id, next);
        },
        function(resources,next){
            if(resources.length > 0){
                var count = 0;
                for(var i = 0; i < resources.length ; i++){
                    count++;
                    resourcesList.push(resources[i]);
                }
                if(count === resources.length){
                    next(null,resourcesList);
                }
            }else{
                next(null,resourcesList);
            }
        }
    ],function(err,results){
        if(err){
            next(err);
        }else{
           next(null,results);
        }

    })
};

function getResourceTags(tagDetails,resourceDetails,provider,next){
    if(resourceDetails.length > 0) {
        var count = 0;
        for (var m = 0; m < resourceDetails.length; m++) {
            count++;
            for (var tagName in resourceDetails[m].tags) {
                var tagValue = resourceDetails[m].tags[tagName];
                if (tagName in tagDetails) {
                    if (tagDetails[tagName].values.indexOf(tagValue) < 0) {
                        tagDetails[tagName].values.push(tagValue);
                    }
                } else {
                    tagDetails[tagName] = {
                        'providerId': provider._id,
                        'orgId': provider.orgId[0],
                        'name': tagName,
                        'values': [tagValue],
                        'new': true
                    }
                }
            }
        }
        if (resourceDetails.length === count) {
            next(null, tagDetails);
        }
    }else{
        next(null,{});
    }
};

function saveAndUpdateResourceTags(tags,provider,next){
    if(tags) {
        var count = 0;
        for (var tagName in tags) {
            if (tags[tagName].new) {
                count++;
                var tagObject = tags[tagName];
                delete tagObject.new;
                tagsModel.createNew(tagObject);
            } else {
                count++;
                var params = {
                    'providerId': provider._id,
                    'name': tagName
                }
                var fields = {
                    'values': tags[tagName].values
                }
                tagsModel.updateTag(params, fields);
            }
        }
        if(count ===Object.keys(tags).length){
            next(null,tags);
        }
    }else{
        next(null,{});
    }
};