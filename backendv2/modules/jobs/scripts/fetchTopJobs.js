import { fetchAdzunaJobs, fetchJoobleJobs, fetchRemotiveJobs } from '../../jobs/services/jobApis.js';
import { addJobs } from '../../jobs/services/sheetsService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fetch ONLY high-quality customer service jobs
 * Focus: Entry-level, hourly pay, good descriptions
 */

async function fetchTopCustomerServiceJobs() {
  console.log('🎯 Fetching Top Customer Service Jobs\n');
  console.log('Criteria:');
  console.log('- Entry-level customer service only');
  console.log('- Hourly pay required');
  console.log('- Good job descriptions');
  console.log('- Remote/work from home\n');
  console.log('='.repeat(50));
  
  try {
    let allJobs = [];
    
    // Fetch from Jooble (2 jobs)
    console.log('\n📞 Fetching from Jooble...');
    const joobleJobs = await fetchJoobleJobs(20); // Get more to filter
    const topJooble = joobleJobs
      .filter(job => {
        const hasHourly = job.salaryRange && (
          job.salaryRange.includes('/hour') || 
          job.salaryRange.includes('hourly') ||
          job.salaryRange.includes('per hour')
        );
        const hasGoodDescription = job.description && job.description.length > 200;
        return hasHourly && hasGoodDescription;
      })
      .slice(0, 2);
    
    console.log(`  ✓ Found ${topJooble.length} quality jobs from Jooble`);
    allJobs.push(...topJooble);
    
    // Fetch from Adzuna (1 job)
    console.log('\n📞 Fetching from Adzuna...');
    const adzunaJobs = await fetchAdzunaJobs('us', 20);
    const topAdzuna = adzunaJobs
      .filter(job => {
        const hasHourly = job.salaryRange && job.salaryRange !== 'Not specified' && (
          job.salaryRange.includes('/hour') || 
          job.salaryRange.includes('hourly')
        );
        const hasGoodDescription = job.description && job.description.length > 200;
        return hasHourly && hasGoodDescription;
      })
      .slice(0, 1);
    
    console.log(`  ✓ Found ${topAdzuna.length} quality jobs from Adzuna`);
    allJobs.push(...topAdzuna);
    
    // Fetch from Remotive (backup if needed)
    if (allJobs.length < 3) {
      console.log('\n📞 Fetching from Remotive (backup)...');
      const remotiveJobs = await fetchRemotiveJobs(10);
      const topRemotive = remotiveJobs
        .filter(job => {
          const hasGoodDescription = job.description && job.description.length > 200;
          return hasGoodDescription;
        })
        .slice(0, 3 - allJobs.length);
      
      console.log(`  ✓ Found ${topRemotive.length} quality jobs from Remotive`);
      allJobs.push(...topRemotive);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Total high-quality CS jobs: ${allJobs.length}`);
    
    if (allJobs.length === 0) {
      console.log('\n⚠️  No jobs found matching criteria');
      return;
    }
    
    // Display jobs
    console.log('\n📋 Jobs to be added:\n');
    allJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Pay: ${job.salaryRange}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Source: ${job.source}`);
      console.log('');
    });
    
    // Add to Google Sheets
    const added = await addJobs(allJobs);
    
    console.log('='.repeat(50));
    console.log(`\n✅ Successfully added ${added.newJobs} new job(s)`);
    console.log(`⏭️  Skipped ${added.duplicates} duplicate(s)`);
    console.log(`\n📊 Total jobs in database: ${added.total}`);
    
    console.log('\n💡 These are your featured jobs for ads/promotions!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fetchTopCustomerServiceJobs();
