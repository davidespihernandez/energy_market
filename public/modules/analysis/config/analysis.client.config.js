'use strict';

// Configuring the Articles module
angular.module('analysis').run(['Menus',
	function(Menus) {
		// Set sidebar menu items
		Menus.addMenuItem('sidebar', 'Data Analysis', 'analysis/DA', 'dropdown', null, true, null, 40, 'icon-graph');
		Menus.addSubMenuItem('sidebar', 'analysis/DA', 'SPP Day Ahead', 'analysis/DA');
		Menus.addSubMenuItem('sidebar', 'analysis/DA', 'SPP Real Time', 'analysis/RTBM');
		Menus.addSubMenuItem('sidebar', 'analysis/DA', 'ERCOT Day Ahead', 'analysisERCOT/DA');
		Menus.addSubMenuItem('sidebar', 'analysis/DA', 'ERCOT Real Time', 'analysisERCOT/RTBM');
	}
]);