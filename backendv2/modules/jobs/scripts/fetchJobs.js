import { fetchAllJobs } from '../services/jobApis.js';
import { addJobs } from '../services/sheetsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🔍 Job Fetcher V2 - HIGH VOLUME MODE\n');
  console.log('=' .repeat(60));
  console.log('🎯 TARGET: 5,000+ remote jobs from all sources');
  console.log('=' .repeat(60));
  
  try {
    // V2 HIGH VOLUME: Fetch 500+ jobs per source (targeting 2000+ total)
    const jobs = await fetchAllJobs(500);
    
    if (jobs.length === 0) {
      console.log('\n⚠️  No jobs found. Check your internet connection and API keys.');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 Adding jobs to Google Sheets...\n');
    
    // Add to Google Sheets
    const addedCount = await addJobs(jobs);
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Success! Added ${addedCount} new jobs`);
    console.log(`   (${jobs.length - addedCount} duplicates skipped)`);
    console.log(`\n📊 Total jobs in sheet: ${addedCount} new + existing`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
