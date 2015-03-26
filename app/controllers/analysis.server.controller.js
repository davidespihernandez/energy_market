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
    console.log('Distinct locations for %j', req.query);
    var market = req.query.market;
    var model = DayAheadData;
    if("RTBM"===market){
        console.log('Querying locations for real time');
        model = RealTimeData;
    }
    model.distinct('Settlement_Location', function(err, locations){
        console.log("Retrieved locations: " + locations.length);
        var endLocations = [];
        locations.forEach(function(location){
            endLocations.push({value: location, label: location});
        });
        res.json(endLocations);
    });        
};

/**
 * Search day ahead data
 */

exports.search = function(req, res) {
    var parameters = req.query;
    var market = req.query.market;
    console.log('Searching data for %j', parameters);
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
    if(parameters.locations && parameters.locations != "undefined" && parameters.locations != "null"){
        console.log('Locations ');
        console.log(parameters.locations);
        var locationsArray = [];
        if(Array.isArray(parameters.locations)){
            parameters.locations.forEach(function(locationObj){
                var locationJSON = JSON.parse(locationObj);
                locationsArray.push(locationJSON.value);
            });
        }
        else{
            var locationJSON = JSON.parse(parameters.locations);
            locationsArray.push(locationJSON.value);
            console.log('Not array');
            console.log(locationJSON);
        }
        console.log(locationsArray);
        //query = query.where('Settlement_Location').equals(parameters.location);
        query = query.where('Settlement_Location').in(locationsArray);
    }

    query.sort({ Interval: 'asc' }).exec(function (err, data) {
        if (err) return console.error(err);
        console.log("Return data -> " + data.length);
        res.json(data);
    });
};                                    

exports.dashboard = function(req, res) {
    console.log('Loading dashboard for user %j', req.user);
    var dashboardData = {
            files: 6,
            markets: 2,
            locations: 245,
            rows: 214325
        };
    res.json(dashboardData);
};

