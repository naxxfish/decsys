var __root = '../';
var __src = __root + '/src';
var __views = __src + '/views';
var config = __root + '/config/config.js';

var Account = require(__root + '/models/account')

var express = require('express');
var passport = require('passport');

var router = express.Router();


router.get('/', require('connect-ensure-login').ensureLoggedIn() , function(req, res, next) {
  Account.find({}).exec(function (err,accounts) {
     if (!err)
     {
        res.render('userlist',{title: "Accounts",users: accounts});
        next();
     } else {
        res.status(500).render('error', {message: err, error: { status: 500}})
     }
 })
});

module.exports = router;
