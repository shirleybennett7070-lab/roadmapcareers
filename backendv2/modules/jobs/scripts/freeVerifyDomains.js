import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import axios from 'axios';
import dns from 'dns';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

/**
 * Step 3: Verify Domains
 *
 * READS:  E (guessed domain), F (domain source)
 * WRITES: F only (updates source to "verified-free")
 *
 * DOES NOT TOUCH: Column G or any other column.
 */

async function verifyDomainFree(domain) {
  if (!domain || domain === 'N/A') {
    return { valid: false, reason: 'No domain' };
  }

  const cleanDomain = domain.trim().toLowerCase();

  try {
    let hasARecord = false;
    try {
      const addresses = await resolve4(cleanDomain);
      hasARecord = addresses && addresses.length > 0;
    } catch (e) {}

    let hasMxRecords = false;
    try {
      const mxRecords = await resolveMx(cleanDomain);
      hasMxRecords = mxRecords && mxRecords.length > 0;
    } catch (e) {}

    let websiteAccessible = false;
    try {
      const response = await axios.get(`https://${cleanDomain}`, {
        timeout: 5000, maxRedirects: 5,
        validateStatus: (status) => status < 500
      });
      websiteAccessible = response.status < 400;
    } catch (e) {
      try {
        const response = await axios.get(`http://${cleanDomain}`, {
          timeout: 5000, maxRedirects: 5,
          validateStatus: (status) => status < 500
        });
        websiteAccessible = response.status < 400;
      } catch (e2) {}
    }

    const isValid = hasARecord || hasMxRecords || websiteAccessible;

    return {
      valid: isValid,
      hasARecord,
      hasMxRecords,
      websiteAccessible,
      confidence: (hasARecord ? 33 : 0) + (hasMxRecords ? 33 : 0) + (websiteAccessible ? 34 : 0)
    };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
}

async function getJobsNeedingVerification() {
  const sheets = await getSheetsClient();

  // ONLY read E and F — nothing else
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!E2:F`
  });

  if (!response.data.values) return [];

  return response.data.values
    .map((row, index) => ({
      rowIndex: index + 2,
      companyEmailDomain: row[0],  // E
      domainSource: row[1]         // F
    }))
    .filter(job =>
      job.companyEmailDomain &&
      job.companyEmailDomain !== 'N/A' &&
      job.companyEmailDomain !== '' &&
      job.domainSource === 'guessed'
    );
}

/**
 * ONLY writes to column F. Single cell per row. Nothing else.
 */
async function batchUpdateDomainSource(updates) {
  if (updates.length === 0) return;

  const sheets = await getSheetsClient();

  const data = updates.map(update => ({
    range: `${SHEET_NAME}!F${update.rowIndex}:F${update.rowIndex}`,  // F only, explicit end
    values: [[update.newSource]]
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: data
    }
  });
}

async function freeVerifyDomains() {
  console.log('✅ Step 3: Verify Domains\n');
  console.log('=' .repeat(60));
  console.log('READS:  Column E (guessed domain), Column F (source)');
  console.log('WRITES: Column F only (changes "guessed" → "verified-free")');
  console.log('DOES NOT TOUCH: Column G or any other column');
  console.log('Methods: DNS A Records + MX Records + HTTP Check');
  console.log('=' .repeat(60));

  try {
    console.log('\n📊 Loading guessed domains to verify...\n');
    const jobs = await getJobsNeedingVerification();

    console.log(`Found ${jobs.length} jobs with guessed domains to verify`);

    if (jobs.length === 0) {
      console.log('✅ No guessed domains to verify!');
      return;
    }

    const domainMap = new Map();
    for (const job of jobs) {
      const domainKey = job.companyEmailDomain.toLowerCase().trim();
      if (!domainMap.has(domainKey)) domainMap.set(domainKey, []);
      domainMap.get(domainKey).push(job);
    }

    console.log(`📊 ${jobs.length} jobs → ${domainMap.size} unique domains`);
    console.log(`💰 Saves ${jobs.length - domainMap.size} duplicate checks\n`);
    console.log('=' .repeat(60));

    let stats = { verified: 0, invalid: 0, totalChecks: 0 };
    const BATCH_SIZE = 50;
    let updateBatch = [];
    let processedDomains = 0;

    for (const [domain, jobsForDomain] of domainMap.entries()) {
      processedDomains++;
      stats.totalChecks++;

      console.log(`\n[${processedDomains}/${domainMap.size}] ${domain} (${jobsForDomain.length} jobs)`);

      const result = await verifyDomainFree(domain);

      if (result.valid) {
        const checks = [];
        if (result.hasARecord) checks.push('DNS');
        if (result.hasMxRecords) checks.push('Email');
        if (result.websiteAccessible) checks.push('Website');

        console.log(`  ✅ VALID (${checks.join(', ')}) - Confidence: ${result.confidence}%`);

        for (const job of jobsForDomain) {
          updateBatch.push({ rowIndex: job.rowIndex, newSource: 'verified-free' });
        }
        stats.verified += jobsForDomain.length;
      } else {
        console.log(`  ❌ INVALID - Domain doesn't exist or not accessible`);
        stats.invalid += jobsForDomain.length;
      }

      if (updateBatch.length >= BATCH_SIZE) {
        console.log(`\n📝 Updating column F for ${updateBatch.length} jobs...`);
        await batchUpdateDomainSource(updateBatch);
        updateBatch = [];
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (updateBatch.length > 0) {
      console.log(`\n📝 Updating column F for ${updateBatch.length} jobs...`);
      await batchUpdateDomainSource(updateBatch);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Verification Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   Domains checked: ${domainMap.size}`);
    console.log(`   Verified: ${stats.verified}`);
    console.log(`   Invalid: ${stats.invalid}`);

    const verifiedPct = jobs.length > 0 ? Math.round((stats.verified / jobs.length) * 100) : 0;
    console.log(`   Rate: ${verifiedPct}%`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

freeVerifyDomains();
