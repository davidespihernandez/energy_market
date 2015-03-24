'use strict';

// Setting up route
angular.module('fileManager').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('app.fileManager', {
			url: '/fileManager',
			templateUrl: 'modules/fileManager/views/fileManager.client.view.html'
		});
	}
]);