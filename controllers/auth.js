const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message,
  });
};

exports.postLoin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email');
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
          req.flash('error', 'Invalid Password.');
          return res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          return res.redirect('/login');
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
};

exports.getSignup = (req, res) => {
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
  });
};

exports.postSignup = (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    req.flash('error', 'password and confirm password should be the same');
    return res.redirect('/signup');
  }
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'E-Mail exists already, please pick a different one.');
        return res.redirect('/signup');
      }
      return bcrypt
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
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
