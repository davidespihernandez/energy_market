'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('fileManager').factory('FileManager', ['$resource',
	function($resource) {
		return $resource('/fileManager/:dir', { dir: '@dir' });
	}
]);

angular.module('fileManager').factory('LoadedFiles', ['$resource',
	function($resource) {
		return $resource('/loadedFiles', {});
	}
]);
