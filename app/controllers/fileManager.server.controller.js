'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	MarketFile = mongoose.model('MarketFile'),
    DayAheadData = mongoose.model('DayAheadData'),
	_ = require('lodash'),
    Client = require('ftp');

/**
 * List FTP files
 */

exports.listFTP = function(req, res){
    console.log('Listing files for ' + req.dir);
    
    var c = new Client();
    c.on('ready', function() {
        c.list(currentDir, function(err, list) {
            if (err) throw err;
            console.log('File list ' + list);
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
				message: errorHandler.getErrorMessage(err)})
    }
};

                                    
/**
 * Receives a full path file name and extracts the info into an object
 * for example: Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
**/

function fileNameInfo (fileName){
    var components = fileName.split('/');
    var marketCode = components[1];
    var marketType = components[2];
    var year = components[3];
    var month = components[4];
    var name = components[5];
    var date = name.substring(name.lastIndexOf('-')+1, name.lastIndexOf('.')).substring(0,8)
    var dateDate = Date.parse(date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8))
    return {
        market: marketCode,
        marketType: marketType,
        year: year,
        month: month,
        date: dateDate
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
                                        market: fileInfo.market,
                                        marketType: fileInfo.marketType,
                                        year: fileInfo.year,
                                        month: fileInfo.month,
                                        date: fileInfo.date
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
    var filePath = req.params.path
    //connect to ftp server
    var c = new Client();
    //download a file
    var fileData = "";
    var mkt = null;
    c.on('ready', function() {
        //c.get('Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv', function(err, stream) {
        c.get(filePath, function(err, stream) {
            //ftp://pubftp.spp.org/Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03/DA-LMP-SL-201503010100.csv
            if (err) throw err;
            stream.once('close', function() { c.end(); });
            
            var fileContents = ''
            stream.on('data',function(buffer){
                fileContents += buffer;
//                console.log('on readable data ' + buffer);
            }); 
            
            stream.on('end',function(){
                var lines = fileContents.split("\n")
                getMarketFile(filePath, function(marketFileDoc){
                    //insert Measures
                    for (var i = 1, len = lines.length; i < len; i++) {
                        var fields = lines[i].split(',')
                        if(fields.length>1){
                            var dateFrom = fields[0].substring(6,10) + "-" + fields[0].substring(0,2) + "-" + fields[0].substring(3,5) + "T" + fields[0].substring(11)
                            var dateTo = fields[1].substring(6,10) + "-" + fields[1].substring(0,2) + "-" + fields[1].substring(3,5) + "T" + fields[1].substring(11)
                            //TODO: add hour
                            var measureDoc = new DayAheadData({
                                marketFile : marketFileDoc, 
                                market: marketFileDoc.market,
                                marketType: marketFileDoc.marketType,
                                year: marketFileDoc.year,
                                month: marketFileDoc.month,
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
				message: errorHandler.getErrorMessage(err)})
    }
};

/**
 * Lists the loaded files
**/
                                    
exports.listLoadedFiles = function(req, res) {
    var parameters = req.body
    console.log('Listing loaded files ' + req.body.toString());
    var query = MarketFile.find();
    if(parameters.dateFrom && parameters.dateFrom != "undefined" && parameters.dateFrom != "null"){
        console.log('Date from ' + parameters.dateFrom);
        query = query.where('date').gte(parameters.dateFrom);
    }
    if(parameters.dateTo && parameters.dateTo != "undefined" && parameters.dateTo != "null"){
        console.log('Date to ' + parameters.dateTo);
        query = query.where('date').lte(parameters.dateTo);
    }
    console.log('performing query');
    query.sort({ date: 'asc' }).exec(function (err, marketFiles) {
        if (err) return console.error(err);
        console.log("Returning marketfiles");
        res.json(marketFiles);
    });
};
                                    
                                    
