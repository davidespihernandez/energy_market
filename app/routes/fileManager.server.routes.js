'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	fileManager = require('../../app/controllers/filemanager.server.controller');

module.exports = function(app) {
	// Filemanager Routes

	app.route('/loadedfiles')
		.get(users.requiresLogin, fileManager.listLoadedFiles);
    
	app.route('/availablefiles')
		.get(users.requiresLogin, fileManager.listAvailableFiles)
		.post(users.requiresLogin, fileManager.importAvailableFiles);
    
	app.route('/uploadERCOT')
		.post(users.requiresLogin, fileManager.uploadERCOT);
    
};