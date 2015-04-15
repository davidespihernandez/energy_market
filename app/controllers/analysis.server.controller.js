'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	MarketFile = mongoose.model('MarketFile'),
    DayAheadData = mongoose.model('DayAheadData'),
    RealTimeData = mongoose.model('RealTimeData'),
    Dashboards = mongoose.model('Dashboards'),
	_ = require('lodash');

/**
 * List distinct locations
 */

function distinctLocations(market, done){
    var model = DayAheadData;
    if("RTBM"===market || "ERCOT_RTBM"===market){
        console.log('Querying locations for real time');
        model = RealTimeData;
    }
    model.distinct('Settlement_Location', {market: market}, function(err, locations){
        console.log("Retrieved locations: " + locations.length);
        var endLocations = [];
        locations.sort().forEach(function(location){
            endLocations.push({value: location, label: location});
        });
        done(endLocations);
    });        
}

/**
 * Get maximum date
 */

function maximumDate(market, done){
    MarketFile.aggregate()
      .match({market: market})
      .group({ _id: null, maxDate: { $max: '$date' } })
      .exec(function (err, dates) {
        if (err) return null;
        console.log('Returned max date');
        console.log(dates); // [ { maxDate: ... } ]
        var date;
        if(dates.length>0){
            date = dates[0].maxDate;
        }
        done(date);
    });    
}

/**
 * Search page params
 */
exports.searchparams = function (req, res){
    console.log('Search params for %j', req.query);
    var market = req.query.market;
    maximumDate(market, function(maxDate){
        distinctLocations(market, function(locations){
            console.log('returning search params');
            res.json({maxDate: maxDate, locations: locations});
        });
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
    if("RTBM"===market || "ERCOT_RTBM"===market){
        query = RealTimeData.find();
    }
    query = query.where('market').equals(market);
    if(parameters.dateFrom && parameters.dateFrom != "undefined" && parameters.dateFrom != "null"){
        console.log('Date from ' + parameters.dateFrom);
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined" && parameters.dateTo != "null"){
        console.log('Date to ' + parameters.dateTo);
        query = query.where('date').lte(parameters.dateTo);
    }
    if(parameters.locations && parameters.locations != "undefined" && parameters.locations != "null"){
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
        }
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
            files: 0,
            markets: 4,
            locations: 0,
            rows: 0
        };
    //TODO: change that using Q.all
    MarketFile.count({}, function(err, files){
        dashboardData.files = files;
        DayAheadData.count({}, function(err, dayAhead){
            RealTimeData.count({}, function(err, realTime){
                dashboardData.rows = dayAhead + realTime;
                //now count distinct locations
                var model = RealTimeData;
                if(dayAhead>0){
                    model = DayAheadData;
                }
                model.distinct('Settlement_Location').exec(function (err, locations) {
                    dashboardData.locations = locations.length;
                    res.json(dashboardData);
                });
            });
        });
    });
};

function dashboardsToArray(dashboards){
    var dashboardList = [];
    var dashTitle, dashURL;
    for(var i=1; i<=5; i++){
        dashTitle = dashboards['title' + i];
        dashURL =  dashboards['url' + i];
        if(dashTitle && dashTitle.trim() !== ""){
            dashboardList.push({ title: dashTitle, url: dashURL });
        }
    }
    return(dashboardList);
}

exports.getKibanaDashboards = function(req, res) {
    console.log('Retrieving dashboards for user %j', req.user);
    Dashboards.findOne(function(err, dashboards){
        if(dashboards){
                res.json({dashboardsList: dashboardsToArray(dashboards), dashboards: dashboards});
        } else{
            //insert the dashboards and return an empty array
            var dash = new Dashboards({ title1: '', url1: '', title2: '', url2: '', title3: '', url3: '', title4: '', url4: '', title5: '', url5: ''});
            dash.save(function (err) {
                // saved!
                res.json({dashboardsList: dashboardsToArray(dash), dashboards: dash});
            });
        }
    });
};

exports.setKibanaDashboards = function(req, res) {
    console.log('Saving dashboards');
    var dashTitle, dashURL;
    Dashboards.findOne(function(err, dashboards){
        if(dashboards){
            console.log('Updating');
            dashboards.title1 = req.body.title1;
            dashboards.title2 = req.body.title2;
            dashboards.title3 = req.body.title3;
            dashboards.title4 = req.body.title4;
            dashboards.title5 = req.body.title5;
            dashboards.url1 = req.body.url1;
            dashboards.url2 = req.body.url2;
            dashboards.url3 = req.body.url3;
            dashboards.url4 = req.body.url4;
            dashboards.url5 = req.body.url5;
            dashboards.save();
            res.json({dashboardsList: dashboardsToArray(dashboards), dashboards: dashboards});
        } else{
            dashboards = new Dashboards(req.body);
            console.log('Inserting');
            dashboards.save(function (err) {
                res.json({dashboardsList: dashboardsToArray(dashboards), dashboards: dashboards});
            });
        }
    });
};

