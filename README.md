# EmailListChecker Node.js SDK

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Official Node.js SDK for the [EmailListChecker](https://emaillistchecker.io) email verification API.

## Features

- **Email Verification** - Verify single or bulk email addresses
- **Email Finder** - Discover email addresses by name, domain, or company
- **Credit Management** - Check balance and usage
- **Batch Processing** - Async verification of large lists
- **Promise-based** - Modern async/await support
- **Error Handling** - Comprehensive error classes
- **TypeScript Ready** - Full JSDoc annotations

## Requirements

- Node.js 14.0.0 or higher
- npm or yarn

## Installation

Install via npm using git:

```bash
npm install git+https://github.com/Emaillistchecker-io/emaillistchecker-node.git
```

Or with yarn:

```bash
yarn add git+https://github.com/Emaillistchecker-io/emaillistchecker-node.git
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "emaillistchecker": "git+https://github.com/Emaillistchecker-io/emaillistchecker-node.git"
  }
}
```

## Quick Start

```javascript
const EmailListChecker = require('emaillistchecker');

// Initialize client
const client = new EmailListChecker('your_api_key_here');

// Verify an email
const result = await client.verify('test@example.com');
console.log(`Result: ${result.result}`);  // deliverable, undeliverable, risky, unknown
console.log(`Score: ${result.score}`);     // 0.0 to 1.0
```

## Get Your API Key

1. Sign up at [platform.emaillistchecker.io](https://platform.emaillistchecker.io/register)
2. Get your API key from the [API Dashboard](https://platform.emaillistchecker.io/api)
3. Start verifying!

## Usage Examples

### Single Email Verification

```javascript
const EmailListChecker = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

// Verify single email
(async () => {
  try {
    const result = await client.verify('user@example.com');

    if (result.result === 'deliverable') {
      console.log('✓ Email is valid and deliverable');
    } else if (result.result === 'undeliverable') {
      console.log('✗ Email is invalid');
    } else if (result.result === 'risky') {
      console.log('⚠ Email is risky (catch-all, disposable, etc.)');
    } else {
      console.log('? Unable to determine');
    }

    // Check details
    console.log(`Disposable: ${result.disposable}`);
    console.log(`Role account: ${result.role}`);
    console.log(`Free provider: ${result.free}`);
    console.log(`SMTP provider: ${result.smtp_provider}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Batch Email Verification

```javascript
const EmailListChecker = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

(async () => {
  try {
    // Submit batch for verification
    const emails = [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ];

    const batch = await client.verifyBatch(emails, 'My Campaign List');
    const batchId = batch.id;

    console.log(`Batch ID: ${batchId}`);
    console.log(`Status: ${batch.status}`);

    // Check progress
    let status;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      status = await client.getBatchStatus(batchId);
      console.log(`Progress: ${status.progress}%`);
    } while (status.status !== 'completed');

    // Download results
    const results = await client.getBatchResults(batchId, 'json', 'all');

    results.data.forEach(emailData => {
      console.log(`${emailData.email}: ${emailData.result}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Email Finder

```javascript
const EmailListChecker = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

(async () => {
  try {
    // Find email by name and domain
    const result = await client.findEmail('John', 'Doe', 'example.com');

    console.log(`Found: ${result.email}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Verified: ${result.verified}`);

    // Find all emails for a domain
    const domainResults = await client.findByDomain('example.com', 50);

    domainResults.emails.forEach(email => {
      console.log(`${email.email} - Last verified: ${email.last_verified}`);
    });

    // Find emails by company name
    const companyResults = await client.findByCompany('Acme Corporation');

    console.log(`Possible domains: ${companyResults.possible_domains.join(', ')}`);
    companyResults.emails.forEach(email => {
      console.log(`${email.email} (${email.domain})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Credit Management

```javascript
const EmailListChecker = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

(async () => {
  try {
    // Check credit balance
    const credits = await client.getCredits();
    console.log(`Available credits: ${credits.balance}`);
    console.log(`Used this month: ${credits.used_this_month}`);
    console.log(`Current plan: ${credits.plan}`);

    // Get usage statistics
    const usage = await client.getUsage();
    console.log(`Total API calls: ${usage.total_requests}`);
    console.log(`Successful: ${usage.successful_requests}`);
    console.log(`Failed: ${usage.failed_requests}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### List Management

```javascript
const EmailListChecker = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

(async () => {
  try {
    // Get all lists
    const lists = await client.getLists();

    lists.forEach(list => {
      console.log(`ID: ${list.id}`);
      console.log(`Name: ${list.name}`);
      console.log(`Status: ${list.status}`);
      console.log(`Total emails: ${list.total_emails}`);
      console.log(`Valid: ${list.valid_emails}`);
      console.log('---');
    });

    // Delete a list
    await client.deleteList(123);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

## Error Handling

```javascript
const EmailListChecker = require('emaillistchecker');
const {
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ValidationError,
  EmailListCheckerError
} = require('emaillistchecker');

const client = new EmailListChecker('your_api_key');

(async () => {
  try {
    const result = await client.verify('test@example.com');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Invalid API key');
    } else if (error instanceof InsufficientCreditsError) {
      console.error('Not enough credits');
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limit exceeded. Retry after ${error.retryAfter} seconds`);
    } else if (error instanceof ValidationError) {
      console.error(`Validation error: ${error.message}`);
    } else if (error instanceof EmailListCheckerError) {
      console.error(`API error: ${error.message}`);
      if (error.statusCode) {
        console.error(`Status code: ${error.statusCode}`);
      }
    } else {
      console.error(`Unexpected error: ${error.message}`);
    }
  }
})();
```

## API Response Format

### Verification Result

```javascript
{
  email: 'user@example.com',
  result: 'deliverable',  // deliverable | undeliverable | risky | unknown
  reason: 'VALID',         // VALID | INVALID | ACCEPT_ALL | DISPOSABLE | etc.
  disposable: false,       // Is temporary/disposable email
  role: false,             // Is role-based (info@, support@, etc.)
  free: false,             // Is free provider (gmail, yahoo, etc.)
  score: 1.0,              // Deliverability score (0.0 - 1.0)
  smtp_provider: 'google', // Email provider
  mx_records: ['mx1.google.com', 'mx2.google.com'],
  domain: 'example.com',
  spam_trap: false,
  mx_found: true
}
```

## Configuration

### Custom Timeout

```javascript
const EmailListChecker = require('emaillistchecker');

// Set custom timeout (default: 30000ms / 30 seconds)
const client = new EmailListChecker(
  'your_api_key',
  'https://platform.emaillistchecker.io/api/v1',
  60000  // 60 seconds timeout
);
```

### Custom Base URL

```javascript
const EmailListChecker = require('emaillistchecker');

// Use custom API endpoint (for testing or private instances)
const client = new EmailListChecker(
  'your_api_key',
  'https://custom-api.example.com/api/v1'
);
```

## TypeScript Support

While this package is written in JavaScript, it includes comprehensive JSDoc annotations for TypeScript users:

```typescript
import EmailListChecker from 'emaillistchecker';

const client = new EmailListChecker('your_api_key');

async function verifyEmail(email: string) {
  const result = await client.verify(email);
  return result;
}
```

## Support

- **Documentation**: [platform.emaillistchecker.io/api](https://platform.emaillistchecker.io/api)
- **Email**: support@emaillistchecker.io
- **Issues**: [GitHub Issues](https://github.com/Emaillistchecker-io/emaillistchecker-node/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by [EmailListChecker](https://emaillistchecker.io)
