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
    market: {type: String, index: true},
    marketType: {type: String, index: true},
    year: {type: Number, index: true},
    month: {type: Number, index: true},
    date: {type: Date, index: true}
});

mongoose.model('MarketFile', marketFileSchema);
