/**
 * Example: Check credits and usage
 */

const EmailListChecker = require('../index');

// Replace with your actual API key
const apiKey = 'your_api_key_here';

async function main() {
  try {
    // Initialize client
    const client = new EmailListChecker(apiKey);

    // Get credit balance
    console.log('=== Credit Balance ===');
    const credits = await client.getCredits();

    console.log(`Available credits: ${credits.balance}`);
    console.log(`Used this month: ${credits.used_this_month}`);
    console.log(`Current plan: ${credits.plan}\n`);

    // Get usage statistics
    console.log('=== Usage Statistics ===');
    const usage = await client.getUsage();

    console.log(`Total API requests: ${usage.total_requests}`);
    console.log(`Successful requests: ${usage.successful_requests}`);
    console.log(`Failed requests: ${usage.failed_requests}`);

    // Calculate success rate
    if (usage.total_requests > 0) {
      const successRate = (usage.successful_requests / usage.total_requests) * 100;
      console.log(`Success rate: ${successRate.toFixed(2)}%`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

main();
