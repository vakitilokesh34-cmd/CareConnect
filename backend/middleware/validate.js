const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    throw ApiError.validation('Validation failed', errors);
  }
  next();
};

const isValidMongoId = (value) => {
  const { isValidObjectId } = require('mongoose');
  if (!isValidObjectId(value)) {
    throw new Error('Invalid Mongo DB id');
  }
  return true;
};

module.exports = { validate, isValidMongoId };