
/**
 * @api {get} /providers/:providerId/unmanagedInstances?page=1&pageSize=5&search=i-656ae2a3&filterBy=region:us-west-2+state:running,stopped&sortBy=state&sortOrder=asc
 * @apiName /providers/:providerId/unmanagedInstances
 * @apiGroup UnmanagedInstance List with Pagination,Sorting,Searching and Filtering
 *
 *
 * @apiParam {String} providerId          Unique Provider ID.
 * @apiParam {Number} [page] Current Page default is 1.
 * @apiParam {Number} [pageSize]  Records per page default is 10.
 * @apiParam {String} [search]  User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]   User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]  The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]  User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     unmanagedInstances: [{"_id":"56e7a198789daf6c3863b25c","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","providerId":"56e2a90dccdaec5111a74e2f","providerType":"aws","providerData":{"region":"us-west-1"},"platformId":"i-1d97d593","ip":"52.77.240.203","os":"linux","state":"running","__v":0},
 *     {"_id":"56e7a199789daf6c3863b263","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","providerId":"56e2a90dccdaec5111a74e2f","providerType":"aws","providerData":{"region":"us-west-1"},"platformId":"i-9d0f3118","ip":"54.88.125.156","os":"linux","state":"running","__v":0,"tags":{"Name":"SensuServer"}},
 *     {"_id":"56e7a19a789daf6c3863b26d","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","providerId":"56e2a90dccdaec5111a74e2f","providerType":"aws","providerData":{"region":"us-west-1"},"platformId":"i-e75fb552","ip":"10.0.0.106","os":"linux","state":"running","__v":0,"tags":{"Name":"shreeram"}},
 *     {"_id":"56e7a19a789daf6c3863b26e","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","providerId":"56e2a90dccdaec5111a74e2f","providerType":"aws","providerData":{"region":"us-west-1"},"platformId":"i-7bc992b9","ip":"54.67.35.103","os":"linux","state":"running","__v":0,"tags":{"Name":"NginX_Instance","Owner":"Hamid","Environment":"Production","Role":"WebGateway","Bill":"Catalyst"}},
 *     {"_id":"56e7a19a789daf6c3863b273","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","providerId":"56e2a90dccdaec5111a74e2f","providerType":"aws","providerData":{"region":"us-west-1"},"platformId":"i-d3411313","ip":"10.0.1.92","os":"linux","state":"running","__v":0,"tags":{"Name":"MonitoringServer","Environment":"Production","Owner":"Hamid","Bill":"Catalyst"}
 *     }],
 *     metaData:{totalRecords:48,
 *     pageSize:5,
 *     page:1,
 *     totalPages:10,
 *     sortBy:state,
 *     sortOrder:asc
 *     filterBy:{region:'us-west-1',state:['running','stopped']}}
 *     }
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'paginationRequest'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'paginationRequest'}
 *     };
 * @apiError 404 Not Found.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:404,
 *      message:'Not Found',
 *      fields:{errorMessage:'The requested resource could not be found but may be available in the future',attribute:'providerId'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'providerId'}
 *     };
 */


