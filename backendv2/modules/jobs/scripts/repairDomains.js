import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

/**
 * Guess domain from company name
 */
function guessDomain(companyName) {
  if (!companyName || companyName.length < 3) return null;
  
  let cleanName = companyName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc|llc|ltd|corp|corporation|company|co\b/g, '');
  
  if (cleanName.length < 3) return null;
  
  return `${cleanName}.com`;
}

/**
 * Get all jobs
 */
async function getAllJobs() {
  const sheets = await getSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:U`
  });

  if (!response.data.values) {
    return [];
  }

  return response.data.values
    .map((row, index) => ({
      rowIndex: index + 2,
      company: row[3],
      companyEmailDomain: row[4], // Column E
      domainSource: row[5]         // Column F
    }))
    .filter(job => job.company && job.company !== 'N/A');
}

/**
 * Batch update column E
 */
async function batchFixDomains(updates) {
  if (updates.length === 0) return;
  
  const sheets = await getSheetsClient();
  
  const data = updates.map(update => ({
    range: `${SHEET_NAME}!E${update.rowIndex}:F${update.rowIndex}`,
    values: [[update.domain, 'guessed']]
  }));
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: data
    }
  });
}

/**
 * Fix corrupted domains
 */
async function repairDomains() {
  console.log('🔧 Repairing Column E (Guessed Domains)\n');
  console.log('=' .repeat(60));
  
  try {
    console.log('📊 Loading all jobs...\n');
    const jobs = await getAllJobs();
    
    console.log(`Found ${jobs.length} jobs`);
    
    const BATCH_SIZE = 50;
    let updateBatch = [];
    let fixed = 0;
    
    for (const job of jobs) {
      const currentDomain = job.companyEmailDomain;
      const guessedDomain = guessDomain(job.company);
      
      // Fix if domain is clearly wrong
      const needsFix = !currentDomain || 
                       currentDomain === 'N/A' ||
                       currentDomain === 'w3.org' ||
                       currentDomain.includes('w3.org') ||
                       currentDomain.includes('schema.org') ||
                       currentDomain.includes('wikipedia.org');
      
      if (needsFix && guessedDomain) {
        updateBatch.push({
          rowIndex: job.rowIndex,
          domain: guessedDomain
        });
        fixed++;
        
        if (updateBatch.length >= BATCH_SIZE) {
          console.log(`Fixing batch of ${updateBatch.length}...`);
          await batchFixDomains(updateBatch);
          updateBatch = [];
        }
      }
    }
    
    // Update remaining
    if (updateBatch.length > 0) {
      console.log(`Fixing final batch of ${updateBatch.length}...`);
      await batchFixDomains(updateBatch);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Repair Complete!\n');
    console.log(`   Fixed ${fixed} domains in Column E`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

repairDomains();
