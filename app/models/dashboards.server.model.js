'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * MarketFile Schema
 */

var DashboardsSchema = mongoose.Schema({
    title1: {type: String},
    url1: {type: String},
    title2: {type: String},
    url2: {type: String},
    title3: {type: String},
    url3: {type: String},
    title4: {type: String},
    url4: {type: String},
    title5: {type: String},
    url5: {type: String}
});

mongoose.model('Dashboards', DashboardsSchema);
