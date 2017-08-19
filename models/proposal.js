var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var version = require('mongoose-version');

var Account = require('./account');

var Proposal = new Schema({
    title: String,
    what: String,
    why: String,
    how: String,
    dates: {
      created: Date,
      expires: Date,
      closed: Date,
    },
    proposer: {
      type: 'ObjectId',
      ref: 'Account'
    },
    impact: Number,
    discourseUrl: String,
    archived: Boolean
});
Proposal.plugin(version, {collection: 'proposal_versions', suppressVersionIncrement: false, strategy: 'collection'});

module.exports = mongoose.model('Proposal', Proposal);
