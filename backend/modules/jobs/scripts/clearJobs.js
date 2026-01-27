import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import dotenv from 'dotenv';
dotenv.config();

async function clearJobs() {
  console.log('Clearing all jobs from sheet (keeping headers)...\n');
  
  const sheets = await getSheetsClient();
  
  try {
    // Clear all rows except the header (A2 and below)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Z1000`
    });
    
    console.log('✅ All jobs cleared!');
    console.log('Sheet is now empty and ready for fresh non-technical entry-level jobs.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearJobs();
