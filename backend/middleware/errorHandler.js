const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl}`));
};

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (err instanceof ApiError && err.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'value';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errors: [{ field, value: error.keyValue?.[field] }],
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier format',
      errors: [{ field: error.path, value: error.value }],
    });
  }

  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
      errors: [error.message],
    });
  }

  console.error('Unhandled error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: [],
  });
};

module.exports = { notFoundHandler, globalErrorHandler };