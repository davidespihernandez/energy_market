'use strict';

// Setting up route
angular.module('analysis').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('app.analysis', {
			url: '/analysis/:market',
			templateUrl: 'modules/filemanager/views/analysis.client.view.html'
		});
	}
]);