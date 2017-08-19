var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var version = require('mongoose-version');

var Account = require('./account');
var Proposal = require('./proposal')

var Position = new Schema({
    position: String,
    agreements: {
      what: Boolean,
      why: Boolean,
      how: Boolean
    },
    blocking: Boolean,
    dontCare: Boolean,
    reasons: {
      what: String,
      why: String,
      how: String,
      block: String
    },
    owner: {
      type: 'ObjectId',
      ref: 'Account'
    },
    proposal: {
      type: 'ObjectId',
      ref: 'Proposal',
    }
});

Position.plugin(version, {collection: 'position_versions', suppressVersionIncrement: false});

module.exports = mongoose.model('Position', Position);
