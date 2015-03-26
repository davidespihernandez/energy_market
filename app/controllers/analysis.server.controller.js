'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	MarketFile = mongoose.model('MarketFile'),
    DayAheadData = mongoose.model('DayAheadData'),
    RealTimeData = mongoose.model('RealTimeData'),
	_ = require('lodash');

/**
 * List distinct locations
 */

exports.distinctLocations = function (req, res){
    console.log('Distinct locations for ' + req.query.market);
    var market = req.query.market;
    var model = DayAheadData;
    if("RTBM"===market){
        model = RealTimeData;
    }
    model.distinct('Settlement_Location', function(err, locations){
        console.log("Retrieved locations: " + locations.length);
        res.json(locations);
    });        
};

/**
 * Search day ahead data
 */

exports.search = function(req, res) {
    var parameters = req.query;
    var market = req.query.market;
    console.log('Searching data for ' + req.query.market);
    var query = DayAheadData.find();
    if("RTBM"===market){
        query = RealTimeData.find();
    }
    if(parameters.dateFrom && parameters.dateFrom != "undefined" && parameters.dateFrom != "null"){
        console.log('Date from ' + parameters.dateFrom);
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined" && parameters.dateTo != "null"){
        console.log('Date to ' + parameters.dateTo);
        query = query.where('date').lte(parameters.dateTo);
    }
    if(parameters.location && parameters.location != "undefined" && parameters.location != "null"){
        console.log('Location ' + parameters.location);
        query = query.where('Settlement_Location').equals(parameters.location);
    }

    query.sort({ Interval: 'asc' }).exec(function (err, data) {
        if (err) return console.error(err);
        console.log("Return data -> " + data.length);
        res.json(data);
    });
};                                    

exports.dashboard = function(req, res) {
    console.log('Loading dashboard for user ' + req.user.toString());
};

