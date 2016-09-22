(function (angular) {
	"use strict";
	angular.module('dashboard.analytics', ['apis.analytics','nvd3'])
		.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'modulePermissionProvider', function($stateProvider, $urlRouterProvider, $httpProvider, modulePermissionProvider) {
			var modulePerms = modulePermissionProvider.$get();
			$stateProvider.state('dashboard.analytics.cost', {
				url: "cost/",
				templateUrl: "src/partials/sections/dashboard/analytics/view/cost.html",
				controller: "costCtrl as cost",
				params:{filterView:'cost'},
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
				params:{filterView:'capacity'},
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
				params:{filterView:'usage'},
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
		analytic.tabShowChat=true;
		analytic.tabShowReport=false;
		$scope.showTree = true;
		$rootScope.isOpenSidebar = false;
		$rootScope.dashboardChild = 'analytics';
		$rootScope.stateParams = $state.params;
		var treeNames = ['Analytics'];
		//$rootScope.$emit('treeNameUpdate', treeNames);
		$rootScope.$emit('HEADER_NAV_CHANGE', 'ANALYTICS');
		// // get organigetion
		genericServices.getTreeNew().then(function (orgs) {
			$rootScope.organObject = orgs;
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
		analytic.applyFilter = function(){
			$rootScope.organNewEnt.org = '0';
			$rootScope.organNewEnt.buss='0';
			$rootScope.organNewEnt.proj='0';
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