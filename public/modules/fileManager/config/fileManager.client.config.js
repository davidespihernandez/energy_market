'use strict';

// Configuring the Articles module
angular.module('marketFiles').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'Markets', 'fileManager', 'dropdown', null, false, 'fileManager, 30, 'icon-cloud-download');
	}
]);