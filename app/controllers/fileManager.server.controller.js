'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	MarketFile = mongoose.model('MarketFile'),
    DayAheadData = mongoose.model('DayAheadData'),
    RealTimeData = mongoose.model('RealTimeData'),
	_ = require('lodash'),
    Client = require('ftp');
var Q = require("q");
var pad = require('pad');

/**
 * List FTP files
 */

exports.listFTP = function(req, res){
    console.log('Listing files for ' + req.params.dir);
    
    var c = new Client();
    c.on('ready', function() {
        c.list(req.params.dir, function(err, list) {
            if (err) return console.error(err);
            c.end();
            res.json(list);
        });
      });    

    try{
        c.connect({host: 'pubftp.spp.org'});
    }
    catch(err){
        console.error('Error connecting to FTP');
        res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
    }
};

                                    
/**
 * Receives a full path file name and extracts the info into an object
 * for example: Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
 * or for RTBM Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503010005.csv
 * The last file for RTBM folder corresponds to the next day
 * Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503020000.csv
**/

function fileNameInfo (fullPath){
    var components = fullPath.split('/');
    var marketCode = components[1];
    var marketType = components[2];
    var year = components[3];
    var month = components[4];
    var name, date, dateDate, time;
    if("DA" === marketCode){
        name = components[5];
        date = name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(0,8);
        dateDate = Date.UTC(date.substring(0,4), date.substring(4,6)-1, date.substring(6,8));
        time = "";
    }
    else if("RTBM" === marketCode){
        name = components[6];
        var day = components[5];
        var dateTime= name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(0,8);
        //take the date from the file name, not the folder tree
        //dateDate = Date.UTC(year, month-1, day);
        dateDate = Date.UTC(dateTime.substring(0,4), dateTime.substring(4,6)-1, dateTime.substring(6,8));
        time = name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(8);
    }
    return {
        market: marketCode,
        marketType: marketType,
        year: year,
        month: month,
        date: dateDate,
        fileName: name,
        time: time
    };
}

/**
 * Returns or creates the market file for a specific path
**/
        
function getMarketFile(filePath, done){
    MarketFile.findOne({filePath: filePath}, function (err, marketFileDoc) {
        if (err) return console.error(err);
        if(marketFileDoc){
            //remove existing data, we are loading
            DayAheadData.remove({marketFile: marketFileDoc._id}, function(err){
                done(marketFileDoc);
            });
        } 
        else{
            var fileInfo = fileNameInfo(filePath);
            var mk = new MarketFile({    
                                        filePath : filePath,
                                        fileName: fileInfo.fileName,
                                        market: fileInfo.market,
                                        marketType: fileInfo.marketType,
                                        year: fileInfo.year,
                                        month: fileInfo.month,
                                        date: fileInfo.date,
                                        time: fileInfo.time
                                   });
            mk.save(function (err, mkt) {
                if (err) return console.error(err);
                done(mkt);
            });
        }
    });   
}

/**
 * Imports a file
**/
exports.importFile = function(req, res) {
    var filePath = req.params.dir;
    //connect to ftp server
    var c = new Client();
    //download a file
    var fileData = "";
    var mkt = null;
    c.on('ready', function() {
        //c.get('Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv', function(err, stream) {
        c.get(filePath, function(err, stream) {
            //ftp://pubftp.spp.org/Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
            if (err) return console.error(err);
            stream.once('close', function() { c.end(); });
            
            var fileContents = '';
            stream.on('data',function(buffer){
                fileContents += buffer;
//                console.log('on readable data ' + buffer);
            }); 
            
            stream.on('end',function(){
                var lines = fileContents.split("\n");
                getMarketFile(filePath, function(marketFileDoc){
                    //insert Measures
                    for (var i = 1, len = lines.length; i < len; i++) {
                        var fields = lines[i].split(',');
                        if(fields.length>1){
                            var dateFrom = fields[0].substring(6,10) + "-" + fields[0].substring(0,2) + "-" + fields[0].substring(3,5) + "T" + fields[0].substring(11) + "Z";
                            var dateTo = fields[1].substring(6,10) + "-" + fields[1].substring(0,2) + "-" + fields[1].substring(3,5) + "T" + fields[1].substring(11) + "Z";
                            var MeasureType = DayAheadData;
                            if("RTBM" === marketFileDoc.market){
                                MeasureType = RealTimeData;
                            }
                                
                            var measureDoc = new MeasureType({
                                market: marketFileDoc.market,
                                marketType: marketFileDoc.marketType,
                                date: marketFileDoc.date,
                                Interval: dateFrom,
                                GMTIntervalEnd: dateTo,
                                Settlement_Location: fields[2],
                                Pnode: fields[3],
                                LMP: fields[4],
                                MLC: fields[5],
                                MCC: fields[6],
                                MEC: fields[7]
                            });

                            measureDoc.save(function (err, mDoc) {
                              if (err) return console.error(err);
                            });
                            
                        }
                        
                    }
                    console.log('Inserted ' + lines.length);
                    res.json({ totalRows: lines.length });
                });
                
                
            });
            
        });
    });
    
    try{
        c.connect({host: 'pubftp.spp.org'});
    }
    catch(err){
        console.error('Error connecting to FTP');
        res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
    }
};

