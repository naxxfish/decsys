var __root = '../';
var __src = __root + '/src';
var __views = __src + '/views';
var config = __root + '/config/config.js';

var Account = require(__root + '/models/account');
var Proposal = require(__root + '/models/proposal');
var Position = require(__root + '/models/position');

var express = require('express');
var passport = require('passport');

var router = express.Router();
// all pages require login
router.use(require('connect-ensure-login').ensureLoggedIn())

router.get('/', function(req, res, next) {
  // proposal list
  Proposal.find({archived: false}, function(err, proposals) {
    res.render('proposal_list', {
      proposals: proposals,
      title: "DecSys Proposals"
    })
  });
});

router.get('/results/:id', function(req, res, next) {
  Proposal.findOne({
    '_id': req.params['id']
  }, function(err, proposal) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    Position.mapReduce({
      map: function() {
        emit(this.position, 1);
      },
      reduce: function(key, values) {
        return values.length;
      },
      query: {
        "proposal": proposal._id
      }
    }, function(err, result) {
      if (err) {
        console.log("aggregation gone wrong " + err);
        res.sendStatus(500);
        return
      }
      var outcome = "PASSED"
      // lets do some analysis
      var tallies = {}
      result.forEach(function(line) {
        tallies[line._id] = line.value
      })
      if (tallies.block > 0)
      {
        outcome = "BLOCKED"
      } else {
        if (tallies.partiallySupport > 0)
        {
          outcome = "NEEDS_REVISION"
        }
      }
      if (outcome != "PASSED")
      {
        Position.find(
          {
            'proposal': proposal._id,
            $or : [
              {
                "agreements.what": false
              },
              {
                "agreements.why": false
              },
              {
                "agreements.how": false
              },
              {
                "blocking": true
              }
            ]
          }).populate('owner').exec(function (err, objectionRecords)
        {
          var objections = {
            why: [],
            what: [],
            how: [],
            blocking: []
          }
          objectionRecords.forEach(function (objectionRecord) {
            console.log(objectionRecord)
            if (!objectionRecord.agreements.why && objectionRecord.reasons.why != "")
            {
              if (!objectionRecord.anonymous)
                objections.why.push({'msg':objectionRecord.reasons.why,'person':objectionRecord.owner.username})
              else
                objections.why.push({'msg':objectionRecord.reasons.why,'person': 'Anonymous'})
            }
            if (!objectionRecord.agreements.what && objectionRecord.reasons.what != "")
            {
              if (!objectionRecord.anonymous)
                objections.what.push({'msg':objectionRecord.reasons.what,'person': objectionRecord.owner.username})
              else
                objections.what.push({'msg':objectionRecord.reasons.what,'person': 'Anonymous'})
            }
            if (!objectionRecord.agreements.how && objectionRecord.reasons.how != "")
            {
              if (!objectionRecord.anonymous)
                objections.how.push({'msg':objectionRecord.reasons.how,'person': objectionRecord.owner.username})
              else
                objections.how.push({'msg':objectionRecord.reasons.how,'person': 'Anonymous'})
            }
            if (objectionRecord.blocking)
            {
              if (!objectionRecord.anonymous)
                objections.blocking.push({'msg':objectionRecord.reasons.block,'person': objectionRecord.owner.username})
               else
                objections.blocking.push({'msg':objectionRecord.reasons.block,'person': 'Anonymous'})
            }
          })
          console.log(objections)
          console.log(tallies, outcome)
          res.render('proposal_result', {
            proposal: proposal,
            results: tallies,
            outcome: outcome,
            objections: objections
          })
        })
      } else {
        console.log(tallies, outcome)
        res.render('proposal_result', {
          proposal: proposal,
          results: tallies,
          outcome: outcome
        })
      }
    })
  });
});

router.get('/view/:id', function(req, res, next) {
  Proposal.findOne({
    '_id': req.params['id']
  }, function(err, proposal) {
    //console.log(Proposal.VersionedModel)
    if (err) {
      res.sendStatus(500);
      return;
    }
    Position.findOne({
      'proposal': proposal._id,
      'owner': req.user._id
    }, function(posErr, position) {
      if (posErr) {
        res.sendStatus(500)
        return;
      }
      if (!position) {
        position = {
          'position': 'dontCare',
          'agreements': {},
          'reasons': {}
        }
      }
      Proposal.VersionedModel.findOne({
        refId: proposal._id
      }, function(err, versions) {
        res.render('proposal_show', {
          proposal: proposal,
          versions: versions,
          position: position
        });
      });
    });
  });
});

