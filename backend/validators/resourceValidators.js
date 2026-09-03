const { body, param, query } = require('express-validator');
const { isValidMongoId } = require('../middleware/validate');

exports.idParam = (name = 'id') =>
  param(name).custom(isValidMongoId).withMessage(`Invalid ${name} identifier`);

exports.categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 60 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('icon').optional().trim().isLength({ max: 40 }),
  body('requiredSkills').optional().isArray().withMessage('Required skills must be an array'),
  body('requiredSkills.*').optional().trim().notEmpty().withMessage('Skill cannot be empty'),
  body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a non-negative number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

exports.providerProfileValidator = [
  body('businessName').trim().notEmpty().withMessage('Business name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 1500 }),
  body('experience').optional().isInt({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().notEmpty().withMessage('Skill cannot be empty'),
  body('serviceCategories').optional().isArray().withMessage('Service categories must be an array'),
  body('serviceCategories.*').optional().custom(isValidMongoId).withMessage('Invalid category id'),
  body('serviceAreas').optional().isArray().withMessage('Service areas must be an array'),
  body('serviceAreas.*.city').optional().trim().notEmpty().withMessage('Service area city is required'),
  body('pricing.baseRate').optional().isFloat({ min: 0 }).withMessage('Base rate must be non-negative'),
  body('pricing.minimumCharge').optional().isFloat({ min: 0 }).withMessage('Minimum charge must be non-negative'),
  body('pricing.travelFee').optional().isFloat({ min: 0 }).withMessage('Travel fee must be non-negative'),
  body('pricing.unit').optional().isIn(['PER_JOB', 'PER_HOUR', 'PER_SQFT']).withMessage('Invalid pricing unit'),
];

exports.availabilityValidator = [
  body('startTime').isISO8601().withMessage('startTime must be a valid date-time'),
  body('endTime').isISO8601().withMessage('endTime must be a valid date-time'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
];

exports.serviceRequestValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Please describe your problem').isLength({ max: 2000 }),
  body('images').optional().isArray({ max: 10 }).withMessage('Images must be a list of up to 10'),
  body('address.line1').notEmpty().withMessage('Service address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.postalCode').optional().trim().isLength({ max: 10 }),
  body('preferredDate').optional().isISO8601().withMessage('preferredDate must be a valid date'),
  body('preferredTime').optional().trim().isLength({ max: 20 }),
];

exports.quoteValidator = [
  body('serviceRequest').custom(isValidMongoId).withMessage('Invalid service request id'),
  body('estimatedPrice').isFloat({ min: 0 }).withMessage('Estimated price must be a non-negative number'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('estimatedDuration').optional().trim().isLength({ max: 50 }),
];

exports.bookingValidator = [
  body('serviceRequest').custom(isValidMongoId).withMessage('Invalid service request id'),
  body('quote').custom(isValidMongoId).withMessage('Invalid quote id'),
  body('provider').custom(isValidMongoId).withMessage('Invalid provider id'),
  body('scheduledStartTime').isISO8601().withMessage('Scheduled start time must be a valid date-time'),
  body('scheduledEndTime').isISO8601().withMessage('Scheduled end time must be a valid date-time'),
];

exports.jobUpdateValidator = [
  body('status')
    .isIn(['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CUSTOMER_CONFIRMED'])
    .withMessage('Invalid job status'),
  body('note').optional().trim().isLength({ max: 1500 }),
  body('beforeImages').optional().isArray().withMessage('beforeImages must be an array'),
  body('afterImages').optional().isArray().withMessage('afterImages must be an array'),
];

exports.reviewValidator = [
  body('booking').custom(isValidMongoId).withMessage('Invalid booking id'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
];

exports.disputeValidator = [
  body('booking').custom(isValidMongoId).withMessage('Invalid booking id'),
  body('reason').trim().notEmpty().withMessage('Dispute reason is required').isLength({ max: 120 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('evidence').optional().isArray().withMessage('Evidence must be an array'),
];

exports.resolveDisputeValidator = [
  body('action').trim().notEmpty().withMessage('Resolution action is required'),
  body('notes').optional().trim().isLength({ max: 1500 }),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be non-negative'),
];

exports.adminStatusValidator = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

exports.verifyProviderValidator = [
  body('verificationStatus').isIn(['VERIFIED', 'REJECTED']).withMessage('Invalid verification status'),
  body('rejectionReason').optional().trim().isLength({ max: 500 }),
];

exports.pagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];