/**
 * Lists the loaded files
**/
                                    
exports.listLoadedFiles = function(req, res) {
    var parameters = req.query;
    console.log('Listing loaded files ');
    var query = MarketFile.find();
    if(parameters.dateFrom && parameters.dateFrom != "undefined" && parameters.dateFrom != "null"){
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined" && parameters.dateTo != "null"){
        query = query.where('date').lte(parameters.dateTo);
    }
    if(parameters.market && parameters.market != "undefined" && parameters.market != "null"){
        query = query.where('market').equals(parameters.market);
    }
    query.sort({ fileName: 'asc' }).exec(function (err, marketFiles) {
        if (err) return console.error(err);
        res.json(marketFiles);
    });
};

/**
 * Returns a list of dates between two dates.
 * Takes into account the market (days for DA, each five minutes for RTBM)
**/
                                    
function listPossibleDates(startDate, endDate, market){
    var dates = [];
    var tempDate = new Date(new Date(startDate).getTime());
    var increments = {};
    increments.DA = 24 * 60 * 60 * 1000;
    increments.RTBM = 5 * 60 * 1000;
    var endDateDate = new Date(endDate);
    while(tempDate.getTime()<=endDateDate.getTime()){
        dates.push(tempDate.getTime());
        tempDate = new Date(tempDate.getTime() + increments[market]);
    }
    return(dates);
}

/**
 * Returns a list of existing (loaded) dates between two dates, for a Market.
**/

function listExistingDates(startDate, endDate, market, done){
    var dates = [];
    var query = MarketFile.find();
    query = query.where('date').gte(startDate);
    query = query.where('date').lte(endDate);
    query = query.where('market').equals(market);
    query.sort({ date: 'asc' }).exec(function (err, marketFiles) {
        if (err) return console.error(err);
        marketFiles.forEach(function(marketFile){
            if("DA" === market){
                dates.push(marketFile.date.getTime());
            } else if("RTBM" === market){
                var newDate = Date.UTC(marketFile.date.getUTCFullYear(), marketFile.date.getUTCMonth(), marketFile.date.getUTCDate(),  marketFile.time.substring(0,2), marketFile.time.substring(2));
                dates.push(newDate);
            }
        });
        done(dates);
    });
    
}

/**
 * Returns the possible file info, for a date and a market
 * for DA 20150301 -> Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
 * or for RTBM 201503010005 -> Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503010005.csv
 * The last file for RTBM folder corresponds to the next day
 * Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503020000.csv
**/
function dateFileInfo(market, date){
    var fileInfo = {};
    fileInfo.date = date;
    fileInfo.market = market;
    var dateForPath = new Date(date.getTime());
    if('RTBM' === market && date.getUTCHours() === 0 && date.getUTCMinutes() === 0){
        //the date for path is the day before
        dateForPath = new Date(date.getTime() - (24 * 60 * 60 * 1000));
    }
    var pathBase = 'Markets/' + market + '/LMP_By_SETTLEMENT_LOC/' + dateForPath.getUTCFullYear() + '/' + pad(2, (dateForPath.getUTCMonth()+1).toString(),'0') + '/';
    var fullPath = pathBase;
    var fileName;
    if('DA' === market){
        fileName = 'DA-LMP-SL-' + date.getUTCFullYear() + pad(2, (date.getUTCMonth()+1).toString(),'0') + pad(2, date.getUTCDate().toString(),'0') + '0100.csv';
        fullPath += fileName;
    } else if('RTBM' === market){
        fileName = 'RTBM-LMP-SL-' + date.getUTCFullYear() + pad(2, (date.getUTCMonth()+1).toString(),'0') + pad(2, date.getUTCDate().toString(),'0') + 
            pad(2, date.getUTCHours().toString(),'0') + pad(2, date.getUTCMinutes().toString(),'0') + '.csv';
        fullPath += pad(2, dateForPath.getUTCDate().toString(),'0') + '/' + fileName;
    }
    fileInfo.fullPath = fullPath;
    fileInfo.fileName = fileName;
    fileInfo.year = dateForPath.getUTCFullYear();
    fileInfo.month = dateForPath.getUTCMonth()+1;
    return(fileInfo);
}

