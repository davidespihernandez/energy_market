'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Day Ahead data Schema
 */

var DayAheadDataSchema = mongoose.Schema({
    filePath: {type: String, index: true},
    market: {type: String},
    marketType: {type: String},
    date: {type: Date, index: true},
    Interval: {type: Date},
    GMTIntervalEnd: {type: Date},
    Settlement_Location: {type: String, index: true},
    Pnode: {type: String},
    LMP: Number,
    MLC: Number,
    MCC: Number,
    MEC: Number
});

mongoose.model('DayAheadData', DayAheadDataSchema);

