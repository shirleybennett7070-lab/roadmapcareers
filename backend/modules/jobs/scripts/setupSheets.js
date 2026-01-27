import { initializeSheet } from '../services/sheetsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Setting up Google Sheets...\n');
  
  try {
    await initializeSheet();
    console.log('\n✅ Google Sheets setup complete!');
    console.log('\nNext steps:');
    console.log('1. Check your Google Sheet to see the headers');
    console.log('2. Run "npm run fetch-jobs" to populate with jobs');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