/**
 * @api {get} /blueprintInfo/:blueprintId/
 * @apiName /blueprintInfo/:blueprintId/
 * @apiGroup Blueprint Information
 *
 *
 * @apiParam {String} blueprintId          Unique Blueprint Id.
 *
 * @apiSuccess [JSONObject]   Blueprint Info
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     blueprintInfo:{
 *     "_id": ObjectId("56fd004eeecf8ac55269e4a6"),
 *     "orgname": "Phoenix",
 *     "productgroupname": "PhoenixBG",
 *     "projectname": "PhoenixApp",
 *     "name": "TestBlueprint",
 *     "templateId": "TestTemplate",
 *     "templateType":"chef",
 *     "blueprintType": "instance_launch",
 *     "users": ["superadmin"],
 *     "providerType":"AWS",
 *     "ProviderName":"AWSProvider",
 *     "keyPairName": "cat-cal",
 *     "imageName": "Test Image",
 *     "region" : "us-west-1",
 *     "blueprintConfig": {
 *                "cloudProviderType": "aws","
 *                "cloudProviderData":
 *                                 {
 *                                 "keyPairId" : "56f1459ec9f075275f4ea9bf",
 *			                       "instanceType" : "t2.small",
 *			                       "instanceAmiid" : "ami-06116566",
 *			                       "instanceUsername" : "root",
 *			                       "vpcId" : "vpc-52110130",
 *			                       "subnetId" : "subnet-e49e8286",
 *			                       "imageId" : "56fa21c02a3efd265302040e",
 *			                       "instanceOS" : "linux",
 *			                       "instanceCount" : "1",
 *                                 "securityGroupIds": ["sg-99a3bcfb"]
 *                                 },
 *                "infraMangerType": "chef",
 *                "infraManagerData":
 *                                         {
 *                                           "latestVersion": "0.1",
 *                                           "versionsList": [{"ver": "0.1","runlist": ["recipe[lamp-stack]", "recipe[tomcat]"]}]
 *                                         }
 *                     }
 *           }
 *     }
 *
 * * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     blueprintInfo:{
 *     "_id": ObjectId("56fd004eeecf8ac55269e4a6"),
 *     "orgname": "Phoenix",
 *     "productgroupname": "PhoenixBG",
 *     "projectname": "PhoenixApp",
 *     "name" : "SoftwareAzure",
 *	   "templateId" : "TestTemplate",
 *     "templateType" : "chef",
 *     "blueprintType": "azure_launch",
 *     "users": ["superadmin"],
 *     "providerType":"AZURE",
 *     "ProviderName":"AzureProvider",
 *     "pemFileName": "rlCatalyst.pem",
 *     "keyFileName" : "rlCatalyst.key",
 *     "keyPairName": "cat-cal",
 *     "imageName": "Azure Image",
 *     "region" : "us-west-1",
 *     "blueprintConfig": {
 *     	  "cloudProviderData" : {
 *			"cloudProviderType" : "azure",
 *			"cloudProviderId" : "56fcea6dd24b7bd84c9d337a",
 *			"securityGroupIds" : "8080",
 *			"instanceType" : "Basic_A3",
 *			"instanceAmiid" : "d4d-ubuntu14",
 * 			"vpcId" : "AzureToRLDC",
 *			"region" : "East US",
 *			"subnetId" : "GatewaySubnet",
 *			"imageId" : "56fa4bb6b22e7cf36529f099",
 *			"instanceOS" : "linux",
 *			"instanceCount" : "1",
 *			"infraMangerType" : "chef",
 *			"infraManagerId" : "ef074bc9-d61c-4d3a-8038-17878422f965",
 *			"infraManagerData" : {
 *				"latestVersion" : "0.1",
 * 				"_id" : ObjectId("56fd004eeecf8ac55269e4a3"),
 *				"versionsList" : [{
 *						"ver" : "0.1",
 *						"_id" : ObjectId("56fd004eeecf8ac55269e4a4"),
 * 						"runlist" : ["recipe[lamp-stack]","recipe[tomcat]"]
 *					}]
 *			     },
 *			"_id" : ObjectId("56fd004eeecf8ac55269e4a5")
 *		    }
 *
 *       }
 *    }
 *  }
 *
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     blueprintInfo:{
 *     "_id": ObjectId("56fd004eeecf8ac55269e4a6"),
 *     "orgname": "Phoenix",
 *     "productgroupname": "PhoenixBG",
 *     "projectname": "PhoenixApp",
 *     "name" : "OSBluePrint",
 *	   "templateId" : "Test Image",
 *	   "templateType" : "ami",
 *     "blueprintType": "instance_launch",
 *     "users": ["superadmin"],
 *     "providerType":"AWS",
 *     "ProviderName":"AWSProvider",
 *     "keyPairName": "cat-cal",
 *     "imageName": "Test Image",
 *     "region":"US East",
 *     "blueprintConfig": {"cloudProviderType": "aws",
 *                         "cloudProviderData":
 *                                 {
 *                                 "keyPairId" : "56f1459ec9f075275f4ea9bf",
 *			                       "instanceType" : "t2.small",
 *			                       "instanceAmiid" : "ami-06116566",
 *			                       "instanceUsername" : "root",
 *			                       "vpcId" : "vpc-52110130",
 *			                       "subnetId" : "subnet-e49e8286",
 *			                       "imageId" : "56fa21c02a3efd265302040e",
 *			                       "instanceOS" : "linux",
 *			                       "instanceCount" : "1",
 *                                 "securityGroupIds": ["sg-99a3bcfb"]
 *                                 },
 *                        "infraMangerType": "chef",
 *                        "infraManagerData":
 *                                         {
 *                                           "latestVersion": "0.1",
 *                                           "versionsList": [{"ver": "0.1","runlist": ["recipe[lamp-stack]", "recipe[tomcat]"]}]
 *                                         }
 *                       }
 *                  }
 *     }
 *
 *
 * * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     blueprintInfo:{
 *     "_id": ObjectId("56fd004eeecf8ac55269e4a6"),
 *     "orgname": "Phoenix",
 *     "productgroupname": "PhoenixBG",
 *     "projectname": "PhoenixApp",
 *     "name" : "CloudBluePrint",
 *	   "templateId" : "CloudTemplate",
 *     "templateType" : "cft",
 *     "blueprintType": "aws_cf",
 *     "users": ["superadmin"],
 *     "providerType":"AWS",
 *     "ProviderName":"AWSProvider",
 *     "blueprintConfig": {
 *       	"cloudProviderId" : "56f1459ec9f075275f4ea9be",
 *		    "infraMangerType" : "chef",
 *		    "infraManagerId" : "ef074bc9-d61c-4d3a-8038-17878422f965",
 *		    "templateFile" : "b97cf8e9-7680-438e-8156-68e5a06dca29__template__JavaStack.template",
 *		    "region" : "us-west-1",
 *		    "_id" : ObjectId("56fa4992b22e7cf36529f08e"),
 *		    "instances" : [{
 *				"logicalId" : "JavaVM1",
 *				"username" : "ubuntu",
 *				"runlist" : [ ]
 *			},
 *			{
 *				"logicalId" : "JavaVM2",
 *				"username" : "",
 *				"runlist" : [ ]
 *			}],
 *		    "stackParameters" : [{
 * 				"ParameterKey" : "JavaStack",
 *  			"ParameterValue" : "java-test"
 *			},
 *			{
 *				"ParameterKey" : "KeyName",
 *				"ParameterValue" : "cat_instances"
 *			},
 *			{
 *				"ParameterKey" : "Subnet",
 *				"ParameterValue" : "subnet-3b1c1e4f"
 *			},
 *			{
 *				"ParameterKey" : "SecurityGroup",
 *				"ParameterValue" : "sg-e202e086"
 *			},
 *			{
 *				"ParameterKey" : "AMImageID",
 *				"ParameterValue" : "ami-5189a661"
 *			},
 *			{
 *				"ParameterKey" : "InstanceType",
 *				"ParameterValue" : "t2.micro"
 *			}]
 *       }
 *    }
 *   }
 *
 * * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     blueprintInfo:{
 *     "_id": ObjectId("56fd004eeecf8ac55269e4a6"),
 *     "orgname": "Phoenix",
 *     "productgroupname": "PhoenixBG",
 *     "projectname": "PhoenixApp",
 *     "name" : "DockerBluePrint",
 *	   "templateId" : "DockerTemplate",
 *	   "templateType" : "docker",
 *     "blueprintType": "docker",
 *     "users": ["superadmin"],
 *     "blueprintConfig": {
 *       	"dockerContainerPathsTitle" : "",
 *		    "dockerContainerPaths" : "ubuntu",
 *		    "dockerLaunchParameters" : "",
 *		    "dockerRepoName" : "",
 *		    "dockerImageName" : "",
 *		    "_id" : ObjectId("56fa49ccb22e7cf36529f090"),
 *		    "dockerCompose" : [{
 *				"dockercontainerpathstitle" : "DockerTemplate",
 *				"dockercontainerpaths" : "ubuntu",
 *				"dockerrepotags" : "latest",
 *				"dockerlaunchparameters" : " --name DockerTemplate",
 *				"dockerreponame" : "",
 *				"_id" : ObjectId("56fa49ccb22e7cf36529f091")
 *			}]
 *        }
 *      }
 *   }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'blueprintId'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'blueprintId'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'blueprintId'}
 *     };
 */


