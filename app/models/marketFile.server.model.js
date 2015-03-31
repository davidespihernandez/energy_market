'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * MarketFile Schema
 */

var MarketFileSchema = mongoose.Schema({
    filePath: {type: String, index: true},
    fileName: {type: String},
    market: {type: String, index: true},
    marketType: {type: String},
    year: {type: Number},
    month: {type: Number},
    date: {type: Date, index: true},
    time: {type: String}
});

mongoose.model('MarketFile', MarketFileSchema);
