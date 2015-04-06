'use strict';

// Setting up route
angular.module('filemanager').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('app.filemanagerSPP', {
			url: '/filemanagerSPP',
			templateUrl: 'modules/filemanager/views/filemanager.client.view.html'
		}).
        state('app.filemanagerERCOT', {
			url: '/filemanagerERCOT',
			templateUrl: 'modules/filemanager/views/filemanagerERCOT.client.view.html'
		});
	}
]);