/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/containerList
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/containerList
 * @apiGroup Container List for Environment
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {String} envId          Unique Environment Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
<<<<<<< HEAD
 *     containerDetail:[{
 *            "_id": "56fa223d2a3efd2653020413","state":"running","created":1459231494210,"names":["ubuntu","windows"],"instanceIP":"128.12.134.54","containerID":24,"image":"Test Image","info":"container info"},
 *            {"_id": "56fa223d2a3efd2653020413","state":"running","created":1459231494210,"names":["ubuntu","windows"],"instanceIP":"128.12.134.54","containerID":24,"image":"Test Image","info":"container info"},
 *            {"_id": "56fa223d2a3efd2653020413","state":"running","created":1459231494210,"names":["ubuntu","windows"],"instanceIP":"128.12.134.54","containerID":24,"image":"Test Image","info":"container info"}],
 *     metaData:{
 *        totalRecords:3,
 *        pageSize:5,
 *        page:1,
 *        totalPages:1,
 *        sortBy:state,
 *        sortOrder:desc
 *        filterBy:{state:['running']}
 *     containerList:[{
 *  "_id": "570b2d348ac77619618c37e4",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 * 	"Id": "bf32c85dc30acb6822b919c221a58e27002b369a4d1ea2621d49c3d57b0de629",
 *	"instanceIP": "192.168.152.208",
 *	"Image": "mysql",
 *	"ImageID": "2e4e46c28df23ed2251767154db96356ab8cb4ff5010eca385be143332505dc9",
 *	"Command": "docker-entrypoint.sh /bin/bash",
 * 	"Created": 1460027731,
 *	"Status": "Exited (0) 45 hours ago",
 *	"HostConfig": {
 *		"NetworkMode": "default"
 *	},
 *	"Ports": [],
 *	"Names": [
 *		"/gigantic_mahavira"
 *	]},{
 *	"_id": "570b2d348ac77619618c37e5",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 *	"Id": "41d7cf87ff28e66bfb7f97c5df2a0d4d0407e9fccf1e4e109a72e32605a3ef47",
 *	"instanceIP": "192.168.152.208",
 *	"Image": "ubuntu",
 *	"ImageID": "c9ea60d0b9055c27be18c0f1f97a6d73544ecc4d12b06cab063b9b743c09ff43",
 *	"Command": "/bin/bash",
 *	"Created": 1460018250,
 *	"Status": "Exited (130) 3 days ago",
 *	"HostConfig": {
 *		"NetworkMode": "default"
 *	},
 *	"Ports": [],
 *	"Names": [
 *		"/condescending_allen"
 *	]
 *   }],
 *     metaData:{
 *        totalRecords:2,
 *        pageSize:5,
 *        page:1,
 *        totalPages:1,
 *        sortBy:Status,
 *        sortOrder:desc
 *     }
 *     }
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Environment Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Environment Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Environment Id'}
 *     };
 */

