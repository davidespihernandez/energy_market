'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('core').factory('Elastic', ['$resource',
	function($resource) {
		return $resource('/elastic', { });
	}
]);

angular.module('core').factory('KibanaDashboards', ['$resource',
	function($resource) {
		return $resource('/kibanadash', { });
	}
]);
