'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    DayAheadData = mongoose.model('DayAheadData'),
    RealTimeData = mongoose.model('RealTimeData');
var Q = require("q");

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'error'
    });

var INDEX_NAME = 'energy';
var DA_TYPE = 'dayahead';
var RTBM_TYPE = 'realtime';

function getMarketName(market){
    if('DA' === market || 'RTBM' === market){
        return('SPP');
    } else if('ERCOT_DA' === market || 'ERCOT_RTBM' === market){
        return('ERCOT');
    }
}

/**
 * Indexes a model, the full data
**/

function indexModel(modelType, socketio) {
    var DataModel = DayAheadData;
    var type = DA_TYPE;
    if('RTBM' === modelType){
        DataModel = RealTimeData;
        type = RTBM_TYPE;
    }
    var stream = DataModel.find().stream();
    var commands = [];
    var batchNumber = 0;
    var indexCommands = 0;
    var DOCS_PER_BATCH = 10000;
    var totalDocs = 0;
    stream.on('data', function (doc) {
      // do something with the mongoose document
        totalDocs++;
        commands.push({ "index" : { "_index" : INDEX_NAME, "_type" : type, "_id": doc._id} });
        commands.push({ 
                        Market: getMarketName(doc.market), 
                        Date: doc.date, 
                        Interval: doc.Interval, 
                        Location: doc.Settlement_Location,
                        LMP: doc.LMP,
                        MLC: doc.MLC,
                        MCC: doc.MCC,
                        MEC: doc.MEC
                    });
        indexCommands++;
        if(indexCommands >= DOCS_PER_BATCH){
            client.bulk({ body: commands}, function(err, response){
                batchNumber++;
                console.log('Executed batch ' + batchNumber);
                socketio.sockets.emit('elastic.index.progress.' + modelType, {processed: batchNumber * DOCS_PER_BATCH});
            });
            commands = [];
            indexCommands = 0;
        }
    }).on('error', function (err) {
      // handle the error
    }).on('close', function () {
        // the stream is closed, send event
        if(commands.length>0){
            client.bulk({ body: commands}, function(err, response){
                batchNumber++;
                console.log('Executed last batch ' + batchNumber);
                socketio.sockets.emit('elastic.index.progress.' + modelType, {processed: batchNumber * DOCS_PER_BATCH});
            });
            commands = [];
            indexCommands = 0;
        }
        socketio.sockets.emit('elastic.index.end.' + modelType, {processed: totalDocs});
    });
}

exports.indexAll = function(req, res) {
    var bodyDA = {
        dayahead:{
            properties:{
                Location  : {"type" : "string", "index" : "not_analyzed"},
                Market    : {"type" : "string", "index" : "not_analyzed"},
                Date      : {"type" : "date"},
                Interval  : {"type" : "date"},
                LMP       : {"type" : "float"},
                MLC       : {"type" : "float"},
                MCC       : {"type" : "float"},
                MEC       : {"type" : "float"}
            }
        }
    };
    var bodyRTBM = {
        realtime:{
            properties:{
                Location  : {"type" : "string", "index" : "not_analyzed"},
                Market    : {"type" : "string", "index" : "not_analyzed"},
                Date      : {"type" : "date"},
                Interval  : {"type" : "date"},
                LMP       : {"type" : "float"},
                MLC       : {"type" : "float"},
                MCC       : {"type" : "float"},
                MEC       : {"type" : "float"}
            }
        }
    };
    
    var socketio = req.app.get('socketio');
    client.deleteByQuery({
        index: INDEX_NAME,
        type: DA_TYPE,
        q: '*'
    }, function (error, response) {
        client.indices.putMapping({index:INDEX_NAME, type:DA_TYPE, body:bodyDA},
            function(err,resp,respcode){
                console.log('Response from putmapping');
                console.log(err);
                console.log(resp);
                indexModel('DA', socketio);
        });
    });
    client.deleteByQuery({
        index: INDEX_NAME,
        type: RTBM_TYPE,
        q: '*'
    }, function (error, response) {
        client.indices.putMapping({index:INDEX_NAME, type:RTBM_TYPE, body:bodyRTBM},
            function(err,resp,respcode){
                console.log('Response from putmapping');
                console.log(err);
                console.log(resp);
                indexModel('RTBM', socketio);
        });
    });
    
    res.json({result: 'Indexation launched'});
};


//checks if elastic server is running
exports.check = function(req, res) {
    console.log('Checking if elastic server is up');
    client.ping({
      // ping usually has a 3000ms timeout 
      requestTimeout: Infinity,

      // undocumented params are appended to the query string 
      hello: "elasticsearch!"
    }, function (error) {
      if (error) {
        console.log('elasticsearch cluster is down!');
          res.json({ready: false});
      } else {
          console.log('All is well');
          client.indices.create({index: INDEX_NAME});
          res.json({ready: true});
      }
    });    
};