/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/instances
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/instances
 * @apiGroup Instance List for Environment
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {String} envId          Unique Environment Id
 * @apiParam {String} instanceType   Instance Type
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by instanceState.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     {"instances":[{"_id":"56fa1a6d2a3efd26530203fb","name":"192.168.152.208","orgId":"46d1da9a-d927-41dc-8e9e-7e926d927537","bgId":"7e3500f1-58f9-43e2-b9eb-347b2e4d129d","projectId":"b38ccedc-da2c-4e2c-a278-c66333564719","envId":"df87280c-ef3d-4e45-ac23-fcb77c845409","instanceIP":"192.168.152.208","instanceState":"running","bootStrapStatus":"success","__v":0,"taskIds":[],"chefClientExecutionIds":[],"actionLogs":[{"_id":"56fa1a6d2a3efd26530203fd","actionData":{"runlist":[]},"timeStarted":1459231341803,"user":"superadmin","success":true,"completed":true,"name":"Bootstrap","type":1,"timeEnded":1459231495251}],"serviceIds":[],"blueprintData":{"blueprintName":"192.168.152.208","templateId":"chef_import","iconPath":"../private/img/templateicons/chef_import.png","templateComponents":[]},"credentials":{"username":"rle0333","password":"OtKDQ4yY8+rl6z90Ll3KUA=="},"software":[],"chef":{"serverId":"ef074bc9-d61c-4d3a-8038-17878422f965","chefNodeName":"192.168.152.208"},"hardware":{"platform":"ubuntu","platformVersion":"14.04","architecture":"x86_64","os":"linux","memory":{"total":"8094692kB","free":"2871460kB"}},"users":["superadmin"],"appUrls":[{"name":"catalyst","url":"http://localhost:3001/","_id":"56fa1a6d2a3efd26530203fc"}],"attributes":[],"runlist":[]}],
 *     "metaData":{"totalRecords":1,"pageSize":10,"page":1,"totalPages":1,"sortBy":"instanceState","sortOrder":"asc"}
 *     }
 *     }
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Environment Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Environment Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Environment Id'}
 *     };
 */

