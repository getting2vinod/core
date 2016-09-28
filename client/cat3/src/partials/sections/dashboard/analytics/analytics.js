(function (angular) {
	"use strict";
	angular.module('dashboard.analytics', ['apis.analytics','nvd3'])
		.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'modulePermissionProvider', function($stateProvider, $urlRouterProvider, $httpProvider, modulePermissionProvider) {
			var modulePerms = modulePermissionProvider.$get();
			$stateProvider.state('dashboard.analytics.cost', {
				url: "cost/",
				templateUrl: "src/partials/sections/dashboard/analytics/view/cost.html",
				controller: "costCtrl as cost",
				params:{filterView:{viewBy:true,splitUpType:true,org:true}},
				resolve: {
					auth: ["$q", function ($q) {
						var deferred = $q.defer();
						// instead, go to a different page
						if (modulePerms.analyticsBool()) {
							// everything is fine, proceed
							deferred.resolve();
						} else {
							deferred.reject({redirectTo: 'dashboard'});
						}
						return deferred.promise;

					}]
				}
			}).state('dashboard.analytics.capacity', {
				url: "capacity/",
				templateUrl: "src/partials/sections/dashboard/analytics/view/capacity.html",
				controller: "capacityCtrl as capacity",
				params:{filterView:{}},
				resolve: {
					auth: ["$q", function ($q) {
						var deferred = $q.defer();
						// instead, go to a different page
						if (modulePerms.analyticsBool()) {
							// everything is fine, proceed
							deferred.resolve();
						} else {
							deferred.reject({redirectTo: 'dashboard'});
						}
						return deferred.promise;

					}]
				}
			}).state('dashboard.analytics.usage', {
				url: "usage/",
				templateUrl: "src/partials/sections/dashboard/analytics/view/usage.html",
				controller: "usageCtrl as usage",
				params:{filterView:{org:true,provi:true,region:true,resources:true}},
				resolve: {
					auth: ["$q", function ($q) {
						var deferred = $q.defer();
						// instead, go to a different page
						if (modulePerms.analyticsBool()) {
							// everything is fine, proceed
							deferred.resolve();
						} else {
							deferred.reject({redirectTo: 'dashboard'});
						}
						return deferred.promise;

					}]
				}
			})
		}])
	.controller('analyticsCtrl',['$scope', '$rootScope','$state','genericServices', 'workzoneServices', 'toastr', function ($scope, $rootScope, $state, genericServices, workzoneServices, toastr) {
		var analytic = this;
		var splitUp=null;
		analytic.tabShowChat=true;
		analytic.tabShowReport=false;
		$scope.showTree = true;
		$rootScope.isOpenSidebar = false;
		$rootScope.dashboardChild = 'analytics';
		$rootScope.stateItems = $state.params;
		var treeNames = ['Analytics'];
		//$rootScope.$emit('treeNameUpdate', treeNames);
		$rootScope.$emit('HEADER_NAV_CHANGE', 'ANALYTICS');
		$rootScope.organNewEnt=[];
		$rootScope.organNewEnt.org = '0';
		$rootScope.splitUpCosts=[];
		analytic.viewByFilter='orgView';
		$scope.$watch(function() { return analytic.viewByFilter}, function(newVal, oldVal) {
				if(newVal === 'ProviderView'){
					$rootScope.viewType='ProviderView';
					$state.params.filterView.provi=true;
				} else {
					$rootScope.viewType='orgView';
					$state.params.filterView.provi=false;
				}
			$rootScope.stateItems = $state.params;
		}, true);
		$scope.$on('CHANGE_splitUp', function (event, data) {
			analytic.splitUp=data;
		});
		$scope.$watch(function() { return analytic.splitUp}, function(newVal, oldVal) {
			$scope.$broadcast('CHANGE_VIEW',newVal);
		}, true);
		$rootScope.filterNewEnt={};
		analytic.applyCount=0
		analytic.applyFilter = function(filterApp){
			$rootScope.filterApply= new Date();
			var obj=$rootScope.organObject,
				or=$rootScope.organNewEnt.org,
				bu=$rootScope.organNewEnt.buss,
				pr=$rootScope.organNewEnt.proj;
			$rootScope.filterNewEnt={}
			if(or){
				$rootScope.filterNewEnt.org={name:obj[or].name,id:obj[or].rowid,title:'Org'};
				$rootScope.filterNewEnt.provider='';
			}
			if(filterApp){
				if(bu){
					$rootScope.filterNewEnt.buss = {name:obj[or].businessGroups[bu].name,id:obj[or].businessGroups[bu].rowid,title:'BU'};
				}
				if(pr){
					$rootScope.filterNewEnt.proj = {name:obj[or].businessGroups[bu].projects[pr].name,id:obj[or].businessGroups[bu].projects[pr].rowid,title:'Project'};
				}

				if($rootScope.organNewEnt.provider){
					$rootScope.filterNewEnt.provider={name:$scope.providers[$rootScope.organNewEnt.provider].providerName,id:$scope.providers[$rootScope.organNewEnt.provider]._id,title:'Provider'};
				} else{
					$rootScope.filterNewEnt.provider='';
				}
			} else{
				$rootScope.organNewEnt={}
				$rootScope.organNewEnt.org=or;
				analytic.viewByFilter='orgView';
				analytic.splitUp=$rootScope.splitUpCosts[0];
			}
		};
		// // get organigetion
		genericServices.getTreeNew().then(function (orgs) {
			$rootScope.organObject = orgs;
			analytic.applyFilter(true);
		});
		$rootScope.organNewEnt=[];
		$rootScope.organNewEnt.org = '0';
		//$rootScope.organNewEnt.buss='0';
		//$rootScope.organNewEnt.proj='0';
		if (!$rootScope.stateParams.view) {
			$state.go('dashboard.analytics.cost');
		}
		analytic.hideTreeOverlay =function (){
			genericServices.hideTreeOverlay();
		};
		analytic.showTreeOverlay =function (){
			genericServices.showTreeOverlay();
		};
		analytic.tabShow=function(chat,report){
			analytic.tabShowChat=chat;
			analytic.tabShowReport=report;
		};

		analytic.hideTreeOverlay();
		$scope.getAllRegionsList = function() {
            workzoneServices.getAllRegionsList().then(function(response) {
                $scope.allRegions = response.data;
            }, function(error) {
                toastr.error(error);
            });
        };
        $scope.getProviders = function() {
            workzoneServices.getProviders().then(function(response) {
                $scope.providers = response.data;
            }, function(error) {
                toastr.error(error);
            });
        };
        $scope.getProviderRegions = function() {
            $scope.providerLoading = true;
            workzoneServices.getProviderRegions($scope.filter.providerId).then(function(response) {
                var keyPairs = response.data.keyPairs;
                var keyPairsLength = keyPairs.length;
                var regions = [];
                $scope.regions = [];
                if (keyPairsLength > 0 && $scope.allRegions.length > 0) {
                    for (var i = 0; i < keyPairsLength; i++) {
                        var regionId = keyPairs[i].region;
                        if (regions.indexOf(regionId) === -1) {
                            regions.push(regionId);
                            for (var j = 0; j < $scope.allRegions.length; j++) {
                                if ($scope.allRegions[j].region === regionId) {
                                    $scope.regions.push($scope.allRegions[j]);
                                    break;
                                }
                            }
                        }
                    }
                }
                $scope.providerLoading = false;
            }, function(error) {
                toastr.error(error);
                $scope.providerLoading = false;
            });
        };
		if (!$rootScope.stateItems.view) {
			$state.go('dashboard.analytics.cost');
		}
        $scope.getAllRegionsList();
        $scope.getProviders();
		$scope.fnProviderChange = function() {
            $scope.filter.regionId = '';
            $scope.filter.vpcId = '';
            $scope.regions = [];
            if ($scope.filter.providerId && $scope.filter.providerId !== '') {
                $scope.getProviderRegions();
            }
        };
	}]);
})(angular);