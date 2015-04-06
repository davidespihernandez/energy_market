'use strict';

// Configuring the Articles module
angular.module('filemanager').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'File Manager', 'filemanagerSPP', 'dropdown', null, true, null, 30, 'icon-cloud-download');
		Menus.addSubMenuItem('sidebar', 'filemanagerSPP', 'SPP', 'filemanagerSPP');
		Menus.addSubMenuItem('sidebar', 'filemanagerSPP', 'ERCOT', 'filemanagerERCOT');

    }
]);