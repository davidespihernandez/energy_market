'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	fileManager = require('../../app/controllers/fileManager.server.controller');

module.exports = function(app) {
	// FileManager Routes

	app.route('/fileManager/:dir')
		.get(users.requiresLogin, fileManager.listFTP)
		.post(users.requiresLogin, fileManager.importFile);

	app.route('/loadedFiles')
		.get(users.requiresLogin, fileManager.listLoadedFiles);
    
};