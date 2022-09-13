const express = require('express');

const authConroller = require('../controllers/auth');

const router = express.Router();

router.get('/login', authConroller.getLogin);

router.get('/signup', authConroller.getSignup);

router.post('/login', authConroller.postLoin);

router.post('/signup', authConroller.postSignup);

router.post('/logout', authConroller.postLogout);

module.exports = router;
