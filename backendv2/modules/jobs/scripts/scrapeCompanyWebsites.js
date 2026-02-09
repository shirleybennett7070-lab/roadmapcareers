import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

/**
 * Step 4: Scrape Company Websites
 * 
 * READS:  D (company), E (guessed domain), F (domain source)
 * WRITES: F (source = "found-search"), G (scraped domain)
 * 
 * For jobs where the guessed domain failed verification,
 * searches DuckDuckGo to find the real company website.
 * Keeps original guess in E, puts found domain in G.
 */

const DOMAIN_REGEX = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/g;

const BLOCKED_DOMAINS = [
  'indeed.com', 'linkedin.com', 'glassdoor.com', 'monster.com',
  'ziprecruiter.com', 'careerbuilder.com', 'simplyhired.com',
  'remoteok.com', 'remotive.com', 'weworkremotely.com',
  'adzuna.com', 'jooble.org', 'angel.co', 'wellfound.com',
  'dice.com', 'flexjobs.com', 'remoteco.com',
  'facebook.com', 'twitter.com', 'instagram.com',
  'youtube.com', 'google.com', 'bing.com', 'yahoo.com',
  'w3.org', 'wikipedia.org', 'schema.org', 'duckduckgo.com',
  'github.com', 'stackoverflow.com', 'reddit.com',
  'medium.com', 'wordpress.com', 'blogspot.com',
  'cloudflare.com', 'amazonaws.com', 'googleusercontent.com',
  'gstatic.com', 'googleapis.com'
];

async function searchDuckDuckGo(companyName) {
  try {
    const query = encodeURIComponent(`${companyName} official website company`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

function extractDomains(html, companyName) {
  if (!html) return [];

  const domains = [...html.matchAll(DOMAIN_REGEX)]
    .map(match => match[1].toLowerCase())
    .filter(domain => {
      if (BLOCKED_DOMAINS.some(b => domain.includes(b))) return false;
      const parts = domain.split('.');
      if (parts.length < 2 || parts[0].length < 2) return false;
      return true;
    });

  const uniqueDomains = [...new Set(domains)];
  const keywords = companyName.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  uniqueDomains.sort((a, b) => {
    const aScore = keywords.filter(k => a.includes(k)).length;
    const bScore = keywords.filter(k => b.includes(k)).length;
    return bScore - aScore;
  });

  return uniqueDomains;
}

async function verifyDomainExists(domain) {
  try {
    const r = await axios.get(`https://${domain}`, { timeout: 5000, maxRedirects: 5, validateStatus: s => s < 500 });
    return r.status < 400;
  } catch (e) {
    try {
      const r = await axios.get(`http://${domain}`, { timeout: 5000, maxRedirects: 5, validateStatus: s => s < 500 });
      return r.status < 400;
    } catch (e2) {
      return false;
    }
  }
}

async function findRealDomain(companyName) {
  console.log(`  🔍 Searching for "${companyName}"...`);

  const html = await searchDuckDuckGo(companyName);
  if (!html) { console.log(`    ✗ Search failed`); return null; }

  const domains = extractDomains(html, companyName);
  if (domains.length === 0) { console.log(`    ✗ No domains found`); return null; }

  console.log(`    Found ${domains.length} potential domains`);

  for (const domain of domains.slice(0, 5)) {
    console.log(`    Testing: ${domain}...`);
    if (await verifyDomainExists(domain)) {
      console.log(`    ✅ Valid: ${domain}`);
      return domain;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`    ✗ No valid domains found`);
  return null;
}

/**
 * Get jobs that need a real domain search
 * Only jobs where guessed domain was NOT verified (still "guessed" in column F)
 */
async function getJobsNeedingSearch() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:G`  // A-G to check if G already has a scraped domain
  });

  if (!response.data.values) return [];

  return response.data.values
    .map((row, index) => ({
      rowIndex: index + 2,
      company: row[3],              // D
      companyEmailDomain: row[4],   // E
      domainSource: row[5],         // F
      scrapedDomain: row[6]         // G
    }))
    .filter(job =>
      job.company &&
      job.company !== 'N/A' &&
      job.company.trim().length > 0 &&
      // Skip if already has a scraped domain in G
      (!job.scrapedDomain || job.scrapedDomain === '')
    );
}

/**
 * Write found domain to F:G
 * F = "found-search", G = the scraped domain
 * Does NOT touch E (keeps original guess)
 */
async function batchUpdateFoundDomains(updates) {
  if (updates.length === 0) return;
  const sheets = await getSheetsClient();

  const data = updates.map(u => ({
    range: `${SHEET_NAME}!F${u.rowIndex}:G${u.rowIndex}`,  // F=Source, G=Scraped Domain
    values: [['found-search', u.domain]]
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: { valueInputOption: 'RAW', data }
  });
}

async function scrapeCompanyWebsites() {
  console.log('🌐 Step 4: Scrape Company Websites\n');
  console.log('=' .repeat(60));
  console.log('READS:  Column D (company), E (guess), F (source)');
  console.log('WRITES: Column F ("found-search"), Column G (scraped domain)');
  console.log('DOES NOT TOUCH: Column E (keeps original guess)');
  console.log('Searches for ALL companies regardless of domain status');
  console.log('=' .repeat(60));

  try {
    console.log('\n📊 Loading jobs with unverified guessed domains...\n');
    const jobs = await getJobsNeedingSearch();

    console.log(`Found ${jobs.length} jobs needing real domain search`);

    if (jobs.length === 0) {
      console.log('✅ No jobs need domain searching!');
      return;
    }

    const companyMap = new Map();
    for (const job of jobs) {
      const key = job.company.toLowerCase().trim();
      if (!companyMap.has(key)) companyMap.set(key, []);
      companyMap.get(key).push(job);
    }

    console.log(`📊 ${jobs.length} jobs → ${companyMap.size} unique companies\n`);
    console.log('=' .repeat(60));

    let stats = { found: 0, notFound: 0, processed: 0 };
    let updateBatch = [];

    for (const [key, jobsForCompany] of companyMap.entries()) {
      stats.processed++;
      console.log(`\n[${stats.processed}/${companyMap.size}] ${jobsForCompany[0].company}`);
      console.log(`  Current guess: ${jobsForCompany[0].companyEmailDomain}`);

      const realDomain = await findRealDomain(jobsForCompany[0].company);

      if (realDomain) {
        for (const job of jobsForCompany) {
          updateBatch.push({ rowIndex: job.rowIndex, domain: realDomain });
        }
        stats.found += jobsForCompany.length;

        if (updateBatch.length >= 50) {
          console.log(`\n📝 Updating batch of ${updateBatch.length}...`);
          await batchUpdateFoundDomains(updateBatch);
          updateBatch = [];
        }
      } else {
        stats.notFound += jobsForCompany.length;
      }

      await new Promise(r => setTimeout(r, 10000));
    }

    if (updateBatch.length > 0) {
      console.log(`\n📝 Updating final batch of ${updateBatch.length}...`);
      await batchUpdateFoundDomains(updateBatch);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Domain Search Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   Companies searched: ${stats.processed}`);
    console.log(`   Real domains found: ${stats.found}`);
    console.log(`   Not found: ${stats.notFound}`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

scrapeCompanyWebsites();
