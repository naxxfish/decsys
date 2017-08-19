var __root = '../';
var __src = __root + '/src';
var __views = __src + '/views';
var config = require( __root + 'config/config.json');

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
  Position.find({owner: req.user._id}).populate('proposal').exec(function(err, positions) {
    console.log(positions)
    res.render('position_list', {positions: positions, user: req.user._id});
  });
});

module.exports = router
