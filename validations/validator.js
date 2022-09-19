const { body } = require('express-validator');
const User = require('../models/user');

exports.signupValidator = [
  body('email')
    .isEmail()
    .withMessage('Please Enter a valid email')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('this email is already exists aleardy exists');
      }
      // return true;
    })
    .normalizeEmail(),
  body(
    'password',
    'Please enter a pasword with only numbers and text and it should be at least 6 charachter'
  ) // password in [body]
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and confirm password have to match.');
    }
    return true;
  }),
];

exports.productValidator = [
  body('title', 'invalid title').isString().isLength({ min: 3 }).trim(),
  body('price', 'price should be a floating point number').isFloat(),
  body('description', 'invalid description').isLength({ min: 5, max: 200 }).trim(),
];
