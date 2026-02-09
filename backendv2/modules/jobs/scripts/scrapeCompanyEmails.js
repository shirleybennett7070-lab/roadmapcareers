import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';
import axios from 'axios';
import net from 'net';
import dns from 'dns';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const resolveMx = promisify(dns.resolveMx);

/**
 * Step 5: Scrape HR Emails
 *
 * READS:  D (company), E (guessed domain), F (source), G (scraped domain)
 * WRITES: H (HR Email 1), I (HR Email 2), J (HR Email 3)
 *
 * Methods:
 *   1. Sitemap crawling — finds real contact/career pages
 *   2. Website scraping — extracts emails from HTML
 *   3. Schema.org / JSON-LD — extracts structured contact data
 *   4. SMTP pattern verification — tests common HR email patterns
 */

// ─── Constants ───────────────────────────────────────────────────────

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;

const FALLBACK_PAGES = [
  '', '/contact', '/contact-us', '/about', '/about-us',
  '/careers', '/jobs', '/team', '/hiring', '/work-with-us', '/join-us'
];

const SITEMAP_KEYWORDS = [
  'contact', 'about', 'career', 'jobs', 'hiring', 'team',
  'join', 'employment', 'people', 'apply', 'work-with', 'recruit'
];

const HR_EMAIL_PATTERNS = [
  'hr', 'jobs', 'careers', 'career', 'hiring', 'recruiting',
  'recruitment', 'talent', 'apply', 'work', 'join',
  'info', 'contact', 'hello', 'team', 'people', 'employment'
];

const GENERIC_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  'live.com', 'msn.com', 'ymail.com', 'inbox.com',
  'example.com', 'test.com', 'domain.com',
  'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
  'youtube.com', 'google.com', 'apple.com', 'microsoft.com'
];

const SPAM_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'test', 'example', 'spam', 'admin', 'postmaster', 'mailer-daemon', 'bounce'];

const HR_KEYWORDS = ['jobs', 'careers', 'hr', 'recruiting', 'talent', 'hiring', 'recruitment', 'apply', 'work', 'join', 'contact', 'info', 'hello'];

// ─── HTTP helpers ────────────────────────────────────────────────────

async function fetchPage(url, timeout = 5000) {
  try {
    const response = await axios.get(url, {
      timeout,
      maxRedirects: 5,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobScraperBot/1.0)' },
      validateStatus: (status) => status < 400,
      maxContentLength: 2 * 1024 * 1024  // 2MB max
    });
    if (response.status === 200 && response.data) return String(response.data);
  } catch (error) {}
  return null;
}

async function fetchWithProtocol(domain, path = '') {
  const html = await fetchPage(`https://${domain}${path}`, 5000);
  if (html) return html;
  return await fetchPage(`http://${domain}${path}`, 5000);
}

// ─── Method 1: Sitemap crawling ─────────────────────────────────────

async function getContactPagesFromSitemap(domain) {
  const pages = new Set();

  for (const sitemapPath of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap.txt']) {
    const content = await fetchWithProtocol(domain, sitemapPath);
    if (!content) continue;

    // Extract URLs from XML sitemap
    const urlMatches = [...content.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)];
    const urls = urlMatches.map(m => m[1].trim());

    // Also handle plain text sitemaps (one URL per line)
    if (urls.length === 0 && sitemapPath.endsWith('.txt')) {
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('http')) urls.push(trimmed);
      });
    }

    for (const url of urls) {
      const lower = url.toLowerCase();
      if (SITEMAP_KEYWORDS.some(kw => lower.includes(kw))) {
        try {
          const parsed = new URL(url);
          pages.add(parsed.pathname);
        } catch (e) {}
      }
    }

    if (pages.size > 0) break;  // Found a working sitemap
  }

  return Array.from(pages).slice(0, 10);  // Cap at 10 pages
}

// ─── Method 2: Email extraction from HTML ────────────────────────────

function extractEmailsFromHtml(html, companyDomain) {
  if (!html) return [];
  const emails = [...html.matchAll(EMAIL_REGEX)].map(m => m[0].toLowerCase());
  const uniqueEmails = [...new Set(emails)];

  return uniqueEmails.filter(email => {
    const emailDomain = email.split('@')[1];
    if (!emailDomain || !emailDomain.includes(companyDomain)) return false;
    if (GENERIC_EMAIL_DOMAINS.includes(emailDomain)) return false;
    const localPart = email.split('@')[0];
    if (SPAM_PREFIXES.some(k => localPart.includes(k))) return false;
    return true;
  });
}

// ─── Method 3: Schema.org / JSON-LD extraction ──────────────────────

