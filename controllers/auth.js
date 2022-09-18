const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  const flash = req.flash('error');
  let validationErrors = [],
    oldInput = { email: '', password: '' },
    errorMessage = null;
  if (flash.length > 0) {
    errorMessage = flash[0];
  }
  if (flash.length > 1) {
    validationErrors = flash[1];
    oldInput = flash[2];
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage,
    validationErrors,
    oldInput,
  });
};

exports.postLoin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash('error', ['invalid email', ['email'], { email, password }]);
        return res.redirect('/login');
      }
      return bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              return res.redirect('/');
            });
          }
          req.flash('error', ['Invalid Password.', ['password'], { email, password }]);
          return res.redirect('/login');
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Login',
    path: '/signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = '';
    // console.log(errors.array());
    for (let msg of errors.array()) {
      message += msg.msg + ', ';
    }
    return res.status(422).render('auth/signup', {
      pageTitle: 'Login',
      path: '/signup',
      isAuthenticated: false,
      errorMessage: message,
      oldInput: {
        username,
        email,
        password,
        confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        username,
        email,
        password: hashPassword,
        cart: { itmes: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
      (async () => {
        try {
          const result = await transporter.sendMail({
            from: 'moataz.bahaa220@gmail.com',
            to: 'moatazbahaa20@gmail.com',
            subject: 'Signup succeeded',
            html: '<h1>You succesfully signed up!</h1>',
          });
        } catch (err) {
          console.log(err);
        }
      })();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    pageTitle: 'rest password',
    path: '/reset',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      req.flash('error', 'Erroro in backend!!!');
      console.log(error);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    (async () => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        res.redirect('/');
        const result = await transporter.sendMail({
          from: 'moataz.bahaa220@gmail.com',
          to: email,
          subject: 'Reset password',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
            `,
        });
      } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    })();
  });
};

exports.getNewPassword = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash('error', 'invalid token');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      pageTitle: 'New password',
      path: '/new-password',
      errorMessage: message,
      userId: user._id.toString(),
      token,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const { userId, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'invalid token');
      return res.redirect('/rest');
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect('/login');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
