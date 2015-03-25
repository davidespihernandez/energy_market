'use strict';

// Configuring the Articles module
angular.module('analysis').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'Data Analysis', 'analysis', null, '/analysis/DA', true, null, 40, 'icon-graph');
		Menus.addSubMenuItem('sidebar', 'analysis', 'Day Ahead', '/analysis/DA');
		Menus.addSubMenuItem('sidebar', 'analysis', 'Real Time', '/analysis/RTBM');
        console.log('Added menu item for analysis');
	}
]);