function difference(possibleDates, existingDates){
    var endDates = [];
    for (var i = 0; i < possibleDates.length; i++) { 
        var exists = false;
        for (var j = 0; j < existingDates.length && exists === false; j++) { 
            if(existingDates[j] === possibleDates[i]){
                exists = true;
            }
        }
        if(!exists){
            endDates.push(possibleDates[i]);
        }
    }
    return(endDates);
}

function getAvailableFiles(startDate, endDate, market, done){
    var possibleDates = listPossibleDates(startDate, endDate, market);
    var existingDates = listExistingDates(startDate, endDate, market, function(existingDates){
        var availableDates = difference(possibleDates, existingDates);
        var availableFiles = [];
        availableDates.forEach(function(date){
            var file = dateFileInfo(market, new Date(date));
            availableFiles.push(file);
        });
        done(availableFiles);
    });
}

/**
 * Lists all files that are available for loading
**/
exports.listAvailableFiles = function(req, res) {
    console.log('listAvailableFiles');
    getAvailableFiles(req.query.dateFrom, req.query.dateTo, req.query.market, function(availableFiles){
        res.json(availableFiles);
    });
};

/**
 * Imports a single, each of them an object containing 'fullPath' field at least
**/

function importSingleFile(c, index, filesArray, socketio) {
    var file = filesArray[index];
    var filePath = file.fullPath;
    //download a file
    var fileData = "";
    var mkt = null;
    try{
        c.get(filePath, function(err, stream) {
            //ftp://pubftp.spp.org/Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
            if (err) return console.error(err);

            socketio.sockets.emit('file.import.start', file);

            var fileContents = '';
            stream.on('data',function(buffer){
                fileContents += buffer;
    //                console.log('on readable data ' + buffer);
            }); 

            stream.on('end',function(){
                var lines = fileContents.split("\n");
                getMarketFile(filePath, function(marketFileDoc){
                    //insert Data
                    for (var i = 1, len = lines.length; i < len; i++) {
                        var fields = lines[i].split(',');
                        if(fields.length>1){
                            var dateFrom = fields[0].substring(6,10) + "-" + fields[0].substring(0,2) + "-" + fields[0].substring(3,5) + "T" + fields[0].substring(11) + "Z";
                            var dateTo = fields[1].substring(6,10) + "-" + fields[1].substring(0,2) + "-" + fields[1].substring(3,5) + "T" + fields[1].substring(11) + "Z";
                            var MeasureType = DayAheadData;
                            if("RTBM" === marketFileDoc.market){
                                MeasureType = RealTimeData;
                            }

                            var measureDoc = new MeasureType({
                                marketFile : marketFileDoc, 
                                market: marketFileDoc.market,
                                marketType: marketFileDoc.marketType,
                                date: marketFileDoc.date,
                                Interval: dateFrom,
                                GMTIntervalEnd: dateTo,
                                Settlement_Location: fields[2],
                                Pnode: fields[3],
                                LMP: fields[4],
                                MLC: fields[5],
                                MCC: fields[6],
                                MEC: fields[7]
                            });

                            measureDoc.save(function (err, mDoc) {
                              if (err) return console.error(err);
                            });

                        }

                    }
                    console.log('Inserted ' + lines.length + 'for  ' + filePath);
                    socketio.sockets.emit('file.import.end', file);
                    //launch the next file import
                    if(index+1<filesArray.length){
                        importSingleFile(c, index+1, filesArray, socketio);
                    }
                });
            });

        });        
    }
    catch(err){
        console.error('Error processing available files');
    }
}

//launches the import for the available files, for a market, start and end date
exports.importAvailableFiles = function(req, res) {
    console.log('importAvailableFiles');
    //connect to ftp server
    var c = new Client();
    c.on('ready', function() {
        try{
            var socketio = req.app.get('socketio');
            getAvailableFiles(req.body.dateFrom, req.body.dateTo, req.body.market, function(availableFiles){
                var arrayLength = availableFiles.length;
                if(availableFiles.length>0){
                    importSingleFile(c, 0, availableFiles, socketio);
                }
                console.log('Finished launching process');
//                c.end();
                res.json({totalFiles: arrayLength});
            });    
        }
        catch(err){
            console.error('Error processing available files');
            res.status(400).send({
                    message: errorHandler.getErrorMessage(err)});
        }
        
    });

    try{
        c.connect({host: 'pubftp.spp.org'});
    }
    catch(err){
        console.error('Error connecting to FTP');
        res.status(400).send({
				message: errorHandler.getErrorMessage(err)});
    }
};

