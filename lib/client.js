const axios = require('axios');
const {
  EmailListCheckerError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ValidationError,
  ApiError
} = require('./errors');

/**
 * EmailListChecker API Client
 *
 * This class provides methods to interact with the EmailListChecker API.
 */
class EmailListChecker {
  /**
   * Create a new EmailListChecker instance
   *
   * @param {string} apiKey - Your EmailListChecker API key
   * @param {string} baseUrl - API base URL (default: https://platform.emaillistchecker.io/api/v1)
   * @param {number} timeout - Request timeout in milliseconds (default: 30000)
   */
  constructor(apiKey, baseUrl = 'https://platform.emaillistchecker.io/api/v1', timeout = 30000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'EmailListChecker-Node/1.0.0'
      }
    });
  }

  /**
   * Make HTTP request to API
   *
   * @private
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async _request(method, endpoint, options = {}) {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        ...options
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;

        // Handle rate limiting
        if (statusCode === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
          throw new RateLimitError(
            `Rate limit exceeded. Retry after ${retryAfter} seconds`,
            retryAfter,
            statusCode,
            responseData
          );
        }

        // Handle authentication errors
        if (statusCode === 401) {
          throw new AuthenticationError(
            responseData.error || 'Invalid API key',
            statusCode,
            responseData
          );
        }

        // Handle insufficient credits
        if (statusCode === 402) {
          throw new InsufficientCreditsError(
            responseData.error || 'Insufficient credits',
            statusCode,
            responseData
          );
        }

        // Handle validation errors
        if (statusCode === 422) {
          throw new ValidationError(
            responseData.message || 'Validation error',
            statusCode,
            responseData
          );
        }

        // Handle other API errors
        throw new ApiError(
          responseData.error || `API error: ${statusCode}`,
          statusCode,
          responseData
        );
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        throw new EmailListCheckerError(`Request timeout after ${this.timeout}ms`);
      }

      throw new EmailListCheckerError(`Request failed: ${error.message}`);
    }
  }

  /**
   * Verify a single email address
   *
   * @param {string} email - Email address to verify
   * @param {number} [timeout] - Verification timeout in seconds (5-60)
   * @param {boolean} [smtpCheck=true] - Perform SMTP verification
   * @returns {Promise<Object>} Verification result
   */
  async verify(email, timeout = null, smtpCheck = true) {
    const params = {
      email,
      smtp_check: smtpCheck
    };

    if (timeout !== null) {
      params.timeout = timeout;
    }

    const response = await this._request('POST', '/verify', { data: params });
    return response.data || response;
  }

  /**
   * Submit emails for batch verification
   *
   * @param {Array<string>} emails - List of email addresses (max 10,000)
   * @param {string} [name] - Name for this batch
   * @param {string} [callbackUrl] - Webhook URL for completion notification
   * @param {boolean} [autoStart=true] - Start verification immediately
   * @returns {Promise<Object>} Batch submission result
   */
  async verifyBatch(emails, name = null, callbackUrl = null, autoStart = true) {
    const data = {
      emails,
      auto_start: autoStart
    };

    if (name) {
      data.name = name;
    }

    if (callbackUrl) {
      data.callback_url = callbackUrl;
    }

    const response = await this._request('POST', '/verify/batch', { data });
    return response.data || response;
  }

  /**
   * Get batch verification status
   *
   * @param {number} batchId - Batch ID
   * @returns {Promise<Object>} Batch status
   */
  async getBatchStatus(batchId) {
    const response = await this._request('GET', `/verify/batch/${batchId}`);
    return response.data || response;
  }

  /**
   * Download batch verification results
   *
   * @param {number} batchId - Batch ID
   * @param {string} [format='json'] - Output format - 'json', 'csv', 'txt'
   * @param {string} [filter='all'] - Filter results - 'all', 'valid', 'invalid', 'risky', 'unknown'
   * @returns {Promise<Object|string>} Results in requested format
   */
  async getBatchResults(batchId, format = 'json', filter = 'all') {
    const response = await this._request('GET', `/verify/batch/${batchId}/results`, {
      params: { format, filter }
    });

    if (format === 'json') {
      return response.data || response;
    }

    return response;
  }

  /**
   * Find email address by name and domain
   *
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @param {string} domain - Domain (e.g., 'example.com')
   * @returns {Promise<Object>} Found email information
   */
  async findEmail(firstName, lastName, domain) {
    const response = await this._request('POST', '/finder/email', {
      data: {
        first_name: firstName,
        last_name: lastName,
        domain
      }
    });

    return response.data || response;
  }

  /**
   * Find emails by domain
   *
   * @param {string} domain - Domain to search
   * @param {number} [limit=10] - Results per request (1-100)
   * @param {number} [offset=0] - Pagination offset
   * @returns {Promise<Object>} Found emails
   */
  async findByDomain(domain, limit = 10, offset = 0) {
    const response = await this._request('POST', '/finder/domain', {
      data: { domain, limit, offset }
    });

    return response.data || response;
  }

  /**
   * Find emails by company name
   *
   * @param {string} company - Company name
   * @param {number} [limit=10] - Results limit (1-100)
   * @returns {Promise<Object>} Found emails
   */
  async findByCompany(company, limit = 10) {
    const response = await this._request('POST', '/finder/company', {
      data: { company, limit }
    });

    return response.data || response;
  }

  /**
   * Get current credit balance
   *
   * @returns {Promise<Object>} Credit information
   */
  async getCredits() {
    const response = await this._request('GET', '/credits');
    return response.data || response;
  }

  /**
   * Get API usage statistics
   *
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsage() {
    const response = await this._request('GET', '/usage');
    return response.data || response;
  }

  /**
   * Get all verification lists
   *
   * @returns {Promise<Array>} List of verification batches
   */
  async getLists() {
    const response = await this._request('GET', '/lists');
    return response.data || response;
  }

  /**
   * Delete a verification list
   *
   * @param {number} listId - List ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteList(listId) {
    return await this._request('DELETE', `/lists/${listId}`);
  }
}

module.exports = EmailListChecker;