/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/tasks
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/tasks
 * @apiGroup Orchestration List for Environment
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {String} envId          Unique Environment Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     {"tasks":[{
 *	"_id": "56fe1fb340e5982c6467fbba",
 *	"taskType": "chef",
 *	"name": "Test Job Durgesh",
 *	"description": "Durgesh",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 *	"taskConfig": {
 *		"_id": "56fe1fb340e5982c6467fbb9",
 *		"nodeIds": ["56fa1a6d2a3efd26530203fb"],
 *		"runlist": ["recipe[lamp-stack]", "recipe[tomcat]"],
 *		"taskType": "chef"
 *	},
 *	"__v": 0,
 *	"blueprintIds": [],
 *	"jobResultURLPattern": []
 * }],
 *     "metaData":{"totalRecords":1,"pageSize":10,"page":1,"totalPages":1,"sortBy":"name",sortOrder":"asc"}
 *     }
 *     }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Environment Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Environment Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Environment Id'}
 *     };
 */

/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/applications
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/applications
 * @apiGroup Application List for Project
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     {"applications":[{
 *	"_id": "56fe1fb340e5982c6467fbba",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 *	"name": "ApplicationTest",
 *	"iconpath": "Dev",
 *	"git": {
 *		"repoUrl": "Durgesh1988/git",
 *		"repoUsername": "Durgesh1988",
 *		"repoPassword": "12345678"
 *	},
 *	"users ": ["superadmin "],
 *	"buildId ": "fafafaf21415151351 "
 * }],
 *     "metaData":{"totalRecords":1,"pageSize":10,"page":1,"totalPages":1,"sortBy":"name",sortOrder":"asc"}
 *     }
 *     }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Project Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Project Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Project Id'}
 *     };
 */

