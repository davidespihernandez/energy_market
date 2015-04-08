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
 * Receives a full path file name and extracts the info into an object
 * for example: Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
 * or for RTBM Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503010005.csv
 * The last file for RTBM folder corresponds to the next day
 * Markets/RTBM/LMP_By_SETTLEMENT_LOC/2015/03/01/RTBM-LMP-SL-201503020000.csv
**/

function fileNameInfo (market, fullPath){
    var components, marketCode, marketType, year, month, name, date, dateDate, time, day, dateTime;
    if('DA' === market || 'RTBM' === market){ //SPP
        components = fullPath.split('/');
        marketCode = components[1];
        marketType = components[2];
        year = components[3];
        month = components[4];
        if("DA" === market){
            name = components[5];
            date = name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(0,8);
            dateDate = Date.UTC(date.substring(0,4), date.substring(4,6)-1, date.substring(6,8));
            time = "";
        }
        else if("RTBM" === market){
            name = components[6];
            day = components[5];
            dateTime= name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(0,8);
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
    } else if('ERCOT_DA' === market || 'ERCOT_RTBM' === market){ //ERCOT
        components = fullPath.split('.');
        marketCode = market;
        marketType = 'LMP';
        if("ERCOT_DA" === market){
            name = fullPath;
            date = components[3];
            year = date.substring(0,4);
            month = date.substring(4,6);
            dateDate = Date.UTC(date.substring(0,4), date.substring(4,6)-1, date.substring(6,8));
            time = "";
        }
        else if("ERCOT_RTBM" === market){
            name = fullPath;
            date = components[3];
            year = date.substring(0,4);
            month = date.substring(4,6);
            dateDate = Date.UTC(date.substring(0,4), date.substring(4,6)-1, date.substring(6,8));
            time = components[4];
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
}

/**
 * Returns or creates the market file for a specific path
**/
        
function getMarketFile(market, filePath, done){
    MarketFile.findOne({ $and: [{filePath: filePath}, {market: market}]}, function (err, marketFileDoc) {
        if (err) return console.error(err);
        if(marketFileDoc){
            //remove existing data, we are loading
            var EndModel = DayAheadData;
            if('RTBM' === market || 'ERCOT_RTBM' === market){
                EndModel = RealTimeData;
            }
            EndModel.remove({ $and: [{filePath: filePath}, {market: market}]}, function(err){
                done(marketFileDoc);
            });
        } 
        else{
            var fileInfo = fileNameInfo(market, filePath);
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

function getSPPAvailableFiles(startDate, endDate, market, done){
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
    var market = req.query.market;
    if('DA' === market || 'RTBM' === market){
        getSPPAvailableFiles(req.query.dateFrom, req.query.dateTo, req.query.market, function(availableFiles){
            res.json(availableFiles);
        });
    } 
    
};

/**
 * Imports a single, each of them an object containing 'fullPath' field at least
**/

function importSingleFile(c, index, filesArray, socketio, market) {
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
                getMarketFile(market, filePath, function(marketFileDoc){
                    var MeasureType = DayAheadData;
                    if("RTBM" === marketFileDoc.market){
                        MeasureType = RealTimeData;
                    }
                    var documents = [];
                    var batchExecuted = 0;
                    //insert Data
                    for (var i = 1, len = lines.length; i < len; i++) {
                        var fields = lines[i].split(',');
                        if(fields.length>1){
                            var dateFrom = fields[0].substring(6,10) + "-" + fields[0].substring(0,2) + "-" + fields[0].substring(3,5) + "T" + fields[0].substring(11) + "Z";
                            var dateTo = fields[1].substring(6,10) + "-" + fields[1].substring(0,2) + "-" + fields[1].substring(3,5) + "T" + fields[1].substring(11) + "Z";

                            var doc = {
                                filePath : marketFileDoc.filePath, 
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
                            };

                            documents.push(doc);
                            if(documents.length>=5000){
                                MeasureType.collection.insert(documents, function(err, docs){
                                    batchExecuted++;
                                });
                                documents = [];
                            }
                            
                        }

                    }
                    if(documents.length>0){
                        MeasureType.collection.insert(documents, function(err, docs){
                            batchExecuted++;
                        });
                        documents = [];
                    }
                    
                    console.log('Inserted ' + lines.length + 'for  ' + filePath);
                    socketio.sockets.emit('file.import.end', file);
                    //launch the next file import
                    if(index+1<filesArray.length){
                        importSingleFile(c, index+1, filesArray, socketio, market);
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
    var market = req.body.market;
    
    if('DA' === market || 'RTBM' === market){
        //SPP
        //connect to ftp server
        var c = new Client();
        c.on('ready', function() {
            try{
                var socketio = req.app.get('socketio');
                getSPPAvailableFiles(req.body.dateFrom, req.body.dateTo, req.body.market, function(availableFiles){
                    var arrayLength = availableFiles.length;
                    if(availableFiles.length>0){
                        importSingleFile(c, 0, availableFiles, socketio, market);
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
    } else if('ERCOT_DA' === market || 'ERCOT_RTBM' === market){
        //TODO: import available files from ERCOT
        console.log('importing ERCOT files');
    }
    
};


/**
 * Upload ERCOT files
**/
                                    
exports.uploadERCOT = function(req, res) {
    console.log('Upload ERCOT ');
    var lines = req.files.file.buffer.toString('ascii').split("\n");
    console.log(req.files);
    var filePath = req.files.file.originalname;
    var fileNameComponents = filePath.split('.');
    var MeasureType = DayAheadData;
    var market = 'ERCOT_DA';
    if("00012300" === fileNameComponents[1]){
        market = 'ERCOT_RTBM';
        MeasureType = RealTimeData;
    } else if("00012328" === fileNameComponents[1]){
        market = 'ERCOT_DA';
        MeasureType = DayAheadData;
    }
    var dayMilliseconds = 24 * 60 * 60 * 1000;
    var socketio = req.app.get('socketio');
    
    getMarketFile(market, filePath, function(marketFileDoc){
        //insert Data
        socketio.sockets.emit('file.importERCOT.progress', {filePath: filePath, percent: 0});
        var documents = [];
        var batchExecuted = 0;
        var totalBatches = Math.ceil(lines.length/10000);
        for (var i = 1, len = lines.length; i < len; i++) {
            var fields = lines[i].split(',');
            if(fields.length>1){
                var interval, intervalEnd, location, LMP, dateComponents, year, month, day, hour, hourComponents, minutes, dateAndTime;
                if("ERCOT_DA" === market){
                    dateComponents = fields[0].split('/');
                    year = dateComponents[2];
                    month = dateComponents[0];
                    day = dateComponents[1];
                    hourComponents = fields[1].split(":");
                    hour = hourComponents[0];
                    minutes = hourComponents[1];
                    intervalEnd = new Date(Date.UTC(year, month-1, day, hour, minutes));
                    interval = new Date(intervalEnd - dayMilliseconds);
                    location = fields[2];
                    LMP = fields[3];
                } else if("ERCOT_RTBM" === market){
                    dateAndTime = fields[0].split(' ');
                    dateComponents = dateAndTime[0].split('/');
                    year = dateComponents[2];
                    month = dateComponents[0];
                    day = dateComponents[1];
                    hourComponents = dateAndTime[1].split(":");
                    hour = hourComponents[0];
                    minutes = hourComponents[1];
                    intervalEnd = new Date(Date.UTC(year, month-1, day, hour, minutes));
                    interval = new Date(intervalEnd - dayMilliseconds);
                    location = fields[2];
                    LMP = fields[3].trim();
                }
                
                var doc = {
                    filePath : marketFileDoc.filePath, 
                    market: marketFileDoc.market,
                    marketType: marketFileDoc.marketType,
                    date: marketFileDoc.date,
                    Interval: interval,
                    GMTIntervalEnd: intervalEnd,
                    Settlement_Location: location,
                    Pnode: "",
                    LMP: LMP
                };
                documents.push(doc);
                if(documents.length>=10000){
                    MeasureType.collection.insert(documents, function(err, docs){
                        batchExecuted++;
                        socketio.sockets.emit('file.importERCOT.progress', {filePath: filePath, percent: batchExecuted/totalBatches*100});
                    });
                    documents = [];
                }
            }

        }
        if(documents.length>0){
            MeasureType.collection.insert(documents, function(err, docs){
                batchExecuted++;
                socketio.sockets.emit('file.importERCOT.progress', {filePath: filePath, percent: batchExecuted/totalBatches*100});
            });
            documents = [];
        }
    });
    console.log('file ' + filePath + ' is importing');
    res.json({launched: true});
};

