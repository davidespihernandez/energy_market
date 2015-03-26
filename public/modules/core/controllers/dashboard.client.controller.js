'use strict';

angular.module('core').controller('DashboardController', ['$scope', 'Authentication', 'Menus', 'Dashboards',
	function($scope, Authentication, Menus, Dashboards) {
		$scope.authentication = Authentication;
        $scope.dashboardData = {};
        
        $scope.initPage = function(){
           //TODO: query the dashboard data
            console.log('InitPage on DashboardController');
            $scope.dashboardData = Dashboards.get();
        };
        
	}
]);