/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/cftList
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/cftList
 * @apiGroup CFT List for Environment
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {String} envId          Unique Environment Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     {"cftList":[{
 *	"_id": "56fe1fb340e5982c6467fbba",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 *	"stackParameters": [{
 *		"_id": "56fe1fb340e5982c6467fbba",
 *		"ParameterKey": "JavaStack",
 *		"ParameterValue": "java-test"
 *	}],
 *	"templateFile": "rlCatalyst",
 *	"infraMangerType": "chef",
 *	"infraManagerId": "ef074bc9-d61c-4d3a-8038-17878422f965",
 * 	"infraManagerData": {
 *		"latestVersion": "0.1",
 *		"_id": "56fa4959b22e7cf36529f08a",
 *		"versionsList": [{
 *			"ver": "0.1",
 *			"_id": "56fa4959b22e7cf36529f08b",
 *			"runlist": []
 *		}]],
 *     "metaData":{"totalRecords":1,"pageSize":10,"page":1,"totalPages":1,"sortBy":"status",sortOrder":"asc"}
 *     }
 *     }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Environment Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Environment Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Environment Id'}
 *     };
 */

/**
 * @api {get}/organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/azurearms
 * @apiName /organizations/:orgId/businessgroups/:bgId/projects/:projectId/environments/:envId/azurearms
 * @apiGroup Azure ARM List for Environment
 *
 *
 * @apiParam {String} orgId          Unique Organization Id
 * @apiParam {String} bgId           Unique Business Group Id
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {String} envId          Unique Environment Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter Instance ID or IP Address for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by state.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=region:us-west-2+state:running,stopped.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     {"azurearms":[{
 *	"_id": "56fe1fb340e5982c6467fbba",
 *	"orgId": "46d1da9a-d927-41dc-8e9e-7e926d927537",
 *	"bgId": "7e3500f1-58f9-43e2-b9eb-347b2e4d129d",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"envId": "df87280c-ef3d-4e45-ac23-fcb77c845409",
 *	"parameters": [{
 *		"_id": "56fe1fb340e5982c6467fbba",
 *		"ParameterKey": "JavaStack",
 *		"ParameterValue": "java-test"
 *	}],
 *	"templateFile": "rlCatalyst",
 *	"infraMangerType": "chef",
 *	"infraManagerId": "ef074bc9-d61c-4d3a-8038-17878422f965",
 *	"infraManagerData": {
 *		"latestVersion": "0.1",
 *		"_id": "56fa4959b22e7cf36529f08a",
 *		"versionsList": [{
 *			"ver": "0.1",
 *			"_id": "56fa4959b22e7cf36529f08b",
 *			"runlist": []
 *		}]
 *	},
 *	"cloudProviderId": "56f1459ec9f075275f4ea9be",
 *	"deploymentName": "DurgeshARM",
 *	"deploymentId": "56f1459ec9f075275f4ea9be",
 *	"status": "running",
 *	"users ": ["superadmin "],
 *	"resourceGroup ": "Dev "
 *  }],
 *     "metaData":{"totalRecords":1,"pageSize":10,"page":1,"totalPages":1,"sortBy":"status",sortOrder":"asc"}
 *     }
 *     }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'Environment Id'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'Environment Id'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'Environment Id'}
 *     };

/**
 * @api {get}/app/deploy/pipeline/project/:projectId/projectList
 * @apiName /app/deploy/pipeline/project/:projectId/projectList
 * @apiGroup App Deploy Projects
 *
 *
 *
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter envSequence for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by loggedInUser.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=envSequence:Dev.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	"appProjects": [{
 *		"_id": "570b46a35bff54236e49ef6b",
 *		"loggedInUser": "superadmin",
 *		"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *		"__v": 0,
 *		"envSequence": ["Dev", "Prod"],
 *		"envId": ["Dev", "Prod"]
 *	}],
 *	"metaData": {
 *		"totalRecords": 1,
 *		"pageSize": 10,
 *		"page": 1,
 *		"totalPages": 1
 *	}
 * }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'App Deploy'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'App Deploy'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'App Deploy'}
 *     };
 */

/**
 * @api {get}/app/deploy/project/:projectId/appDeploylist
 * @apiName /app/deploy/project/:projectId/appDeploylist
 * @apiGroup All AppDeploy Information by Project
 *
 *
 *
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter applicationType or applicationName for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by applicationStatus.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=applicationName:D4D.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	"appDeploy": [{
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.03.106",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"applicationInstanceName": ["Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst"],
 *	"applicationNodeIP": ["54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114", "54.183.1.26", "54.183.227.76", "54.193.72.114"],
 * 	"applicationLastDeploy": ["2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000", "2016-03-30 05:04:05 +0000", "2016-03-30 05:28:34 +0000", "2016-03-31 05:17:25 +0000"],
 *	"applicationStatus": ["Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful"],
 *	"containerId": ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"],
 *	"hostName": ["ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-54.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal"],
 *	"envId": ["Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd", "Dev", "QA", "PreProd"],
 *	"appLogs": ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"]
 * }, {
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.02.100",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"applicationInstanceName": ["Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst", "Supercatalyst"],
 *	"applicationNodeIP": ["54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76", "54.183.227.76"],
 *	"applicationLastDeploy": ["2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000", "2016-03-30 05:43:17 +0000", "2015-03-31 11:17:25 +0000", "2014-09-22 05:17:25 +0000"],
 *	"applicationStatus": ["Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful", "Successful"],
 *	"containerId": ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"],
 *	"hostName": ["ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-99.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal", "ip-10-0-0-25.us-west-1.compute.internal"],
 *	"envId": ["QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev", "QA", "QA", "Dev"],
 *	"appLogs": ["NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA", "NA"]
 * }],
 *	"metaData": {
 *		"totalRecords": 2,
 *		"pageSize": 10,
 *		"page": 1,
 *		"totalPages": 1.
 *	    "sortBy":"applicationStatus",
 *	    "sortOrder":desc
 *	}
 * }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'AppDeploy Information by Project'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'AppDeploy Information by Project'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'AppDeploy Information by Project'}
 *     };
 */

/**
 * @api {get}/app/deploy/env/:envName/project/:projectId/appDeploylist
 * @apiName /app/deploy/env/:envName/project/:projectId/appDeploylist
 * @apiGroup AppDeploy Information by Project ID and  Environment Name
 *
 *
 * @apiParam {String} envName        Unique Environment Name
 * @apiParam {String} projectId      Unique Project Id
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter applicationType or applicationName for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by applicationStatus.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=applicationName:D4D.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	"appDeploy": [{
 *	"_id": "570b48fcf1f0f28388f4b071",
 *	"applicationLastDeploy": "2016-03-30 05:04:05 +0000",
 *	"appLogs": "NA",
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.03.106",
 *	"applicationInstanceName": "Supercatalyst",
 *	"applicationNodeIP": "54.183.1.26",
 *	"envId": "Dev",
 *	"hostName": "ip-10-0-0-54.us-west-1.compute.internal",
 *	"containerId": "NA",
 *	"applicationType": "Package",
 *	"applicationStatus": "Successful",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"__v": 0
 *}, {
 *	"_id": "570b48fdf1f0f28388f4b076",
 *	"applicationLastDeploy": "2014-09-22 05:17:25 +0000",
 *	"appLogs": "NA",
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.02.100",
 *	"applicationInstanceName": "Supercatalyst",
 *	"applicationNodeIP": "54.183.227.76",
 *	"envId": "Dev",
 *	"hostName": "ip-10-0-0-25.us-west-1.compute.internal",
 *	"containerId": "NA",
 *	"applicationType": "Package",
 *	"applicationStatus": "Successful",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"__v": 0
 *}],
 *	"metaData": {
 *		"totalRecords": 2,
 *		"pageSize": 10,
 *		"page": 1,
 *		"totalPages": 1.
 *	    "sortBy":"applicationStatus",
 *	    "sortOrder":desc
 *	}
 * }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'AppDeploy Information by Environment Name'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'AppDeploy Information by  Environment Name'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'AppDeploy Information by Environment Name'}
 *     };
 */


/**
 * @api {get}/app/deploy/env/:envName/appDeploylist
 * @apiName /app/deploy/env/:envName/appDeploylist
 * @apiGroup AppDeploy Information by  Environment Name
 *
 *
 * @apiParam {String} envName        Unique Environment Name
 * @apiParam {Number} [page]         Current Page default is 1.
 * @apiParam {Number} [pageSize]     Records per page default is 10.
 * @apiParam {String} [search]       User is able to search for specific attribute. User can enter applicationType or applicationName for specific search.
 * @apiParam {String} [sortBy]       User can sort the records for any field. Default: results are sorted by applicationStatus.
 * @apiParam {String} [sortOrder]    The sort order if sort parameter is provided. One of asc or desc. Default: desc
 * @apiParam {String} [filterBy]     User is able to filter the records for a set of attributes.Ex.filterBy=applicationName:D4D.
 *
 *
 *
 * @apiSuccess [JSONObject]
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *	"appDeploy": [{
 *	"_id": "570b48fcf1f0f28388f4b071",
 *	"applicationLastDeploy": "2016-03-30 05:04:05 +0000",
 *	"appLogs": "NA",
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.03.106",
 *	"applicationInstanceName": "Supercatalyst",
 *	"applicationNodeIP": "54.183.1.26",
 *	"envId": "Dev",
 *	"hostName": "ip-10-0-0-54.us-west-1.compute.internal",
 *	"containerId": "NA",
 *	"applicationType": "Package",
 *	"applicationStatus": "Successful",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"__v": 0
 *}, {
 *	"_id": "570b48fdf1f0f28388f4b076",
 *	"applicationLastDeploy": "2014-09-22 05:17:25 +0000",
 *	"appLogs": "NA",
 *	"applicationName": "D4D",
 *	"applicationVersion": "3.02.100",
 *	"applicationInstanceName": "Supercatalyst",
 *	"applicationNodeIP": "54.183.227.76",
 *	"envId": "Dev",
 *	"hostName": "ip-10-0-0-25.us-west-1.compute.internal",
 *	"containerId": "NA",
 *	"applicationType": "Package",
 *	"applicationStatus": "Successful",
 *	"projectId": "b38ccedc-da2c-4e2c-a278-c66333564719",
 *	"__v": 0
 *}],
 *	"metaData": {
 *		"totalRecords": 2,
 *		"pageSize": 10,
 *		"page": 1,
 *		"totalPages": 1.
 *	    "sortBy":"applicationStatus",
 *	    "sortOrder":desc
 *	}
 * }
 *
 *
 * @apiError 400 Bad Request.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:400,
 *      message:'Bad Request',
 *      fields:{errorMessage:'Bad Request',attribute:'AppDeploy Information by Environment Name'}
 *     };
 * @apiError 403 Forbidden.
 *
 * @apiErrorExample Error-Response:
 *    {
 *      code:403,
 *      message:'Forbidden',
 *      fields:{errorMessage:'The request was a valid request, but the server is refusing to respond to it',attribute:'AppDeploy Information by  Environment Name'}
 *     };
 * @apiError 500 InternalServerError.
 *
 * @apiErrorExample Error-Response:
 *     {
 *      code:500,
 *      message:'Internal Server Error',
 *      fields:{errorMessage:'Server Behaved Unexpectedly',attribute:'AppDeploy Information by Environment Name'}
 *     };
 */