const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

exports.registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_POLICY)
    .withMessage(
      'Password must contain an uppercase letter, a lowercase letter, a number and a special character'
    ),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .custom((role) => {
      if (role && role !== ROLES.CUSTOMER && role !== ROLES.SERVICE_PROVIDER) {
        throw new Error('Public registration is limited to customer and provider roles');
      }
      return true;
    })
    .withMessage('Invalid role for public registration'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL'),
  body('addresses')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Addresses must be a list'),
  body('addresses.*.line1').optional().notEmpty().withMessage('Address line is required'),
  body('addresses.*.city').optional().notEmpty().withMessage('City is required'),
];