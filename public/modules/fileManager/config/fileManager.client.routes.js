'use strict';

// Setting up route
angular.module('filemanager').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('app.filemanager', {
			url: '/filemanager',
			templateUrl: 'modules/filemanager/views/filemanager.client.view.html'
		});
	}
]);