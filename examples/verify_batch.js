/**
 * Example: Batch email verification
 */

const EmailListChecker = require('../index');

// Replace with your actual API key
const apiKey = 'your_api_key_here';

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    // Initialize client
    const client = new EmailListChecker(apiKey);

    // List of emails to verify
    const emails = [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com',
      'invalid@invalid-domain-xyz.com',
      'test@gmail.com'
    ];

    console.log(`Submitting batch of ${emails.length} emails...`);

    // Submit batch
    const batch = await client.verifyBatch(emails, 'My Test Batch');
    const batchId = batch.id;

    console.log('Batch submitted successfully!');
    console.log(`Batch ID: ${batchId}`);
    console.log(`Status: ${batch.status}`);
    console.log(`Total emails: ${batch.total_emails}\n`);

    // Monitor progress
    console.log('Monitoring progress...');
    let previousProgress = 0;

    while (true) {
      const status = await client.getBatchStatus(batchId);

      if (status.progress !== previousProgress) {
        console.log(`Progress: ${status.progress}% (${status.processed_emails}/${status.total_emails} processed)`);
        previousProgress = status.progress;
      }

      if (status.status === 'completed') {
        console.log('\nBatch verification completed!\n');
        break;
      } else if (status.status === 'failed') {
        console.log('\nBatch verification failed!');
        process.exit(1);
      }

      await sleep(2000);  // Wait 2 seconds before checking again
    }

    // Get final statistics
    const finalStatus = await client.getBatchStatus(batchId);
    console.log('=== Final Statistics ===');
    console.log(`Total: ${finalStatus.total_emails}`);
    console.log(`Valid: ${finalStatus.valid_emails}`);
    console.log(`Invalid: ${finalStatus.invalid_emails}`);
    console.log(`Unknown: ${finalStatus.unknown_emails}\n`);

    // Download results
    console.log('Downloading results...');
    const results = await client.getBatchResults(batchId, 'json', 'all');

    console.log('\n=== Results ===');
    results.data.forEach(result => {
      const status = {
        'deliverable': '✓',
        'undeliverable': '✗',
        'risky': '⚠'
      }[result.result] || '?';

      console.log(`${status} ${result.email}: ${result.result} (${result.reason})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

main();
