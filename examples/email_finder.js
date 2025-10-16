/**
 * Example: Email Finder
 */

const EmailListChecker = require('../index');

// Replace with your actual API key
const apiKey = 'your_api_key_here';

async function main() {
  try {
    // Initialize client
    const client = new EmailListChecker(apiKey);

    // Example 1: Find email by name and domain
    console.log('=== Find Email by Name ===');
    const result = await client.findEmail('John', 'Doe', 'example.com');

    console.log(`Email found: ${result.email}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Pattern: ${result.pattern}`);
    console.log(`Verified: ${result.verified ? 'Yes' : 'No'}`);

    if (result.alternatives && result.alternatives.length > 0) {
      console.log('\nAlternative patterns:');
      result.alternatives.forEach(alt => {
        console.log(`  - ${alt}`);
      });
    }

    console.log('');

    // Example 2: Find emails by domain
    console.log('=== Find Emails by Domain ===');
    const domainResults = await client.findByDomain('example.com', 10);

    console.log(`Domain: ${domainResults.domain}`);
    console.log(`Total found: ${domainResults.total_found}`);

    if (domainResults.patterns && domainResults.patterns.length > 0) {
      console.log('\nCommon email patterns:');
      domainResults.patterns.forEach(pattern => {
        console.log(`  - ${pattern}`);
      });
    }

    console.log('\nFound emails:');
    domainResults.emails.forEach(email => {
      console.log(`  - ${email.email} (Last verified: ${email.last_verified})`);
    });

    console.log('');

    // Example 3: Find emails by company
    console.log('=== Find Emails by Company ===');
    const companyResults = await client.findByCompany('Acme Corporation', 10);

    console.log(`Company: ${companyResults.company}`);
    console.log(`Total found: ${companyResults.total_found}`);

    if (companyResults.possible_domains && companyResults.possible_domains.length > 0) {
      console.log('\nPossible domains:');
      companyResults.possible_domains.forEach(domain => {
        console.log(`  - ${domain}`);
      });
    }

    console.log('\nFound emails:');
    companyResults.emails.forEach(email => {
      console.log(`  - ${email.email} (${email.domain})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

main();
