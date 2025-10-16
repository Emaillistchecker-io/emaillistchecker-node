/**
 * Base exception for EmailListChecker SDK
 */
class EmailListCheckerError extends Error {
  constructor(message, statusCode = null, responseData = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.responseData = responseData;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception thrown when API authentication fails
 */
class AuthenticationError extends EmailListCheckerError {
  constructor(message, statusCode = 401, responseData = null) {
    super(message, statusCode, responseData);
  }
}

/**
 * Exception thrown when account has insufficient credits
 */
class InsufficientCreditsError extends EmailListCheckerError {
  constructor(message, statusCode = 402, responseData = null) {
    super(message, statusCode, responseData);
  }
}

/**
 * Exception thrown when API rate limit is exceeded
 */
class RateLimitError extends EmailListCheckerError {
  constructor(message, retryAfter = 60, statusCode = 429, responseData = null) {
    super(message, statusCode, responseData);
    this.retryAfter = retryAfter;
  }
}

/**
 * Exception thrown when request validation fails
 */
class ValidationError extends EmailListCheckerError {
  constructor(message, statusCode = 422, responseData = null) {
    super(message, statusCode, responseData);
  }
}

/**
 * Exception thrown for general API errors
 */
class ApiError extends EmailListCheckerError {}

module.exports = {
  EmailListCheckerError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ValidationError,
  ApiError
};
