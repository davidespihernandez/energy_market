'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Day Ahead data Schema
 */

var RealTimeDataSchema = mongoose.Schema({
    marketFile: {type: mongoose.Schema.Types.ObjectId, ref: 'MarketFile'},
    market: {type: String, index: true},
    marketType: {type: String},
    year: {type: Number},
    month: {type: Number},
    date: {type: Date, index: true},
    Interval: {type: Date, index: true},
    GMTIntervalEnd: {type: Date},
    Settlement_Location: {type: String, index: true},
    Pnode: {type: String},
    LMP: Number,
    MLC: Number,
    MCC: Number,
    MEC: Number
});

mongoose.model('RealTimeData', RealTimeDataSchema);

