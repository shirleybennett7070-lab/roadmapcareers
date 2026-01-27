import { getSheetsClient, SHEET_ID } from '../config/sheets.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing Google Sheets connection...\n');
  
  try {
    const sheets = await getSheetsClient();
    
    // Try to get spreadsheet info
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });
    
    console.log('✅ Connection successful!');
    console.log(`\nSpreadsheet: ${response.data.properties.title}`);
    console.log(`URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
    console.log('\nAvailable sheets:');
    response.data.sheets.forEach(sheet => {
      console.log(`  - ${sheet.properties.title}`);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check that credentials.json exists');
    console.log('2. Check that GOOGLE_SHEET_ID is set in .env');
    console.log('3. Make sure you shared the sheet with the service account email');
    process.exit(1);
  }
}

main();