function extractEmailsFromJsonLd(html) {
  if (!html) return [];
  const emails = [];

  // Find all JSON-LD blocks
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block[1]);
      extractEmailsFromObject(data, emails);
    } catch (e) {}
  }

  // Also check meta tags
  const metaEmails = [...html.matchAll(/content\s*=\s*["']([^"']*@[^"']+)["']/gi)];
  for (const match of metaEmails) {
    const email = match[1].toLowerCase().trim();
    if (email.match(EMAIL_REGEX)) emails.push(email);
  }

  // Check mailto: links
  const mailtoMatches = [...html.matchAll(/mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi)];
  for (const match of mailtoMatches) {
    emails.push(match[1].toLowerCase());
  }

  return [...new Set(emails)];
}

function extractEmailsFromObject(obj, emails) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(item => extractEmailsFromObject(item, emails));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.match(EMAIL_REGEX)) {
      const cleaned = value.replace('mailto:', '').toLowerCase().trim();
      if (cleaned.match(EMAIL_REGEX)) emails.push(cleaned);
    } else if (typeof value === 'object') {
      extractEmailsFromObject(value, emails);
    }
  }
}

// ─── Method 4: SMTP pattern verification ─────────────────────────────

async function getMxHost(domain) {
  try {
    const records = await resolveMx(domain);
    if (records && records.length > 0) {
      records.sort((a, b) => a.priority - b.priority);
      return records[0].exchange;
    }
  } catch (e) {}
  return null;
}

function smtpCheck(mxHost, email, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let step = 0;
    let resolved = false;

    const done = (result) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeout);
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));

    socket.on('data', (data) => {
      const response = data.toString();
      const code = parseInt(response.substring(0, 3));

      if (step === 0 && code === 220) {
        // Server greeting → send EHLO
        step = 1;
        socket.write('EHLO verify.local\r\n');
      } else if (step === 1 && code === 250) {
        // EHLO accepted → send MAIL FROM
        step = 2;
        socket.write('MAIL FROM:<verify@verify.local>\r\n');
      } else if (step === 2 && code === 250) {
        // MAIL FROM accepted → send RCPT TO
        step = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
      } else if (step === 3) {
        // RCPT TO response: 250 = exists, 550/etc = doesn't exist
        socket.write('QUIT\r\n');
        done(code === 250 || code === 251);
      } else {
        done(false);
      }
    });

    socket.connect(25, mxHost, () => {});
  });
}

