'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller'),
        users = require('../../app/controllers/users.server.controller'),
        elastic = require('../../app/controllers/elastic.server.controller'),
        analysis = require('../../app/controllers/analysis.server.controller');
    
	app.route('/').get(core.index);
    
    //for the dashboard, user must be logged in
    app.route('/dashboard')
		.get(users.requiresLogin, analysis.dashboard);
    
    app.route('/elastic')
		.get(users.requiresLogin, elastic.check)
        .post(users.requiresLogin, elastic.indexAll);    
};