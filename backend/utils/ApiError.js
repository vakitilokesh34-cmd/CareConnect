class ApiError extends Error {
  constructor(statusCode, message, errors = [], code = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.code = code || `ERR_${statusCode}`;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors, 'BAD_REQUEST');
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, [], 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, [], 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`, [], 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, [], 'CONFLICT');
  }

  static validation(message, errors) {
    return new ApiError(422, message, errors, 'VALIDATION_ERROR');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;