'use strict';

// Setting up route
angular.module('analysis').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('app.analysis', {
			url: '/analysis/:market',
			templateUrl: 'modules/analysis/views/analysis.client.view.html'
		}).
        state('app.analysisERCOT', {
			url: '/analysisERCOT/:market',
			templateUrl: 'modules/analysis/views/analysisERCOT.client.view.html'
		});
	}
]);