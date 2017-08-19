var __root = '../';
var __src = __root + '/src';
var __views = __src + '/views';
var config = __root + '/config/config.js';

var auth = require(__src + '/auth');
var express = require('express');
var passport = require('passport');
var router = express.Router();
var Account = require(__root + '/models/account')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/proposals/')
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res, next) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { title: "DecSys - Login", user : req.user });
});

router.post('/login', passport.authenticate('local') , function (req, res) {
  res.redirect('/proposals');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
