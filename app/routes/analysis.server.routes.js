'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	analysis = require('../../app/controllers/analysis.server.controller');

module.exports = function(app) {
	// Analysis Routes

	app.route('/analysis')
		.get(users.requiresLogin, analysis.search);

	app.route('/analysis/searchparams')
		.get(users.requiresLogin, analysis.searchparams);
    
};