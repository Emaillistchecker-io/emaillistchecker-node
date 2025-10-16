/**
 * Example: Verify a single email address
 */

const EmailListChecker = require('../index');

// Replace with your actual API key
const apiKey = 'your_api_key_here';

async function main() {
  try {
    // Initialize client
    const client = new EmailListChecker(apiKey);

    // Verify an email
    console.log('Verifying email...');
    const result = await client.verify('test@example.com');

    // Display results
    console.log('\n=== Verification Result ===');
    console.log(`Email: ${result.email}`);
    console.log(`Result: ${result.result}`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Score: ${result.score}`);
    console.log('\n=== Email Details ===');
    console.log(`Disposable: ${result.disposable ? 'Yes' : 'No'}`);
    console.log(`Role-based: ${result.role ? 'Yes' : 'No'}`);
    console.log(`Free provider: ${result.free ? 'Yes' : 'No'}`);
    console.log(`SMTP Provider: ${result.smtp_provider}`);
    console.log(`Domain: ${result.domain}`);

    if (result.mx_records && result.mx_records.length > 0) {
      console.log('\nMX Records:');
      result.mx_records.forEach(mx => {
        console.log(`  - ${mx}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

main();