async function verifyEmailPatterns(domain) {
  const mxHost = await getMxHost(domain);
  if (!mxHost) return [];

  console.log(`    📡 SMTP: checking patterns via ${mxHost}...`);
  const verified = [];

  for (const prefix of HR_EMAIL_PATTERNS) {
    const email = `${prefix}@${domain}`;
    try {
      const exists = await smtpCheck(mxHost, email, 5000);
      if (exists) {
        console.log(`    ✓ SMTP verified: ${email}`);
        verified.push(email);
        if (verified.length >= 5) break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  return verified;
}

// ─── Main scraping logic ─────────────────────────────────────────────

async function scrapeCompanyWebsite(domain) {
  console.log(`  🔍 Scraping ${domain}...`);
  const allEmails = new Set();

  // Step A: Get pages from sitemap
  const sitemapPages = await getContactPagesFromSitemap(domain);
  if (sitemapPages.length > 0) {
    console.log(`    📄 Sitemap: found ${sitemapPages.length} relevant pages`);
  }

  // Combine sitemap pages with fallback pages (deduped)
  const allPages = [...new Set([...sitemapPages, ...FALLBACK_PAGES])];

  // Step B: Scrape pages — extract from HTML + JSON-LD + mailto
  let pagesScraped = 0;
  for (const page of allPages) {
    if (allEmails.size >= 5) break;

    const html = await fetchWithProtocol(domain, page);
    if (html) {
      pagesScraped++;

      // Regular email extraction
      const htmlEmails = extractEmailsFromHtml(html, domain);
      htmlEmails.forEach(e => allEmails.add(e));

      // JSON-LD / schema.org extraction
      const jsonLdEmails = extractEmailsFromJsonLd(html);
      const filteredJsonLd = jsonLdEmails.filter(e => {
        const d = e.split('@')[1];
        return d && d.includes(domain) && !GENERIC_EMAIL_DOMAINS.includes(d);
      });
      filteredJsonLd.forEach(e => allEmails.add(e));

      if (htmlEmails.length > 0 || filteredJsonLd.length > 0) {
        const total = htmlEmails.length + filteredJsonLd.length;
        console.log(`    ✓ ${page || 'homepage'}: ${total} emails`);
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`    📊 Scraped ${pagesScraped} pages, found ${allEmails.size} emails so far`);

  // Step C: SMTP pattern verification (if we found fewer than 3 emails)
  if (allEmails.size < 3) {
    const smtpEmails = await verifyEmailPatterns(domain);
    smtpEmails.forEach(e => allEmails.add(e));
  }

  // Sort: HR-related emails first
  const sorted = Array.from(allEmails).sort((a, b) => {
    const aHR = HR_KEYWORDS.some(k => a.split('@')[0].includes(k));
    const bHR = HR_KEYWORDS.some(k => b.split('@')[0].includes(k));
    if (aHR && !bHR) return -1;
    if (!aHR && bHR) return 1;
    return 0;
  });

  return sorted.slice(0, 5);
}

// ─── Sheet I/O ───────────────────────────────────────────────────────

async function getJobsNeedingEmails() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!D2:H`  // D through H only
  });
  if (!response.data.values) return [];

  return response.data.values
    .map((row, index) => ({
      rowIndex: index + 2,
      company: row[0],            // D
      guessedDomain: row[1],      // E
      domainSource: row[2],       // F
      scrapedDomain: row[3],      // G
      hrEmail1: row[4]            // H
    }))
    .filter(job => {
      // Must have a usable domain: scraped (G) or verified/found guessed (E)
      const hasDomain = (job.scrapedDomain && job.scrapedDomain !== '') ||
                        (job.guessedDomain && job.guessedDomain !== '' &&
                         (job.domainSource === 'verified-free' || job.domainSource === 'found-search'));
      if (!hasDomain) return false;
      // Skip if already has HR emails
      return !job.hrEmail1 || job.hrEmail1 === '' || job.hrEmail1 === 'N/A';
    });
}

async function batchUpdateEmails(updates) {
  if (updates.length === 0) return;
  const sheets = await getSheetsClient();
  const data = updates.map(u => ({
    range: `${SHEET_NAME}!H${u.rowIndex}:J${u.rowIndex}`,  // H=Email1, I=Email2, J=Email3
    values: [[u.emails[0] || '', u.emails[1] || '', u.emails[2] || '']]
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: { valueInputOption: 'RAW', data }
  });
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('📧 Step 5: Scrape HR Emails\n');
  console.log('=' .repeat(60));
  console.log('READS:  D (company), E (domain), F (source), G (scraped domain)');
  console.log('WRITES: H (Email 1), I (Email 2), J (Email 3)');
  console.log('');
  console.log('Methods:');
  console.log('  1. Sitemap crawling — discover real contact/career pages');
  console.log('  2. Website scraping — extract emails from HTML');
  console.log('  3. Schema.org / JSON-LD — extract structured contact data');
  console.log('  4. SMTP pattern check — verify hr@, jobs@, careers@, etc.');
  console.log('=' .repeat(60));

  try {
    console.log('\n📊 Loading jobs needing HR emails...\n');
    const jobs = await getJobsNeedingEmails();
    console.log(`Found ${jobs.length} jobs needing emails`);

    if (jobs.length === 0) {
      console.log('✅ All jobs already have HR emails!');
      return;
    }

    // Group by domain
    const domainMap = new Map();
    for (const job of jobs) {
      const domain = (job.scrapedDomain || job.guessedDomain).toLowerCase().trim();
      if (!domainMap.has(domain)) domainMap.set(domain, []);
      domainMap.get(domain).push(job);
    }

    console.log(`📊 ${jobs.length} jobs → ${domainMap.size} unique domains\n`);
    console.log('=' .repeat(60));

    let stats = { withEmails: 0, withoutEmails: 0, totalEmails: 0, processed: 0 };
    let updateBatch = [];

    for (const [domain, jobsForDomain] of domainMap.entries()) {
      stats.processed++;
      console.log(`\n[${stats.processed}/${domainMap.size}] ${jobsForDomain[0].company} (${domain})`);

      const emails = await scrapeCompanyWebsite(domain);

      if (emails.length > 0) {
        console.log(`  ✅ Found ${emails.length} emails:`);
        emails.forEach(e => console.log(`     • ${e}`));
        for (const job of jobsForDomain) {
          updateBatch.push({ rowIndex: job.rowIndex, emails });
        }
        stats.withEmails += jobsForDomain.length;
        stats.totalEmails += emails.length;

        if (updateBatch.length >= 50) {
          await batchUpdateEmails(updateBatch);
          updateBatch = [];
        }
      } else {
        console.log(`  ✗ No emails found`);
        stats.withoutEmails += jobsForDomain.length;
      }

      await new Promise(r => setTimeout(r, 3000));
    }

    if (updateBatch.length > 0) await batchUpdateEmails(updateBatch);

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Email Scraping Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   Domains scraped: ${stats.processed}`);
    console.log(`   Jobs with emails: ${stats.withEmails}`);
    console.log(`   Jobs without: ${stats.withoutEmails}`);
    console.log(`   Total emails found: ${stats.totalEmails}`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
