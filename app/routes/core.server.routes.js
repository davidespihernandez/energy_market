'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller'),
        analysis = require('../../app/controllers/analysis.server.controller');
    //home is the dashboard, user must be logged in
	app.route('/').get(core.index);
    app.route('/dashboard')
		.get(users.requiresLogin, analysis.dashboard);    
};