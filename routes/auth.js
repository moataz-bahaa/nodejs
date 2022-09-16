const express = require('express');
const { signupValidator } = require('../validations/validator');

const authConroller = require('../controllers/auth');

const router = express.Router();

router.get('/login', authConroller.getLogin);

router.get('/signup', authConroller.getSignup);

router.post('/login', authConroller.postLoin);

router.post('/signup', signupValidator, authConroller.postSignup);

router.post('/logout', authConroller.postLogout);

router.get('/reset', authConroller.getReset);

router.post('/reset', authConroller.postReset);

router.get('/reset/:token', authConroller.getNewPassword);

router.post('/new-password', authConroller.postNewPassword);

module.exports = router;
