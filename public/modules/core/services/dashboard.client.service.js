'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('core').factory('Dashboards', ['$resource',
	function($resource) {
		return $resource('/dashboard', { });
	}
]);

