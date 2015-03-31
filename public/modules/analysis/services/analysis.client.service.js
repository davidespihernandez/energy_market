'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('analysis').factory('AnalysisData', ['$resource',
	function($resource) {
		return $resource('/analysis', { });
	}
]);

angular.module('analysis').factory('SearchParams', ['$resource',
	function($resource) {
		return $resource('/analysis/searchparams', { });
	}
]);
