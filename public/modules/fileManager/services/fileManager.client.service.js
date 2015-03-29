'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('filemanager').factory('Files', ['$resource',
	function($resource) {
		return $resource('/filemanager/:dir', { dir: '@dir' });
	}
]);

angular.module('filemanager').factory('LoadedFiles', ['$resource',
	function($resource) {
		return $resource('/loadedfiles', {});
	}
]);

angular.module('filemanager').factory('AvailableFiles', ['$resource',
	function($resource) {
		return $resource('/availablefiles', {});
	}
]);
