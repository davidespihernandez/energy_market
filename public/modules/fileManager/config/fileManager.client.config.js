'use strict';

// Configuring the Articles module
angular.module('fileManager').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'File Manager', 'fileManager', null, null, false, 'fileManager', 30, 'icon-cloud-download');
	}
]);