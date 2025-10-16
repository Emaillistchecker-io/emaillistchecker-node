/**
 * EmailListChecker Node.js SDK
 * Official Node.js client for the EmailListChecker API
 */

const EmailListChecker = require('./lib/client');
const {
  EmailListCheckerError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ValidationError,
  ApiError
} = require('./lib/errors');

module.exports = EmailListChecker;
module.exports.EmailListChecker = EmailListChecker;
module.exports.EmailListCheckerError = EmailListCheckerError;
module.exports.AuthenticationError = AuthenticationError;
module.exports.InsufficientCreditsError = InsufficientCreditsError;
module.exports.RateLimitError = RateLimitError;
module.exports.ValidationError = ValidationError;
module.exports.ApiError = ApiError;
