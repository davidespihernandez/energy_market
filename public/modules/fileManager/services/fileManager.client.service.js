'use strict';

//service used for communicating with the files REST endpoints
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

