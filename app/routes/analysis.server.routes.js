'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	analysis = require('../../app/controllers/analysis.server.controller');

module.exports = function(app) {
	// Analysis Routes

	app.route('/analysis/:market')
		.get(users.requiresLogin, analysis.search);

	app.route('/analysis/:market/locations')
		.get(users.requiresLogin, analysis.distinctLocations);
    
};