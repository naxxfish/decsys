var __root = '../';
var __src = __root + '/src';
var __views = __src + '/views';
var config = __root + '/config/config.js';

var Account = require(__root + '/models/account')
var Proposal = require(__root + '/models/proposal')

var express = require('express');
var passport = require('passport');

var router = express.Router();
// all pages require login
//router.use(require('connect-ensure-login').ensureLoggedIn())

router.get('/', function(req, res, next) {
  // proposal list
  Proposal.find({}, function (err, proposals) {
    res.render('proposal_list',{proposals: proposals, title: "DecSys Proposals"})
  });
});

router.get('/view/:id', function(req, res, next) {
  Proposal.findOne({'_id': req.params['id']}, function (err, myProposal){
    //console.log(Proposal.VersionedModel)
    if (err){
      res.sendStatus(500)
      return
    }
    Proposal.VersionedModel.findOne({refId: myProposal._id}, function (err, versions) {
      console.log(versions)
      res.render('proposal_show', {proposal: myProposal, versions: versions.versions});
    })
  });
});

router.get('/view/:id/:version', function(req, res, next) {
  Proposal.findOne({'_id': req.params['id']}, function (err, myProposal){
    //console.log(Proposal.VersionedModel)
    Proposal.VersionedModel.findOne({refId: myProposal._id, refVersion: req.params['version']}, function (err, version) {
      res.render('proposal_show', {proposal: version});
    })
  });
});

router.get('/create',  function(req, res, next) {
  // create proposal
  res.render('proposal_create');
});

router.post('/create', function (req, res, next) {
   console.log(req.body)
  var proposal = new Proposal({
    title: req.body.title,
    what: req.body.what,
    why: req.body.why,
    how: req.body.how,
    discourseUrl: req.body.disourceUrl,
    impact: req.body.impact
  });
  proposal.save(function (err) {
    res.redirect('/proposals/view/'+proposal._id)
  });
});

router.get('/edit/:id',  function(req, res, next) {
  Proposal.findOne({'_id': req.params['id']}, function (err, proposal){
    res.render('proposal_edit', {proposal: proposal});
  });
});

router.post('/edit', function (req, res, next) {
  Proposal.findOne({'_id': req.body._id}, function (err, proposal) {
    if (!err)
    {
      console.log(req.body)
      proposal.title = req.body.title
      proposal.what = req.body.what
      proposal.why = req.body.why
      proposal.how = req.body.how
      proposal.discourseUrl = req.body.discourseUrl,
      proposal.impact = req.body.impact
      proposal.save(function () {
        res.redirect('/proposals/view/' + proposal._id)
      })
    }
  })
});

module.exports = router;
