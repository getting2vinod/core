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


// This file act as a Controller which contains provider related all end points.

var logger = require('_pr/logger')(module);
var EC2 = require('../lib/ec2.js');
var cost = require('../lib/dashboard.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var openstackProvider = require('../model/classes/masters/cloudprovider/openstackCloudProvider.js');
var hppubliccloudProvider = require('../model/classes/masters/cloudprovider/hppublicCloudProvider.js');
var azurecloudProvider = require('../model/classes/masters/cloudprovider/azureCloudProvider.js');
var vmwareProvider = require('../model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var blueprints = require('../model/dao/blueprints');
var instances = require('../model/classes/instance/instance');
var masterUtil = require('../lib/utils/masterUtil.js');
var usersDao = require('../model/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Cryptography = require('../lib/utils/cryptography');
var rc = require('node-rest-client').Client;
var appConfig = require('_pr/config');
module.exports.setRoutes = function(app, sessionVerificationFunc) {


    // Return AWS Provider respect to id.
    app.get('/aws/providers/list', function(req, res) {

        AWSProvider.getAWSProviders(function(err, providers) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            logger.debug("Provider list: ", JSON.stringify(providers));
            if (providers) {
                var providerList = [];
                var count = 0;
                for (var i = 0; i < providers.length; i++) {
                    (function(i) {

                        AWSKeyPair.getAWSKeyPairByProviderId(providers[i]._id, function(err, keyPair) {
                            var keys = [];
                            keys.push(providers[i].accessKey);
                            keys.push(providers[i].secretKey);
                            cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                if (err) {
                                    logger.error("Failed to decrypt accessKey or secretKey: ", err);
                                    res.status(500).send("Failed to decrypt accessKey or secretKey");
                                    return;
                                }
                                count++;
                                if (keyPair) {
                                    var dommyProvider = {
                                        _id: providers[i]._id,
                                        id: 9,
                                        accessKey: decryptedKeys[0],
                                        secretKey: decryptedKeys[1],
                                        providerName: providers[i].providerName,
                                        providerType: providers[i].providerType,
                                        orgId: providers[i].orgId,
                                        __v: providers[i].__v,
                                        keyPairs: keyPair
                                    };
                                    providerList.push(dommyProvider);
                                    logger.debug("count: ", count);
                                    if (count === providers.length) {
                                        res.send(providerList);
                                        return;
                                    }
                                }
                            });
                        });
                    })(i);
                }
            } else {
                res.send(404);
            }
        });
    });

    // Return AWS Provider respect to id.
    app.get('/aws/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /providers/%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }
        AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (aProvider) {
                AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id, function(err, keyPair) {
                    masterUtil.getOrgById(aProvider.orgId[0], function(err, orgs) {
                        if (err) {
                            res.status(500).send("Not able to fetch org.");
                            return;
                        }
                        var keys = [];
                        keys.push(aProvider.accessKey);
                        keys.push(aProvider.secretKey);
                        cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                            if (err) {
                                logger.error("Failed to decrypt accessKey or secretKey: ", err);
                                res.status(500).send("Failed to decrypt accessKey or secretKey");
                                return;
                            }
                            if (orgs.length > 0) {
                                if (keyPair) {
                                    var dommyProvider = {
                                        _id: aProvider._id,
                                        id: 9,
                                        accessKey: decryptedKeys[0],
                                        secretKey: decryptedKeys[1],
                                        providerName: aProvider.providerName,
                                        providerType: aProvider.providerType,
                                        orgId: aProvider.orgId,
                                        orgName: orgs[0].orgname,
                                        __v: aProvider.__v,
                                        keyPairs: keyPair
                                    };
                                    res.send(dommyProvider);
                                }
                            }
                        });
                    });
                });
            } else {
                res.send(404);
            }
        });
    });

    app.all("/aws/providers/*", sessionVerificationFunc);
    var cryptoConfig = appConfig.cryptoSettings;
    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

    //Create VMWare Provider
    app.post('/vmware/providers', function(req, res) {
        logger.debug("Enter post() for /vmware.providers.", typeof req.body.fileName);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var vmwareusername = req.body.vmwareusername;
        var vmwarepassword = req.body.vmwarepassword;
        var vmwarehost = req.body.vmwarehost;
        var vmwaredc = req.body.vmwaredc;
        var providerName = req.body.providerName;
        var providerType = req.body.providerType;
        var orgId = req.body.orgId;

        if (typeof vmwareusername === 'undefined' || vmwareusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof vmwarepassword === 'undefined' || vmwarepassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof vmwarehost === 'undefined' || vmwarehost.length === 0) {
            res.status(400).send("Please Enter a Host.");
            return;
        }
        if (typeof vmwaredc === 'undefined' || vmwaredc.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send("Please Enter ProviderType.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400).send("Please Select Any Organization.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.status(400).send("You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                    return;
                }
                logger.debug("LoggedIn User: ", JSON.stringify(anUser));
                if (anUser) {

                    var providerData = {
                        id: 9,
                        username: vmwareusername,
                        password: vmwarepassword,
                        host: vmwarehost,
                        providerName: providerName,
                        providerType: providerType,
                        dc: vmwaredc,
                        orgId: orgId
                    };
                    vmwareProvider.getvmwareProviderByName(providerData.providerName, providerData.orgId, function(err, prov) {
                        if (err) {
                            logger.error("Error while fetching vmware: ", err);
                            res.status(500).send("Error while fetching vmware");
                            return;
                        }
                        if (prov) {
                            logger.error("Provider name already exist: ");
                            res.status(409).send("Provider name already exist.");
                            return;
                        }
                        vmwareProvider.createNew(providerData, function(err, provider) {
                            if (err) {
                                logger.error("Failed to create Provider: ", err);
                                res.status(500).send("Failed to create Provider.");
                                return;
                            }
                            masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                                if (err) {
                                    res.status(500).send("Not able to fetch org.");
                                    return;
                                }
                                if (orgs.length > 0) {
                                    var dommyProvider = {
                                        _id: provider._id,
                                        id: 9,
                                        username: vmwareusername,
                                        password: vmwarepassword,
                                        host: vmwarehost,
                                        dc: vmwaredc,
                                        providerName: provider.providerName,
                                        providerType: provider.providerType,
                                        orgId: orgs[0].rowid,
                                        orgName: orgs[0].orgname,
                                        __v: provider.__v,
                                    };
                                    res.send(dommyProvider);
                                    return;

                                }
                            });

                            logger.debug("Exit post() for /providers");
                        });
                    });

                } //end anuser
            });
        });

    });

    //get vmware providers
    app.get('/vmware/providers', function(req, res) {
        logger.debug("Enter get() for vmware/providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (providers != null) {
                                if (providers.length > 0) {
                                    res.send(providers);
                                    return;
                                }
                            } else {
                                res.send(200, []);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                res.send(providers);
                                return;
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            }
        });
    });

    //start: get azure provider by id
    app.get('/vmware/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /azure/providers//%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }
        vmwareProvider.getvmwareProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (aProvider) {
                masterUtil.getOrgById(aProvider.orgId[0], function(err, orgs) {
                    if (err) {
                        res.status(500).send("Not able to fetch org.");
                        return;
                    }
                    aProvider.orgname = orgs[0].orgname;
                    if (orgs.length > 0) {
                        res.send(aProvider);
                        return;
                    }
                });

            } else {
                res.send(404);
                return;
            }
        });
    }); //end: get azure provider by id

    //start: removes azure provider
    app.delete('/vmware/providers/:providerId', function(req, res) {
        logger.debug("Enter delete for vmware/providers/%s", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {
                    VMImage.getImageByProviderId(providerId, function(err, anImage) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        if (anImage) {
                            res.send(403, "Provider already used by Some Images.To delete provider please delete respective Images first.");
                            return;
                        }
                        logger.debug('Providerid: ', providerId);
                        vmwareProvider.removevmwareProviderById(providerId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Enter delete() for vmware/providers/%s", req.params.providerId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                            } else {
                                res.send(400);
                            }
                        });
                    });
                }
            });
        }); //
    });


    app.post('/vmware/providers/:providerId/update', function(req, res) {
        logger.debug("Enter post() for /providers/vmware/%s/update", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var vmwareusername = req.body.vmwareusername;
        var vmwarepassword = req.body.vmwarepassword;
        var vmwarehost = req.body.vmwarehost;
        var vmwaredc = req.body.vmwaredc;
        var providerName = req.body.providerName;
        var orgId = req.body.orgId;

        if (typeof vmwareusername === 'undefined' || vmwareusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof vmwarepassword === 'undefined' || vmwarepassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof vmwarehost === 'undefined' || vmwarehost.length === 0) {
            res.status(400).send("Please Enter a Host.");
            return;
        }
        if (typeof vmwaredc === 'undefined' || vmwaredc.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400);
            res.send("Please Select Any Organization.");
            return;
        }

        var providerData = {
            id: 9,
            username: vmwareusername,
            password: vmwarepassword,
            host: vmwarehost,
            providerName: providerName,
            tenantid: vmwaredc,
            orgId: orgId
        };
        logger.debug("provider data %s", JSON.stringify(providerData));

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {
                    vmwareProvider.updatevmwareProviderById(req.params.providerId, providerData, function(err, updateCount) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                            if (err) {
                                res.status(500).send("Not able to fetch org.");
                                return;
                            }
                            if (orgs.length > 0) {
                                var dommyProvider = {
                                    _id: req.params.providerId,
                                    id: 9,
                                    username: vmwareusername,
                                    password: vmwarepassword,
                                    host: vmwarehost,
                                    providerName: providerName,
                                    dc: vmwaredc,
                                    orgId: orgs[0].rowid,
                                    orgName: orgs[0].orgname
                                };
                                res.send(dommyProvider);
                                return;
                            }
                        });
                    });

                }
            });
        });
    });


    app.post('/hppubliccloud/providers', function(req, res) {
        logger.debug("Enter post() for /hppubliccloud.", typeof req.files.hppubliccloudinstancepem);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var hppubliccloudusername = req.body.openstackusername;
        var hppubliccloudpassword = req.body.openstackpassword;
        var hppubliccloudhost = req.body.openstackhost;
        var hppubliccloudtenantid = req.body.openstacktenantid;
        var hppubliccloudtenantname = req.body.openstacktenantname;
        var hppubliccloudprojectname = req.body.openstackprojectname;
        var providerName = req.body.providerName;
        var providerType = req.body.providerType.toLowerCase();
        var hppubliccloudkeyname = req.body.hppubliccloudkeyname;
        var hppubliccloudregion = req.body.hppubliccloudregion;
        var hpFileName = req.files.hpFileName.originalFilename;
        var orgId = req.body.orgId;

        var serviceendpoints = {
            compute: req.body.openstackendpointcompute,
            network: req.body.openstackendpointnetwork,
            image: req.body.openstackendpointimage,
            ec2: req.body.openstackendpointec2,
            identity: req.body.openstackendpointidentity,
        };

        if (typeof hppubliccloudusername === 'undefined' || hppubliccloudusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof hppubliccloudpassword === 'undefined' || hppubliccloudpassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof hppubliccloudhost === 'undefined' || hppubliccloudhost.length === 0) {
            res.status(400).send("Please Enter a Host.");
            return;
        }
        if (typeof hppubliccloudtenantid === 'undefined' || hppubliccloudtenantid.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof hppubliccloudregion === 'undefined' || hppubliccloudregion.length === 0) {
            res.status(400).send("Please Enter Region.");
            return;
        }
        if (typeof hppubliccloudkeyname === 'undefined' || hppubliccloudkeyname.length === 0) {
            res.status(400).send("Please Enter a Key name.");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send("Please Enter ProviderType.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400);
            res.send("Please Select Any Organization.");
            return;
        }
        if (typeof hppubliccloudtenantname === 'undefined' || hppubliccloudtenantname.length === 0) {
            res.status(400).send("Please Enter Tenant Name.");
            return;
        }
        if (typeof hppubliccloudprojectname === 'undefined' || hppubliccloudprojectname.length === 0) {
            res.status(400).send("Please Enter Project Name.");
            return;
        }
        if (typeof serviceendpoints.compute === 'undefined' || serviceendpoints.compute.length === 0) {
            res.status(400).send("Please Enter Compute Endpoint Name.");
            return;
        }
        if (typeof serviceendpoints.identity === 'undefined' || serviceendpoints.identity.length === 0) {
            res.status(400).send("Please Enter Identity Endpoint Name.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                    return;
                }
                if (anUser) {
                    var providerData = {
                        id: 9,
                        username: hppubliccloudusername,
                        password: hppubliccloudpassword,
                        host: hppubliccloudhost,
                        providerName: providerName,
                        providerType: providerType,
                        tenantid: hppubliccloudtenantid,
                        tenantname: hppubliccloudtenantname,
                        projectname: hppubliccloudprojectname,
                        serviceendpoints: serviceendpoints,
                        region: hppubliccloudregion,
                        keyname: hppubliccloudkeyname,
                        hpFileName: hpFileName,
                        orgId: orgId
                    };
                    hppubliccloudProvider.gethppubliccloudProviderByName(providerData.providerName, providerData.orgId, function(err, prov) {
                        if (err) {
                            logger.error("err. ", err);
                            res.status(500).send("Error to fetch Provider: ", err);
                        }
                        if (prov) {
                            logger.debug("Provider name already exist");
                            res.status(409).send("Provider name already exist.");
                            return;
                        }
                        hppubliccloudProvider.createNew(req, providerData, function(err, provider) {
                            if (err) {
                                logger.error("Failed to create Provider: ", err);
                                res.status(500).send("Failed to create Provider.");
                                return;
                            }

                            masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                                if (err) {
                                    res.status(500).send("Not able to fetch org.");
                                    return;
                                }
                                if (orgs.length > 0) {

                                    var dommyProvider = {
                                        _id: provider._id,
                                        id: 9,
                                        username: hppubliccloudusername,
                                        password: hppubliccloudpassword,
                                        host: hppubliccloudhost,
                                        providerName: provider.providerName,
                                        providerType: provider.providerType,
                                        hpFileName: provider.hpFileName,
                                        orgId: orgs[0].rowid,
                                        orgName: orgs[0].orgname,
                                        tenantid: hppubliccloudtenantid,
                                        __v: provider.__v,

                                    };
                                    res.send(dommyProvider);
                                    return;

                                }
                            });

                            logger.debug("Exit post() for /providers");
                        });
                    });

                } //end anuser
            });
        });

    });

    app.get('/hppubliccloud/providers', function(req, res) {
        logger.debug("Enter get() for /hppubliccloud/providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (providers != null) {
                                for (var i = 0; i < providers.length; i++) {
                                    providers[i]['providerType'] = providers[i]['providerType'].toUpperCase();
                                }
                                logger.debug("providers>>> ", JSON.stringify(providers));
                                if (providers.length > 0) {
                                    res.send(providers);
                                    return;
                                }
                            } else {
                                res.send(200, []);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                res.send(providers);
                                return;
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            }
        });
    });

    app.get('/hppubliccloud/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /hppubliccloud/providers//%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }
        hppubliccloudProvider.gethppubliccloudProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (aProvider) {

                masterUtil.getOrgById(aProvider.orgId[0], function(err, orgs) {
                    if (err) {
                        res.status(500).send("Not able to fetch org.");
                        return;
                    }
                    aProvider.orgname = orgs[0].orgname;

                    if (orgs.length > 0) {
                        res.send(aProvider);
                        return;
                    }
                });

            } else {
                res.status(404).send("Provider not found.");
                return;
            }
        });
    });


    app.post('/hppubliccloud/providers/:providerId/update', function(req, res) {
        logger.debug("Enter post() for /providers/hppubliccloud/%s/update", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var hppubliccloudusername = req.body.openstackusername;
        var hppubliccloudpassword = req.body.openstackpassword;
        var hppubliccloudhost = req.body.openstackhost;
        var hppubliccloudtenantid = req.body.openstacktenantid;
        var hppubliccloudtenantname = req.body.openstacktenantname;
        var hppubliccloudprojectname = req.body.openstackprojectname;
        var providerName = req.body.providerName;
        var providerType = req.body.providerType.toLowerCase();
        var hppubliccloudkeyname = req.body.hppubliccloudkeyname;
        var hpFileName = req.files.hpFileName.originalFilename;
        var hppubliccloudregion = req.body.hppubliccloudregion;
        var providerId = req.params.providerId;

        var serviceendpoints = {
            compute: req.body.openstackendpointcompute,
            network: req.body.openstackendpointnetwork,
            image: req.body.openstackendpointimage,
            ec2: req.body.openstackendpointec2,
            identity: req.body.openstackendpointidentity,

        };

        var orgId = req.body.orgId;
        if (typeof hppubliccloudusername === 'undefined' || hppubliccloudusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof hppubliccloudpassword === 'undefined' || hppubliccloudpassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof hppubliccloudhost === 'undefined' || hppubliccloudhost.length === 0) {
            res.status(400).send("Please Enter a Host.");
            return;
        }
        if (typeof hppubliccloudtenantid === 'undefined' || hppubliccloudtenantid.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof hppubliccloudregion === 'undefined' || hppubliccloudregion.length === 0) {
            res.status(400).send("Please Enter Region.");
            return;
        }
        if (typeof hppubliccloudkeyname === 'undefined' || hppubliccloudkeyname.length === 0) {
            res.status(400).send("Please Enter a Key name.");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send("Please Enter ProviderType.");
            return;
        }
        if (typeof hppubliccloudtenantname === 'undefined' || hppubliccloudtenantname.length === 0) {
            res.status(400).send("Please Enter Tenant Name.");
            return;
        }
        if (typeof hppubliccloudprojectname === 'undefined' || hppubliccloudprojectname.length === 0) {
            res.status(400).send("Please Enter Project Name.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400);
            res.send("Please Select Any Organization.");
            return;
        }
        if (typeof serviceendpoints.compute === 'undefined' || serviceendpoints.compute.length === 0) {
            res.status(400).send("Please Enter Compute Endpoint Name.");
            return;
        }
        if (typeof serviceendpoints.identity === 'undefined' || serviceendpoints.identity.length === 0) {
            res.status(400).send("Please Enter Identity Endpoint Name.");
            return;
        }


        var providerData = {
            id: 9,
            username: hppubliccloudusername,
            password: hppubliccloudpassword,
            host: hppubliccloudhost,
            providerName: providerName,
            providerType: providerType,
            tenantid: hppubliccloudtenantid,
            tenantname: hppubliccloudtenantname,
            projectname: hppubliccloudprojectname,
            serviceendpoints: serviceendpoints,
            region: hppubliccloudregion,
            hpFileName: hpFileName,
            keyname: hppubliccloudkeyname,
            orgId: orgId
        };

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                logger.debug("LoggedIn User: ", JSON.stringify(anUser));
                if (anUser) {
                    hppubliccloudProvider.updatehppubliccloudProviderById(providerId, providerData, function(err, updateCount) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                            if (err) {
                                res.status(500).send("Not able to fetch org.");
                                return;
                            }
                            if (orgs.length > 0) {
                                var dommyProvider = {
                                    _id: providerId,
                                    id: 9,
                                    username: hppubliccloudusername,
                                    password: hppubliccloudpassword,
                                    host: hppubliccloudhost,
                                    providerName: providerData.providerName,
                                    providerType: providerData.providerType,
                                    orgId: orgs[0].rowid,
                                    orgName: orgs[0].orgname
                                };
                                res.send(dommyProvider);
                                return;
                            }
                        });
                    });

                }
            });
        });
    });

    //start: removes azure provider
    app.delete('/hppubliccloud/providers/:providerId', function(req, res) {
        logger.debug("Enter delete() for hppubliccloud/providers/%s", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var providerId = req.params.providerId.trim();

        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                    return;
                }
                if (anUser) {
                    VMImage.getImageByProviderId(providerId, function(err, anImage) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        if (anImage) {
                            res.send(403, "Provider already used by Some Images.To delete provider please delete respective Images first.");
                            return;
                        }

                        hppubliccloudProvider.removehppubliccloudProviderById(providerId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Enter delete() for hppubliccloud/providers/%s", req.params.providerId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                            } else {
                                res.send(400);
                            }
                        });
                    });
                }
            });
        });
    });


    //Creates Azure Provider
	app.post('/azure/providers', function(req, res) {

		logger.debug("Enter post() for Azure.");
		var user = req.session.user;
		var category = configmgmtDao.getCategoryFromID("9");
		var permissionto = 'create';
		var azureSubscriptionId = req.body.azureSubscriptionId;
		var azureClientId = req.body.azureClientId;
		var azureClientSecret = req.body.azureClientSecret;
		var azureTenantId = req.body.azureTenantId;

		var providerName = req.body.providerName;
		var providerType = req.body.providerType.toLowerCase();
		var pemFileName = req.files.azurepem.originalFilename;
		var keyFileName = req.files.azurekey.originalFilename;
		var orgId = req.body.orgId;

		if (typeof azureSubscriptionId === 'undefined' || azureSubscriptionId.length === 0) {
			res.status(400).send("Please Enter SubscriptionId.");
			return;
		}

		if (typeof providerName === 'undefined' || providerName.length === 0) {
			res.status(400).send("Please Enter Name.");
			return;
		}
		if (typeof providerType === 'undefined' || providerType.length === 0) {
			res.status(400).send("Please Enter ProviderType.");
			return;
		}
		if (typeof pemFileName === 'undefined' || orgId.length === 0) {
			res.status(400);
			res.send("Please upload azure subscription pem file");
			return;
		}
		if (typeof keyFileName === 'undefined' || orgId.length === 0) {
			res.status(400);
			res.send("Please upload azure subscription key file");
			return;
		}
		if (typeof orgId === 'undefined' || orgId.length === 0) {
			res.status(400);
			res.send("Please Select Any Organization.");
			return;
		}

		usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
			if (!err) {
				logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
				if (data == false) {
					logger.debug('No permission to ' + permissionto + ' on ' + category);
					res.send(401, "You don't have permission to perform this operation.");
					return;
				}
			} else {
				logger.error("Hit and error in haspermission:", err);
				res.send(500);
				return;
			}

			masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
				if (err) {
					res.status(500).send("Failed to fetch User.");
					return;
				}
				logger.debug("LoggedIn User: ", JSON.stringify(anUser));
				if (anUser) {

					var providerData = {
						id: 9,
						subscriptionId: azureSubscriptionId,
						providerName: providerName,
						providerType: providerType,
						pemFileName: pemFileName,
						keyFileName: keyFileName,
						orgId: orgId,
						clientId: azureClientId,
						clientSecret: azureClientSecret,
						tenant: azureTenantId
					};
					azurecloudProvider.getAzureCloudProviderByName(providerData.providerName, providerData.orgId, function(err, prov) {
						if (err) {
							logger.debug("Failed to fetch Azure provider. ", err);
							res.status(500).send("Failed to fetch Azure provider.");
							return;
						}
						if (prov) {
							res.status(409).send("Provider name already exist.");
							return;
						}
						azurecloudProvider.createNew(req, providerData, function(err, provider) {
							if (err) {
								logger.debug("Failed to create Provider.", err);
								res.status(500).send("Failed to create Provider.");
								return;
							}

							masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
								if (err) {
									res.status(500).send("Not able to fetch org.");
									return;
								}
								if (orgs.length > 0) {
									var dommyProvider = {
										_id: provider._id,
										id: 9,
										subscriptionId: azureSubscriptionId,
										providerName: provider.providerName,
										providerType: provider.providerType,
										pemFileName: pemFileName,
										keyFileName: keyFileName,
										orgId: orgs[0].rowid,
										orgName: orgs[0].orgname,
										__v: provider.__v,

									};
									res.send(dommyProvider);
									return;
								}
							});

							logger.debug("Exit post() for /providers");
						});
					});

				} //end anuser
			});
		});

	}); //ends :create Azure provider

    //starts: get azure providers
    app.get('/azure/providers', function(req, res) {
        logger.debug("Enter get() for /azure/providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (providers != null) {
                                for (var i = 0; i < providers.length; i++) {
                                    providers[i]['providerType'] = providers[i]['providerType'].toUpperCase();
                                }
                                if (providers.length > 0) {
                                    res.send(providers);
                                    return;
                                }
                            } else {
                                res.status(200).send([]);
                                return;
                            }
                        });
                    } else {
                        res.status(200).send([]);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                res.send(providers);
                                return;
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.status(200).send([]);
                        return;
                    }
                });
            }
        });
    }); //end: get azure providers

    //start: get azure provider by id
    app.get('/azure/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /azure/providers//%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }
        azurecloudProvider.getAzureCloudProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (aProvider) {
                logger.debug(aProvider);
                var provider = JSON.parse(aProvider)
                logger.debug(provider.orgId);
                masterUtil.getOrgById(provider.orgId[0], function(err, orgs) {
                    if (err) {
                        res.status(500).send("Not able to fetch org.");
                        return;
                    }
                    aProvider.orgname = orgs[0].orgname;

                    if (orgs.length > 0) {
                        res.send(aProvider);
                        return;
                    }
                });

            } else {
                res.status(500).send("Not Found Provider.");
            }
        });
    }); //end: get azure provider by id

    //start: update azure provider
	app.post('/azure/providers/:providerId/update', function(req, res) {
		logger.debug("Enter post() for /providers/azure/%s/update", req.params.providerId);
		var user = req.session.user;
		var category = configmgmtDao.getCategoryFromID("9");
		var permissionto = 'create';

		var azureSubscriptionId = req.body.azureSubscriptionId;
		var azureClientId = req.body.azureClientId;
		var azureClientSecret = req.body.azureClientSecret;
		var azureTenantId = req.body.azureTenantId;
		var providerName = req.body.providerName;
		var providerId = req.params.providerId;
		var orgId = req.body.orgId;

		if (typeof azureSubscriptionId === 'undefined' || azureSubscriptionId.length === 0) {
			res.status(400).send("Please Enter Subscription Id.");
			return;
		}

		if (typeof providerName === 'undefined' || providerName.length === 0) {
			res.status(400).send("Please Enter Name.");
			return;
		}

		var providerData = {
			id: 9,
			azureSubscriptionId: azureSubscriptionId,
			providerName: providerName,
			orgId: orgId,
			clientId: azureClientId,
			clientSecret: azureClientSecret,
			tenant: azureTenantId
		};

		usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
			if (!err) {
				logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
				if (data == false) {
					logger.debug('No permission to ' + permissionto + ' on ' + category);
					res.send(401, "You don't have permission to perform this operation.");
					return;
				}
			} else {
				logger.error("Hit and error in haspermission:", err);
				res.send(500);
				return;
			}

			masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
				if (err) {
					res.status(500).send("Failed to fetch User.");
					return;
				}
				logger.debug("LoggedIn User: ", JSON.stringify(anUser));
				if (anUser) {
					azurecloudProvider.updateAzureCloudProviderById(providerId, providerData, function(err, updateCount) {
						if (err) {
							logger.error(err);
							res.status(500).send(errorResponses.db.error);
							return;
						}
						masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
							if (err) {
								res.status(500).send("Not able to fetch org.");
								return;
							}
							if (orgs.length > 0) {
								var dommyProvider = {
									_id: providerId,
									id: 9,
									subscriptionId: azureSubscriptionId,
									providerName: providerData.providerName,
									orgId: orgs[0].rowid,
									orgName: orgs[0].orgname
								};
								res.send(dommyProvider);
								return;
							}
						});
					});

				}
			});
		});
	}); //end: update azure provider

    //start: removes azure provider
    app.delete('/azure/providers/:providerId', function(req, res) {
        logger.debug("Enter delete() for /providers/%s", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.status(401).send("You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                logger.debug("LoggedIn User: ", JSON.stringify(anUser));
                if (anUser) {
                    VMImage.getImageByProviderId(providerId, function(err, anImage) {
                        if (err) {
                            logger.error(errorResponses.db.error);
                            res.status(500).send("Failed to get Image.");
                            return;
                        }
                        if (anImage) {
                            res.status(403).send("Provider already used by Some Images.To delete provider please delete respective Images first.");
                            return;
                        }

                        azurecloudProvider.removeAzureCloudProviderById(providerId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send("Failed to get Provider.");
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Enter delete() for /providers/%s", req.params.providerId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                            } else {
                                res.send(400);
                            }
                        });
                    });
                }
            });
        }); //
    });

    //Create Openstack provider
    app.post('/openstack/providers', function(req, res) {
        logger.debug("Enter post() for /providers.", typeof req.body.fileName);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var openstackusername = req.body.openstackusername;
        var openstackpassword = req.body.openstackpassword;
        var openstackhost = req.body.openstackhost;
        var openstacktenantid = req.body.openstacktenantid;
        var openstacktenantname = req.body.openstacktenantname;
        var openstackprojectname = req.body.openstackprojectname;
        var providerName = req.body.providerName;
        var providerType = req.body.providerType;
        var openstackkeyname = req.body.openstackkeyname;
        var pemFileName = req.files.openstackinstancepem.originalFilename;
        var orgId = req.body.orgId;

        var serviceendpoints = {
            compute: req.body.openstackendpointcompute,
            network: req.body.openstackendpointnetwork,
            image: req.body.openstackendpointimage,
            ec2: req.body.openstackendpointec2,
            identity: req.body.openstackendpointidentity,
        };

        if (typeof openstackusername === 'undefined' || openstackusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof openstackpassword === 'undefined' || openstackpassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof openstackhost === 'undefined' || openstackhost.length === 0) {
            res.status(400).send("Please Enter a Host.");
            return;
        }
        if (typeof openstacktenantid === 'undefined' || openstacktenantid.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof pemFileName === 'undefined' || orgId.length === 0) {
            res.status(400);
            res.send("Please upload openstack subscription pem file");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send("Please Enter ProviderType.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400).send("Please Select Any Organization.");
            return;
        }
        if (typeof openstacktenantname === 'undefined' || openstacktenantname.length === 0) {
            res.status(400).send("Please Enter Tenant Name.");
            return;
        }
        if (typeof openstackprojectname === 'undefined' || openstackprojectname.length === 0) {
            res.status(400).send("Please Enter Project Name.");
            return;
        }
        if (typeof serviceendpoints.compute === 'undefined' || serviceendpoints.compute.length === 0) {
            res.status(400).send("Please Enter Compute Endpoint Name.");
            return;
        }
        if (typeof serviceendpoints.identity === 'undefined' || serviceendpoints.identity.length === 0) {
            res.status(400).send("Please Enter Identity Endpoint Name.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.status(400).send("You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                    return;
                }
                logger.debug("LoggedIn User: ", JSON.stringify(anUser));
                if (anUser) {

                    var providerData = {
                        id: 9,
                        username: openstackusername,
                        password: openstackpassword,
                        host: openstackhost,
                        providerName: providerName,
                        providerType: providerType,
                        tenantid: openstacktenantid,
                        tenantname: openstacktenantname,
                        projectname: openstackprojectname,
                        serviceendpoints: serviceendpoints,
                        keyname: openstackkeyname,
                        pemFileName: pemFileName,
                        orgId: orgId
                    };
                    openstackProvider.getopenstackProviderByName(providerData.providerName, providerData.orgId, function(err, prov) {
                        if (err) {
                            logger.debug("err.....", err);
                        }
                        if (prov) {
                            logger.debug("err.....", err);
                            res.status(409).send("Provider name already exist.");
                            return;
                        }
                        openstackProvider.createNew(req, providerData, function(err, provider) {
                            if (err) {
                                logger.debug("err.....", err);
                                res.status(500).send("Failed to create Provider.");
                                return;
                            }

                            masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                                if (err) {
                                    res.status(500).send("Not able to fetch org.");
                                    return;
                                }
                                if (orgs.length > 0) {
                                    var dommyProvider = {
                                        _id: provider._id,
                                        id: 9,
                                        username: openstackusername,
                                        password: openstackpassword,
                                        host: openstackhost,
                                        providerName: provider.providerName,
                                        providerType: provider.providerType,
                                        orgId: orgs[0].rowid,
                                        orgName: orgs[0].orgname,
                                        pemFileName: pemFileName,
                                        tenantid: openstacktenantid,
                                        __v: provider.__v,

                                    };
                                    res.send(dommyProvider);
                                    return;
                                }
                            });

                            logger.debug("Exit post() for /providers");
                        });
                    });

                } //end anuser
            });
        });

    });

    // Return list of all available AWS Providers.
    app.get('/openstack/providers', function(req, res) {
        logger.debug("Enter get() for /providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        openstackProvider.getopenstackProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (providers != null) {
                                if (providers.length > 0) {
                                    res.send(providers);
                                    return;
                                }
                            } else {
                                res.status(200).send([]);
                                return;
                            }
                        });
                    } else {
                        res.status(500).send([]);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        openstackProvider.getopenstackProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                res.send(providers);
                                return;
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.status(200).send([]);
                        return;
                    }
                });
            }
        });
    });

    // Return AWS Provider respect to id.
    app.get('/openstack/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /providers/%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }
        openstackProvider.getopenstackProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (aProvider) {

                masterUtil.getOrgById(aProvider.orgId[0], function(err, orgs) {
                    if (err) {
                        res.status(500).send("Not able to fetch org.");
                        return;
                    }
                    aProvider.orgname = orgs[0].orgname;

                    if (orgs.length > 0) {
                        res.send(aProvider);
                        return;
                    }
                });

            } else {
                res.status(404).send("Provider not found.");
            }
        });
    });

    // Update a particular AWS Provider
    app.post('/openstack/providers/:providerId/update', function(req, res) {
        logger.debug("Enter post() for /providers/%s/update", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'modify';
        var openstackusername = req.body.openstackusername;
        var openstackpassword = req.body.openstackpassword;
        var openstackhost = req.body.openstackhost;
        var openstacktenantid = req.body.openstacktenantid;
        var openstacktenantname = req.body.openstacktenantname;
        var openstackprojectname = req.body.openstackprojectname;
        var providerName = req.body.providerName.trim();
        var providerId = req.params.providerId.trim();
        var openstackkeyname = req.body.openstackkeyname;
        var orgId = req.body.orgId;
        var providerId = req.params.providerId;

        var serviceendpoints = {
            compute: req.body.openstackendpointcompute,
            network: req.body.openstackendpointnetwork,
            image: req.body.openstackendpointimage,
            ec2: req.body.openstackendpointec2,
            identity: req.body.openstackendpointidentity

        };

        if (typeof openstackusername === 'undefined' || openstackusername.length === 0) {
            res.status(400).send("Please Enter Username.");
            return;
        }
        if (typeof openstackpassword === 'undefined' || openstackpassword.length === 0) {
            res.status(400).send("Please Enter Password.");
            return;
        }
        if (typeof openstackhost === 'undefined' || openstackhost.length === 0) {
            res.status(400).send("Please Enter a Host");
            return;
        }
        if (typeof openstacktenantid === 'undefined' || openstacktenantid.length === 0) {
            res.status(400).send("Please Enter a Tenant ID");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof openstacktenantname === 'undefined' || openstacktenantname.length === 0) {
            res.status(400).send("Please Enter Tenant Name.");
            return;
        }
        if (typeof openstackprojectname === 'undefined' || openstackprojectname.length === 0) {
            res.status(400).send("Please Enter Project Name.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400).send("Please Select Any Organization.");
            return;
        }
        if (typeof serviceendpoints.compute === 'undefined' || serviceendpoints.compute.length === 0) {
            res.status(400).send("Please Enter Compute Endpoint Name.");
            return;
        }
        if (typeof serviceendpoints.identity === 'undefined' || serviceendpoints.identity.length === 0) {
            res.status(400).send("Please Enter Identity Endpoint Name.");
            return;
        }


        var providerData = {
            id: 9,
            username: openstackusername,
            password: openstackpassword,
            host: openstackhost,
            tenantid: openstacktenantid,
            tenantname: openstacktenantname,
            projectname: openstackprojectname,
            providerName: providerName,
            serviceendpoints: serviceendpoints,
            keyname: openstackkeyname,
            orgId: orgId
        };

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.status(401).send("You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {

                    logger.debug("Able to get AWS Keypairs. %s", JSON.stringify(data));
                    openstackProvider.updateopenstackProviderById(providerId, providerData, function(err, updateCount) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                            if (err) {
                                res.status(500).send("Not able to fetch org.");
                                return;
                            }
                            if (orgs.length > 0) {
                                var dommyProvider = {
                                    _id: providerId,
                                    id: 9,
                                    username: openstackusername,
                                    password: openstackpassword,
                                    host: openstackhost,
                                    providerName: providerData.providerName,
                                    orgId: orgs[0].rowid,
                                    orgName: orgs[0].orgname
                                };
                                res.send(dommyProvider);
                                return;
                            }
                        });
                    });

                }
            });
        });
    });

    // Delete a particular AWS Provider.
    app.delete('/openstack/providers/:providerId', function(req, res) {
        logger.debug("Enter delete() for /openstack/providers/%s", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var providerId = req.params.providerId.trim();

        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {
                    VMImage.getImageByProviderId(providerId, function(err, anImage) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        if (anImage) {
                            res.send(403, "Provider already used by Some Images.To delete provider please delete respective Images first.");
                            return;
                        }

                        openstackProvider.removeopenstackProviderById(providerId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Exit delete() for /providers/%s", req.params.providerId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                                return;
                            } else {
                                res.send(400);
                                return;
                            }
                        });
                    });
                }
            });
        });
    });


    // Create AWS Provider.
    app.post('/aws/providers', function(req, res) {
        logger.debug("Enter post() for /providers.", typeof req.body.fileName);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'create';
        var accessKey = req.body.accessKey;
        var secretKey = req.body.secretKey;
        var providerName = req.body.providerName;
        var providerType = req.body.providerType;
        var orgId = req.body.orgId;

        if (typeof accessKey === 'undefined' || accessKey.length === 0) {
            res.status(400).send("Please Enter AccessKey.");
            return;
        }
        if (typeof secretKey === 'undefined' || secretKey.length === 0) {
            res.status(400).send("Please Enter SecretKey.");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("Please Enter Name.");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send("Please Enter ProviderType.");
            return;
        }
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(400);
            res.send("Please Select Any Organization.");
            return;
        }
        var region;
        if (typeof req.body.region === 'string') {
            logger.debug("inside single region: ", req.body.region);
            region = req.body.region;
        } else {
            region = req.body.region[0];
        }
        logger.debug("Final Region:  ", region)

        var keys = [];
        keys.push(accessKey);
        keys.push(secretKey);
        cryptography.encryptMultipleText(keys, cryptoConfig.encryptionEncoding, cryptoConfig.decryptionEncoding, function(err, encryptedKeys) {
            if (err) {
                res.sned(500, "Failed to encrypt accessKey or secretKey");
                return;
            }
            logger.debug("Returned encrypted keys: ", encryptedKeys);
            var providerData = {
                id: 9,
                accessKey: encryptedKeys[0],
                secretKey: encryptedKeys[1],
                providerName: providerName,
                providerType: providerType,
                orgId: orgId
            };
            var ec2 = new EC2({
                "access_key": accessKey,
                "secret_key": secretKey,
                "region": region
            });
            usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
                if (!err) {
                    if (data == false) {
                        logger.debug('No permission to ' + permissionto + ' on ' + category);
                        res.send(401, "You don't have permission to perform this operation.");
                        return;
                    }
                } else {
                    logger.error("Hit and error in haspermission:", err);
                    res.send(500);
                    return;
                }

                masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                    if (err) {
                        res.status(500).send("Failed to fetch User.");
                        return;
                    }
                    if (anUser) {
                        ec2.describeKeyPairs(function(err, data) {
                            if (err) {
                                logger.debug("Unable to get AWS Keypairs");
                                res.status(500).send("Invalid AccessKey or SecretKey.");
                                return;
                            }
                            logger.debug("Able to get AWS Keypairs. %s", JSON.stringify(data));
                            AWSProvider.getAWSProviderByName(providerData.providerName, providerData.orgId, function(err, prov) {
                                if (err) {
                                    logger.error("err. ", err);
                                }
                                if (prov) {
                                    logger.debug("getAWSProviderByName: ", JSON.stringify(prov));
                                    res.status(409).send("Provider name already exist.");
                                    return;
                                }
                                AWSProvider.createNew(providerData, function(err, provider) {
                                    if (err) {
                                        logger.error("err. ", err);
                                        res.status(500).send("Failed to create Provider.");
                                        return;
                                    }
                                    AWSKeyPair.createNew(req, provider._id, function(err, keyPair) {
                                        masterUtil.getOrgById(providerData.orgId, function(err, orgs) {
                                            if (err) {
                                                res.status(500).send("Not able to fetch org.");
                                                return;
                                            }
                                            if (orgs.length > 0) {
                                                if (keyPair) {
                                                    var dommyProvider = {
                                                        _id: provider._id,
                                                        id: 9,
                                                        accessKey: provider.accessKey,
                                                        secretKey: provider.secretKey,
                                                        providerName: provider.providerName,
                                                        providerType: provider.providerType,
                                                        orgId: orgs[0].rowid,
                                                        orgName: orgs[0].orgname,
                                                        __v: provider.__v,
                                                        keyPairs: keyPair
                                                    };
                                                    res.send(dommyProvider);
                                                    return;
                                                }
                                            }
                                        })
                                    });
                                    logger.debug("Exit post() for /providers");
                                });
                            });
                        });
                    }
                });
            });
        });
    });

    // Return list of all available AWS Providers.
    app.get('/aws/providers', function(req, res) {
        logger.debug("Enter get() for /providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers && providers.length > 0) {
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.status(500).send("Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        providersList.push(providers[i]);
                                        if (providers.length === providersList.length) {
                                            res.send(providersList);
                                            return;
                                        }
                                    });
                                }
                            } else {
                                res.send(200, []);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.sned(500, "Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        providersList.push(providers[i]);
                                        if (providers.length === providersList.length) {
                                            res.send(providersList);
                                            return;
                                        }
                                    });
                                }
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            }
        });
    });

    // Update a particular AWS Provider
    app.post('/aws/providers/:providerId/update', function(req, res) {
        logger.debug("Enter post() for /providers/%s/update", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'modify';
        var accessKey = req.body.accessKey.trim();
        var secretKey = req.body.secretKey.trim();
        var providerName = req.body.providerName.trim();
        var providerId = req.params.providerId.trim();
        var orgId = req.body.orgId;
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(400).send("{Please Enter ProviderId.}");
            return;
        }
        if (typeof accessKey === 'undefined' || accessKey.length === 0) {
            res.status(400).send("{Please Enter AccessKey.}");
            return;
        }
        if (typeof secretKey === 'undefined' || secretKey.length === 0) {
            res.status(400).send("{Please Enter SecretKey.}");
            return;
        }
        if (typeof providerName === 'undefined' || providerName.length === 0) {
            res.status(400).send("{Please Enter Name.}");
            return;
        }

        AWSKeyPair.getAWSKeyPairByProviderId(providerId, function(err, keypairs) {
            if (err) {
                res.status(500).send("Failed to fetch Keypairs.")
            }
            if (keypairs) {
                var region = keypairs[0].region;
                var keys = [];
                keys.push(accessKey);
                keys.push(secretKey);
                cryptography.encryptMultipleText(keys, cryptoConfig.encryptionEncoding, cryptoConfig.decryptionEncoding, function(err, encryptedKeys) {
                    if (err) {
                        res.sned(500, "Failed to encrypt accessKey or secretKey");
                        return;
                    }
                    var providerData = {
                        id: 9,
                        accessKey: encryptedKeys[0],
                        secretKey: encryptedKeys[1],
                        providerName: providerName,
                        orgId: orgId
                    };
                    var ec2 = new EC2({
                        "access_key": accessKey,
                        "secret_key": secretKey,
                        "region": region
                    });
                    usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
                        if (!err) {
                            logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                            if (data == false) {
                                logger.debug('No permission to ' + permissionto + ' on ' + category);
                                res.send(401, "You don't have permission to perform this operation.");
                                return;
                            }
                        } else {
                            logger.error("Hit and error in haspermission:", err);
                            res.send(500);
                            return;
                        }

                        masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                            if (err) {
                                res.status(500).send("Failed to fetch User.");
                            }
                            if (anUser) {
                                ec2.describeKeyPairs(function(err, data) {
                                    if (err) {
                                        logger.debug("Unable to get AWS Keypairs");
                                        res.status(500).send("Invalid AccessKey or SecretKey.");
                                        return;
                                    }
                                    AWSProvider.updateAWSProviderById(providerId, providerData, function(err, updateCount) {
                                        if (err) {
                                            logger.error(err);
                                            res.status(500).send(errorResponses.db.error);
                                            return;
                                        }
                                        if (typeof req.body.keyPairName === 'undefined') {
                                            res.send({
                                                updateCount: updateCount
                                            });
                                            return;
                                        } else {
                                            AWSKeyPair.createNew(req, providerId, function(err, keyPair) {
                                                if (updateCount) {
                                                    res.send({
                                                        updateCount: updateCount
                                                    });
                                                } else {
                                                    res.send(400);
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
        });
    });

    // Delete a particular AWS Provider.
    app.delete('/aws/providers/:providerId', function(req, res) {
        logger.debug("Enter delete() for /providers/%s", req.params.providerId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send("Please Enter ProviderId.");
            return;
        }

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {
                    VMImage.getImageByProviderId(providerId, function(err, anImage) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        if (anImage) {
                            res.send(403, "Provider already used by Some Images.To delete provider please delete respective Images first.");
                            return;
                        }

                        AWSProvider.removeAWSProviderById(providerId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Enter delete() for /providers/%s", req.params.providerId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                            } else {
                                res.send(400);
                            }
                        });
                    });
                }
            });
        });
    });

    // Delete a particular AWS Provider.
    app.delete('/aws/providers/keypairs/:keyPairId', function(req, res) {
        logger.debug("Enter delete() for /aws/providers/keypairs/%s", req.params.keyPairId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var keyPairId = req.params.keyPairId.trim();
        if (typeof keyPairId === 'undefined' || keyPairId.length === 0) {
            res.status(500).send("Please Enter keyPairId.");
            return;
        }
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send("Failed to fetch User.");
                }
                if (anUser) {
                    if (data && anUser.orgname_rowid[0] !== "") {
                        logger.debug("Inside check not authorized.");
                        res.send(401, "You don't have permission to perform this operation.");
                        return;
                    }
                    blueprints.getBlueprintByKeyPairId(keyPairId, function(err, aBluePrint) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send(errorResponses.db.error);
                            return;
                        }
                        if (aBluePrint.length) {
                            res.send(403, "KeyPair already used by Some BluePrints.To delete KeyPair please delete respective BluePrints First.");
                            return;
                        } else {
                            instances.getInstanceByKeyPairId(keyPairId, function(err, anInstance) {
                                if (err) {
                                    logger.error(err);
                                    res.status(500).send(errorResponses.db.error);
                                    return;
                                }
                                if (anInstance.length) {
                                    res.status(403).send("KeyPair is already used by Instance.");
                                } else {
                                    AWSKeyPair.removeAWSKeyPairById(keyPairId, function(err, deleteCount) {
                                        if (deleteCount) {
                                            logger.debug("KeyPair deleted", keyPairId);
                                            res.send({
                                                deleteCount: deleteCount
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
    // Return all available security groups from AWS.
    app.post('/aws/providers/securitygroups', function(req, res) {
        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });

        ec2.getSecurityGroups(function(err, data) {
            if (err) {
                logger.error("Unable to get AWS Security Groups. ", err);
                res.status(500).send("Unable to get AWS Security Groups.");
                return;
            }
            res.send(data);
        });
    });

    // Return all available keypairs from AWS.
    app.post('/aws/providers/keypairs/list', function(req, res) {
        logger.debug("Enter for Provider keypairs.");

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });

        ec2.describeKeyPairs(function(err, data) {
            if (err) {
                logger.error("Unable to get AWS Keypairs: ", err);
                res.status(500).send("Invalid AccessKey or SecretKey.");
                return;
            }
            res.send(data);
        });
    });

    // Return all available security groups from AWS for VPC.
    app.post('/aws/providers/vpc/:vpcId/securitygroups', function(req, res) {
        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });

        ec2.getSecurityGroupsForVPC(req.params.vpcId, function(err, data) {
            if (err) {
                logger.error("Unable to get AWS Security Groups for VPC.");
                res.status(500).send("Unable to get AWS Security Groups for VPC.");
                return;
            }
            res.send(data);
        });
    });

    // Return all VPCs w.r.t. region
    app.post('/aws/providers/describe/vpcs', function(req, res) {
        logger.debug("Enter describeVpcs ");

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });
        ec2.describeVpcs(function(err, data) {
            if (err) {
                logger.error("Unable to describe Vpcs from AWS.", err);
                res.status(500).send("Unable to Describe Vpcs from AWS.");
                return;
            }
            res.send(data);
        });
    });

    // Return all Subnets w.r.t. vpc
    app.post('/aws/providers/vpc/:vpcId/subnets', function(req, res) {
        logger.debug("Enter describeSubnets ");

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });
        ec2.describeSubnets(req.params.vpcId, function(err, data) {
            if (err) {
                logger.error("Unable to describeSubnets from AWS.", err);
                res.status(500).send("Unable to describeSubnets from AWS.");
                return;
            }
            res.send(data);
        });
    });

    app.get('/aws/providers/permission/set', function(req, res) {
        masterUtil.checkPermission(req.session.user.cn, function(err, permissionSet) {
            if (err) {
                res.status(500).send("Error for permissionSet.");
            }
            if (permissionSet) {
                res.send(permissionSet);
            } else {
                res.send([]);
            }
        });
    });

    // Return AWS Providers respect to orgid.
    app.get('/aws/providers/org/:orgId', function(req, res) {
        logger.debug("Enter get() for /providers/org/%s", req.params.orgId);
        var orgId = req.params.orgId.trim();
        if (typeof orgId === 'undefined' || orgId.length === 0) {
            res.status(500).send("Please Enter orgId.");
            return;
        }
        AWSProvider.getAWSProvidersByOrgId(orgId, function(err, providers) {
            if (err) {
                logger.error(err);
                res.status(500).send(errorResponses.db.error);
                return;
            }
            if (providers) {
                res.send(providers);
                return;
            } else {
                res.send([]);
                return;
            }
        });
    });


    // Return list of all types of available providers.
    app.get('/allproviders/list', function(req, res) {
        logger.debug("Enter get() for /allproviders/list");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send("Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.status(500).send("Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = {};
                            if (providers && providers.length > 0) {
                                var awsProviderList = [];
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.status(500).send("Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        awsProviderList.push(providers[i]);
                                    });
                                }
                                providersList.awsProviders = awsProviderList;
                            } else {
                                providersList.awsProviders = [];
                            }

                            openstackProvider.getopenstackProvidersForOrg(orgList, function(err, openstackProviders) {
                                if (err) {
                                    logger.error(err);
                                    res.status(500).send(errorResponses.db.error);
                                    return;
                                }

                                if (openstackProviders != null) {
                                    if (openstackProviders.length > 0) {
                                        providersList.openstackProviders = openstackProviders;
                                    }
                                } else {
                                    providersList.openstackProviders = [];
                                }

                                vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, vmwareProviders) {
                                    if (err) {
                                        logger.error(err);
                                        res.status(500).send(errorResponses.db.error);
                                        return;
                                    }
                                    if (vmwareProviders != null) {
                                        if (vmwareProviders.length > 0) {
                                            providersList.vmwareProviders = vmwareProviders;
                                        }
                                    } else {
                                        providersList.vmwareProviders = [];
                                    }

                                    hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, hpCloudProviders) {
                                        if (err) {
                                            logger.error(err);
                                            res.status(500).send(errorResponses.db.error);
                                            return;
                                        }
                                        if (hpCloudProviders != null) {
                                            for (var i = 0; i < hpCloudProviders.length; i++) {
                                                hpCloudProviders[i]['providerType'] = hpCloudProviders[i]['providerType'].toUpperCase();
                                            }
                                            if (hpCloudProviders.length > 0) {
                                                providersList.hpPlublicCloudProviders = hpCloudProviders;
                                            }
                                        } else {
                                            providersList.hpPlublicCloudProviders = [];
                                        }

                                        azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, azureProviders) {

                                            if (err) {
                                                logger.error(err);
                                                res.status(500).send(errorResponses.db.error);
                                                return;
                                            }
                                            if (azureProviders != null) {
                                                for (var i = 0; i < azureProviders.length; i++) {
                                                    azureProviders[i]['providerType'] = azureProviders[i]['providerType'].toUpperCase();
                                                }
                                                if (azureProviders.length > 0) {
                                                    providersList.azureProviders = azureProviders;
                                                    res.send(providersList);
                                                    return;
                                                }
                                            } else {
                                                providersList.azureProviders = [];
                                                res.send(200, providersList);
                                                return;
                                            }
                                        });

                                    });

                                });

                            });

                        });
                    } else {
                        res.status(200).send([]);
                        return;
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send('Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send(errorResponses.db.error);
                                return;
                            }
                            var providersList = {};
                            if (providers.length > 0) {
                                var awsProviderList = [];
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.status(500).send("Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        awsProviderList.push(providers[i]);
                                    });
                                }
                                providersList.awsProviders = awsProviderList;
                            } else {
                                providersList.awsProviders = [];
                            }

                            openstackProvider.getopenstackProvidersForOrg(orgList, function(err, openstackProviders) {
                                if (err) {
                                    logger.error(err);
                                    res.status(500).send(errorResponses.db.error);
                                    return;
                                }

                                if (openstackProviders != null) {
                                    if (openstackProviders.length > 0) {
                                        providersList.openstackProviders = openstackProviders;
                                    }
                                } else {
                                    providersList.openstackProviders = [];
                                }

                                vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, vmwareProviders) {
                                    if (err) {
                                        logger.error(err);
                                        res.status(500).send(errorResponses.db.error);
                                        return;
                                    }
                                    if (vmwareProviders != null) {
                                        if (vmwareProviders.length > 0) {
                                            providersList.vmwareProviders = vmwareProviders;
                                        }
                                    } else {
                                        providersList.vmwareProviders = [];
                                    }

                                    hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, hpCloudProviders) {
                                        if (err) {
                                            logger.error(err);
                                            res.status(500).send(errorResponses.db.error);
                                            return;
                                        }
                                        if (hpCloudProviders != null) {
                                            for (var i = 0; i < hpCloudProviders.length; i++) {
                                                hpCloudProviders[i]['providerType'] = hpCloudProviders[i]['providerType'].toUpperCase();
                                            }
                                            if (hpCloudProviders.length > 0) {
                                                providersList.hpPlublicCloudProviders = hpCloudProviders;
                                            }
                                        } else {
                                            providersList.hpPlublicCloudProviders = [];
                                        }

                                        azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, azureProviders) {
                                            if (err) {
                                                logger.error(err);
                                                res.status(500).send(errorResponses.db.error);
                                                return;
                                            }
                                            if (azureProviders != null) {
                                                for (var i = 0; i < azureProviders.length; i++) {
                                                    azureProviders[i]['providerType'] = azureProviders[i]['providerType'].toUpperCase();
                                                }
                                                if (azureProviders.length > 0) {
                                                    providersList.azureProviders = azureProviders;
                                                    res.send(providersList);
                                                    return;
                                                }
                                            } else {
                                                providersList.azureProviders = [];
                                                res.send(200, providersList);
                                                return;
                                            }
                                        });

                                    });

                                });

                            });

                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            }
        });
    });


    // List out all aws nodes.
    app.post('/aws/providers/node/list', function(req, res) {
        logger.debug("Enter List AWS Nodes: ");

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });
        ec2.listInstances(function(err, nodes) {
            if (err) {
                logger.error("Unable to list nodes from AWS.", err);
                res.status(500).send("Unable to list nodes from AWS.");
                return;
            }
            logger.debug("Success to list nodes from AWS.");
            var nodeList = [];
            for (var i = 0; i < nodes.Reservations.length; i++) {
                var instance = {
                    "instance": nodes.Reservations[i].Instances[0].InstanceId,
                    "privateIp": nodes.Reservations[i].Instances[0].PrivateIpAddress,
                    "publicIp": nodes.Reservations[i].Instances[0].PublicIpAddress,
                    "privateDnsName": nodes.Reservations[i].Instances[0].PrivateDnsName
                };
                nodeList.push(instance);
            }
            var nodeListLength = nodeList.length;
            logger.debug("I am in count of Total Instances", nodeListLength);
            res.send(nodeList);
        });
    });
    // List out all Active AWS nodes.
    app.post('/aws/providers/activenode/list', function(req, res) {
        logger.debug("Enter List Active AWS Nodes: ");

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });
        ec2.listActiveInstances(function(err, nodes) {
            if (err) {
                logger.debug("Unable to list nodes from AWS.", err);
                res.send("Unable to list nodes from AWS.", 500);
                return;
            }
            logger.debug("Success to list nodes from AWS.");
            var nodeList = [];
            for (var i = 0; i < nodes.Reservations.length; i++) {
                var instance = {
                    "instance": nodes.Reservations[i].Instances[0].InstanceId,
                    "privateIp": nodes.Reservations[i].Instances[0].PrivateIpAddress,
                    "publicIp": nodes.Reservations[i].Instances[0].PublicIpAddress,
                    "privateDnsName": nodes.Reservations[i].Instances[0].PrivateDnsName
                };
                nodeList.push(instance);
            }
            var nodeListLength = nodeList.length;
            logger.debug("I am in count of Active Instances", nodeListLength);
            res.send(nodeList);
        });
    });
   
    app.get('/aws/dashboard/providers/:id', function(req, res) {
        var client = new rc();
        var id = req.params.id;
        console.log(id);
        client.get('http://localhost:3001/aws/providers/' + id,
            function(body, response) {
                var json = JSON.parse(body);
                var access = json.accessKey;
                var secret = json.secretKey;

                cost.getcost(access, secret, function(err, cost) {
                    res.send(cost);
                });
            });
    });
}

