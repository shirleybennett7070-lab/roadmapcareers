import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: join(__dirname, '../../../.env') });

/**
 * Insert a new column F (Domain Source) and shift all data to the right
 */
async function migrateInsertColumn() {
  console.log('📊 Migrating sheet to insert Domain Source column...\n');
  
  const sheets = await getSheetsClient();
  
  // Step 1: Get the sheet ID
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID
  });
  
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === SHEET_NAME);
  const sheetId = sheet.properties.sheetId;
  
  console.log(`✓ Found sheet: ${SHEET_NAME} (ID: ${sheetId})`);
  
  // Step 2: Insert a new column at position 5 (F column, 0-indexed)
  console.log('\n📝 Inserting new column F (Domain Source)...');
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [{
        insertDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: 5, // Insert after column E (Company Email Domain)
            endIndex: 6    // Insert 1 column
          },
          inheritFromBefore: false
        }
      }]
    }
  });
  
  console.log('✓ Column inserted successfully!');
  
  // Step 3: Update the header for the new column
  console.log('\n📝 Adding "Domain Source" header...');
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!F1`,
    valueInputOption: 'RAW',
    resource: {
      values: [['Domain Source']]
    }
  });
  
  console.log('✓ Header added successfully!');
  
  // Step 4: Fill the Domain Source column with placeholder
  console.log('\n📝 Getting row count...');
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`
  });
  
  const rowCount = response.data.values?.length || 0;
  console.log(`✓ Found ${rowCount} rows (including header)`);
  
  if (rowCount > 1) {
    console.log('\n📝 Filling Domain Source column with "unknown"...');
    
    // Create array of "unknown" for all data rows
    const fillValues = Array(rowCount - 1).fill(['unknown']);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!F2:F${rowCount}`,
      valueInputOption: 'RAW',
      resource: {
        values: fillValues
      }
    });
    
    console.log('✓ Filled with "unknown" placeholders');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Migration Complete!\n');
  console.log('📊 What happened:');
  console.log('   - Inserted new column F (Domain Source)');
  console.log('   - All data from old column F onwards shifted right by 1');
  console.log('   - Domain Source filled with "unknown" placeholder');
  console.log('   - New column layout:');
  console.log('     E: Company Email Domain');
  console.log('     F: Domain Source (NEW)');
  console.log('     G: HR Email 1');
  console.log('     H: HR Email 2');
  console.log('     I: HR Email 3');
  console.log('     J: Email Confidence');
  console.log('\n💡 Next: Run npm run enrich-domains to populate Domain Source');
  console.log('='.repeat(60));
}

// Run
migrateInsertColumn().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
