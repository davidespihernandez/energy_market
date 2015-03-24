'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	MarketFile = mongoose.model('MarketFile'),
    DayAheadData = mongoose.model('DayAheadData'),
	_ = require('lodash');

/**
 * List distinct locations
 */

exports.distinctLocations = function (req, res){
    console.log('Distinct locations');
    DayAheadData.distinct('Settlement_Location', function(err, locations){
        res.json(locations);
    });        
};

/**
 * Search day ahead data
 */

exports.search = function(req, res) {
    var parameters = req.body;
    console.log('Searching data ' + parameters.toString());
    var query = DayAheadData.find();
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

    query.sort({ Interval: 'asc' }).exec(function (err, measures) {
        if (err) return console.error(err);
        //console.log("Return data -> " + measures.toString());
        res.json(measures);
    });
};                                    
