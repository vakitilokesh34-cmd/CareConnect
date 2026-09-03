class ApiResponse {
  constructor(success, message, data = null, errors = []) {
    this.success = success;
    this.message = message;
    if (data !== null && data !== undefined) this.data = data;
    if (errors && errors.length > 0) this.errors = errors;
  }

  static ok(message, data) {
    return new ApiResponse(true, message || 'Operation completed successfully', data);
  }

  static created(message, data) {
    return new ApiResponse(true, message || 'Resource created', data);
  }

  static fail(message, errors) {
    return new ApiResponse(false, message || 'Operation failed', null, errors);
  }
}

module.exports = ApiResponse;