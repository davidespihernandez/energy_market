'use strict';

angular.module('core').controller('DashboardController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
        $scope.dashboardData = {
            files: 6,
            markets: 2,
            locations: 245,
            rows: 214325
        };
        
        $scope.initPage = function(){
           //TODO: query the dashboard data
            console.log('InitPage on DashboardController');
        };
        
	}
]);