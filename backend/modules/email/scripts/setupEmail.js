import { initializeLeadsSheet } from '../services/leadsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Setting up Email & Leads system...\n');
  
  try {
    await initializeLeadsSheet();
    console.log('\n✅ Email system setup complete!');
    console.log('\nNext steps:');
    console.log('1. Enable Gmail API in Google Cloud Console');
    console.log('2. Add Gmail scopes to your service account');
    console.log('3. Run "npm run process-emails" to check inbox');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