router.get('/view/:id/:version', function(req, res, next) {
  Proposal.findOne({
    '_id': req.params['id']
  }, function(err, myProposal) {
    //console.log(Proposal.VersionedModel)
    Proposal.VersionedModel.findOne({
      refId: myProposal._id,
      refVersion: req.params['version']
    }, function(err, version) {
      res.render('proposal_show', {
        proposal: version
      });
    });
  });
});

router.get('/create', function(req, res, next) {
  // create proposal
  res.render('proposal_create');
});

router.get('/revise/:precursor', function (req, res, next) {
  Proposal.findOne({'_id':req.params['precursor']}, function (err, proposal) {
   res.render('proposal_revise',{precursor: req.params['precursor'],proposal:proposal})
 });
});

router.post('/create', function(req, res, next) {
  console.log(req.body)
  var proposal = new Proposal({
    title: req.body.title,
    what: req.body.what,
    why: req.body.why,
    how: req.body.how,
    discourseUrl: req.body.disourceUrl,
    impact: req.body.impact,
    precursor: req.body.precursor
  });
  proposal.save(function(err) {
    res.redirect('/proposals/view/' + proposal._id)
  });
});

router.get('/edit/:id', function(req, res, next) {
  Proposal.findOne({
    '_id': req.params['id']
  }, function(err, proposal) {
    res.render('proposal_edit', {
      proposal: proposal
    });
  });
});

router.post('/edit', function(req, res, next) {
  Proposal.findOne({
    '_id': req.body._id
  }, function(err, proposal) {
    if (!err) {
      proposal.title = req.body.title
      proposal.what = req.body.what
      proposal.why = req.body.why
      proposal.how = req.body.how
      proposal.discourseUrl = req.body.discourseUrl,
        proposal.impact = req.body.impact
      proposal.save(function() {
        res.redirect('/proposals/view/' + proposal._id)
      });
    }
  });
});

router.post('/position/:id', function(req, res, next) {

  Position.findOne({
    'owner': req.user._id,
    'proposal': req.body._id
  }, function(err, existingPosition) {
    if (err) {
      res.sendStatus(500);
      return
    }
    var myPosition
    console.log(existingPosition)
    if (!existingPosition) {
      myPosition = new Position({
        agreements: {
          what: true,
          why: true,
          how: true
        },
        blocking: false,
        reasons: {},
        proposal: req.body._id,
        owner: req.user._id,
        position: req.body.position,
        anonymous: (req.body.anonymous == 'on') ? true : false
      });
    } else {
      myPosition = existingPosition;
      myPosition.anonymous = (req.body.anonymous == 'on') ? true : false;
    }
    myPosition.position = req.body.position;
    switch (req.body.position) {
      case 'dontCare':
        myPosition.agreements = {};
        myPosition.dontCare = true;
        myPosition.reasons.block = undefined;
        myPosition.blocking = false;
        break;
      case 'block':
        myPosition.blocking = true;
        myPosition.agreements = {
          what: false,
          why: false,
          how: false
        };
        myPosition.reasons = {};
        myPosition.reasons.block = req.body.blockReason;
        myPosition.agreements = {};

        break;
      case 'partiallySupport':
        myPosition.reasons.block = undefined;
        myPosition.blocking = false;
        if (req.body.disagreeWhat) {
          myPosition.agreements.what = false;
          myPosition.reasons.what = req.body.disagreeWhatReason;
        }
        if (req.body.disagreeWhy) {
          myPosition.agreements.why = false;
          myPosition.reasons.why = req.body.disagreeWhyReason;
        }
        if (req.body.disagreeHow) {
          myPosition.agreements.how = false;
          myPosition.reasons.how = req.body.disagreeHowReason;
        }
      case 'fullySupport':
        // this is the default, do nothing
        myPosition.reasons.block = undefined;
        myPosition.blocking = false;
        break;
    }
    console.log(myPosition)
    myPosition.save();
  });
  res.redirect('/proposals/view/' + req.params['id'])
});

module.exports = router;
