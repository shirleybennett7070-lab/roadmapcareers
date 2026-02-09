import { fetchAllJobs } from '../services/jobApis.js';
import { addJobs } from '../services/sheetsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🔍 Job Fetcher - RoadmapCareers\n');
  console.log('=' .repeat(50));
  
  try {
    // Fetch jobs from all sources
    const jobs = await fetchAllJobs(20); // 20 jobs per source
    
    if (jobs.length === 0) {
      console.log('\n⚠️  No jobs found. Check your internet connection and API keys.');
      return;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 Adding jobs to Google Sheets...\n');
    
    // Add to Google Sheets
    const addedCount = await addJobs(jobs);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Success! Added ${addedCount} new jobs`);
    console.log(`   (${jobs.length - addedCount} duplicates skipped)`);
    console.log('\n📊 Check your Google Sheet to see the jobs!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
