'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('analysis').factory('AnalysisData', ['$resource',
	function($resource) {
		return $resource('/analysis/:market', { market: '@market' });
	}
]);

angular.module('analysis').factory('Locations', ['$resource',
	function($resource) {
		return $resource('/analysis/:market/locations', { market: '@market' });
	}
]);
