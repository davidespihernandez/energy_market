'use strict';

// Configuring the Articles module
angular.module('filemanager').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'File Manager', 'filemanager', null, '/filemanager', true, null, 30, 'icon-cloud-download');
//        Menus.addMenuItem('sidebar', 'Dashboard', 'home', null, '/home', false, null, null, 'icon-speedometer');  //false -> non public
        console.log('Added menu item for filemanager');
	}
]);