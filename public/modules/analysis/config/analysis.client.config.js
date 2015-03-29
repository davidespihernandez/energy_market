'use strict';

// Configuring the Articles module
angular.module('analysis').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'Data Analysis', null, 'dropdown', null, true, null, 40, 'icon-graph');
		Menus.addSubMenuItem('sidebar', null, 'Day Ahead', 'analysis/DA');
		Menus.addSubMenuItem('sidebar', null, 'Real Time', 'analysis/RTBM');
        console.log('Added menu item for analysis');
	}
]);