import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: join(__dirname, '../../../.env') });

/**
 * Domain Guessing Script
 * - Generates domains from company names
 * - Only processes jobs with "unknown" domain source
 * - Batch updates for efficiency
 */

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
 * Get ALL jobs to guess domains for
 */
async function getAllJobsForGuessing() {
  const sheets = await getSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:D` // Only need Job ID, Title, Position, Company
  });

  if (!response.data.values) {
    return [];
  }

  return response.data.values
    .map((row, index) => ({
      rowIndex: index + 2,
      jobId: row[0],
      company: row[3]
    }))
    .filter(job => job.company && job.company !== 'N/A' && job.company.trim().length > 0);
}

/**
 * Batch update domains with source tracking
 */
async function batchUpdateDomains(updates) {
  if (updates.length === 0) return;
  
  const sheets = await getSheetsClient();
  
  const data = updates.map(update => ({
    range: `${SHEET_NAME}!E${update.rowIndex}:F${update.rowIndex}`, // E=Domain, F=Source
    values: [[update.domain, update.source]]
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
 * Domain guesser - generates domain from company name ONLY
 */
async function findDomainSmart(job) {
  const { company } = job;
  
  // ALWAYS guess domain from company name - ignore any existing domain
  const guessedDomain = guessDomain(company);
  
  if (guessedDomain) {
    return { domain: guessedDomain, method: 'guessed' };
  }
  
  return null;
}

/**
 * Main domain guessing
 */
async function enrichDomainsSmart() {
  console.log('🔍 Domain Guesser - V2\n');
  console.log('=' .repeat(60));
  console.log('⚠️  Generating domains from company names ONLY');
  console.log('⚠️  Will OVERWRITE any existing domains');
  console.log('⚠️  Domains are NOT verified - may be inaccurate');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n📊 Loading ALL jobs to guess domains...\n');
    const jobs = await getAllJobsForGuessing();
    
    console.log(`Found ${jobs.length} jobs to process\n`);
    
    if (jobs.length === 0) {
      console.log('❌ No jobs found in sheet!');
      return;
    }
    
    console.log('=' .repeat(60));
    
    let stats = {
      guessed: 0,
      failed: 0
    };
    
    // Group jobs by company to avoid duplicates
    console.log('🔄 Grouping jobs by company...\n');
    const companyMap = new Map();
    for (const job of jobs) {
      const companyKey = job.company.toLowerCase().trim();
      if (!companyMap.has(companyKey)) {
        companyMap.set(companyKey, []);
      }
      companyMap.get(companyKey).push(job);
    }
    
    console.log(`📊 ${jobs.length} jobs grouped into ${companyMap.size} unique companies\n`);
    console.log('=' .repeat(60));
    
    const BATCH_SIZE = 50;
    let updateBatch = [];
    let processedCompanies = 0;
    
    // Process one job per unique company
    for (const [companyKey, jobsForCompany] of companyMap.entries()) {
      processedCompanies++;
      const firstJob = jobsForCompany[0];
      
      console.log(`\n[${processedCompanies}/${companyMap.size}] ${firstJob.company} (${jobsForCompany.length} jobs)`);
      
      const result = await findDomainSmart(firstJob);
      
      if (result) {
        console.log(`  ❓ Guessed: ${result.domain} (applying to ${jobsForCompany.length} jobs)`);
        
        // Apply the same domain to ALL jobs from this company
        for (const job of jobsForCompany) {
          updateBatch.push({
            rowIndex: job.rowIndex,
            domain: result.domain,
            source: 'guessed'
          });
        }
        
        stats.guessed += jobsForCompany.length;
        
        // Batch update
        if (updateBatch.length >= BATCH_SIZE) {
          console.log(`\n📝 Updating batch of ${updateBatch.length} domains...`);
          await batchUpdateDomains(updateBatch);
          updateBatch = [];
        }
      } else {
        console.log('  ✗ Could not generate domain');
        stats.failed += jobsForCompany.length;
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Update remaining batch
    if (updateBatch.length > 0) {
      console.log(`\n📝 Updating final batch of ${updateBatch.length} domains...`);
      await batchUpdateDomains(updateBatch);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Domain Guessing Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   ❓ Guessed: ${stats.guessed}`);
    console.log(`   ✗ Failed: ${stats.failed}`);
    console.log(`   📦 Total processed: ${jobs.length}`);
    
    if (stats.guessed > 0) {
      console.log(`\n⚠️  All ${stats.guessed} domains are GUESSED from company names`);
      console.log(`   They are unverified and may be inaccurate`);
      console.log(`   Run Step 3 (Verify Domains) to check if they exist`);
    }
    
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
enrichDomainsSmart();
