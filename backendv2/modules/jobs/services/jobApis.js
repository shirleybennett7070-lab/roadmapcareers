import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sanitize HTML from job descriptions
 */
function sanitizeHTML(html) {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&apos;/g, "'");
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent overly long descriptions
  if (text.length > 2000) {
    text = text.substring(0, 2000) + '...';
  }
  
  return text;
}

// Email domain extraction regex
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g;

// Website URL extraction regex
const WEBSITE_REGEX = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/g;

// Social media patterns
const LINKEDIN_REGEX = /linkedin\.com\/company\/([a-zA-Z0-9-]+)/gi;
const TWITTER_REGEX = /twitter\.com\/([a-zA-Z0-9_]+)/gi;

/**
 * Extract company domain from job description using multiple strategies
 */
function extractCompanyDomain(text, companyName = '', jobUrl = '') {
  if (!text && !companyName && !jobUrl) return null;
  
  const combinedText = `${text || ''} ${companyName || ''} ${jobUrl || ''}`.toLowerCase();
  
  // Strategy 1: Extract email domain
  const emailDomain = extractEmailDomain(text);
  if (emailDomain) return emailDomain;
  
  // Strategy 2: Extract website URL from description
  const websiteDomain = extractWebsiteFromText(combinedText);
  if (websiteDomain) return websiteDomain;
  
  // Strategy 3: Parse job URL for company domain
  const urlDomain = extractDomainFromJobUrl(jobUrl);
  if (urlDomain) return urlDomain;
  
  // Strategy 4: Extract from LinkedIn company page
  const linkedinDomain = extractFromLinkedIn(combinedText);
  if (linkedinDomain) return linkedinDomain;
  
  // Strategy 5: Guess domain from company name
  const guessedDomain = guessDomainFromCompanyName(companyName);
  if (guessedDomain) return guessedDomain;
  
  return null;
}

/**
 * Extract company email domain from job description
 */
function extractEmailDomain(text) {
  if (!text) return null;
  
  const matches = text.match(EMAIL_REGEX);
  if (!matches || matches.length === 0) return null;
  
  // Extract domain from the first email found
  const email = matches[0];
  const domain = email.split('@')[1];
  
  // Filter out common email providers (we want company domains)
  const genericProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'live.com', 'msn.com', 'ymail.com', 'inbox.com'
  ];
  
  if (genericProviders.includes(domain.toLowerCase())) {
    // Try to find another email that isn't generic
    for (const match of matches) {
      const d = match.split('@')[1];
      if (!genericProviders.includes(d.toLowerCase())) {
        return d;
      }
    }
    return null;
  }
  
  return domain;
}

/**
 * Extract website domain from text (looks for "visit us at", "website:", etc.)
 */
function extractWebsiteFromText(text) {
  if (!text) return null;
  
  // Look for common website indicators
  const websiteIndicators = [
    /(?:visit us at|website|site|homepage|web)[:\s]+(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi,
    /(?:apply at|apply online at)[:\s]+(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi,
    /(?:learn more at)[:\s]+(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi
  ];
  
  for (const regex of websiteIndicators) {
    const match = regex.exec(text);
    if (match && match[1]) {
      const domain = cleanDomain(match[1]);
      if (isValidCompanyDomain(domain)) {
        return domain;
      }
    }
  }
  
  // Fallback: Look for any URL that might be a company website
  const urlMatches = text.match(WEBSITE_REGEX);
  if (urlMatches && urlMatches.length > 0) {
    for (const url of urlMatches) {
      const domain = cleanDomain(url.replace(/https?:\/\//, '').replace(/www\./, ''));
      if (isValidCompanyDomain(domain)) {
        return domain;
      }
    }
  }
  
  return null;
}

/**
 * Extract domain from job posting URL
 */
function extractDomainFromJobUrl(url) {
  if (!url) return null;
  
  try {
    // Parse URL to get hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Filter out job boards (we want company domains)
    const jobBoards = [
      'indeed.com', 'linkedin.com', 'glassdoor.com', 'monster.com',
      'ziprecruiter.com', 'simplyhired.com', 'careerbuilder.com',
      'remoteok.com', 'remotive.com', 'weworkremotely.com',
      'adzuna.com', 'jooble.org', 'wellfound.com', 'angel.co',
      'greenhouse.io', 'lever.co', 'workday.com', 'icims.com',
      'jobvite.com', 'smartrecruiters.com', 'breezy.hr'
    ];
    
    if (jobBoards.some(board => hostname.includes(board))) {
      return null;
    }
    
    return hostname;
  } catch (e) {
    return null;
  }
}

/**
 * Extract from LinkedIn company page URL
 */
function extractFromLinkedIn(text) {
  if (!text) return null;
  
  const match = LINKEDIN_REGEX.exec(text);
  if (match && match[1]) {
    // LinkedIn company slug usually matches domain
    const slug = match[1].toLowerCase();
    // Could potentially map this to actual domain, but for now return null
    // since we can't reliably convert LinkedIn slug to company domain
    return null;
  }
  
  return null;
}

/**
 * Guess domain from company name
 */
function guessDomainFromCompanyName(companyName) {
  if (!companyName || companyName.length < 3) return null;
  
  // Clean company name
  let cleanName = companyName.toLowerCase()
    .replace(/\s+/g, '')  // Remove spaces
    .replace(/[^a-z0-9]/g, '')  // Remove special chars
    .replace(/inc|llc|ltd|corp|corporation|company|co\b/g, '');  // Remove suffixes
  
  if (cleanName.length < 3) return null;
  
  // Common domain patterns - mark as "guessed" so we know it's not verified
  const possibleDomains = [
    `${cleanName}.com`,
    `${cleanName}.io`,
    `${cleanName}hq.com`
  ];
  
  // Return first guess with marker that it's guessed
  return `${possibleDomains[0]} (guessed)`;
}

/**
 * Clean and normalize domain
 */
function cleanDomain(domain) {
  if (!domain) return '';
  
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')  // Remove path
    .replace(/:\d+$/, '')  // Remove port
    .trim();
}

/**
 * Check if domain looks like a valid company domain
 */
function isValidCompanyDomain(domain) {
  if (!domain || domain.length < 4) return false;
  
  // Must have at least one dot and valid TLD
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  
  const tld = parts[parts.length - 1];
  const validTLDs = ['com', 'io', 'co', 'net', 'org', 'ai', 'tech', 'app', 'dev'];
  
  if (!validTLDs.includes(tld)) return false;
  
  // Filter out obvious non-company domains
  const invalidPatterns = [
    'example.com', 'test.com', 'localhost',
    'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'google.com', 'apple.com'
  ];
  
  if (invalidPatterns.some(pattern => domain.includes(pattern))) {
    return false;
  }
  
  return true;
}

/**
 * Check if a job is in English and has good description
 */
function isEnglishWithGoodDescription(job) {
  const title = job.title || '';
  const description = job.description || '';
  const company = job.company || '';
  
  // Filter out jobs with OBVIOUS non-English indicators
  const hasGermanFlag = /🇩🇪|🇦🇹|🇨🇭/.test(title + company);
  const hasGermanIndicator = /(m\/w\/d)|(m\/f\/d)/.test(title);
  
  // Filter out titles with obvious German/non-English words
  const obviousNonEnglish = /\b(und|für|mit|der|die|das|als|bei|nach)\b/i.test(title);
  
  if (hasGermanFlag || hasGermanIndicator || obviousNonEnglish) {
    return false;
  }
  
  // Just require that description exists (removed length check for now)
  return true;
}

/**
 * Check if a job is remote (V2: Accept all remote jobs, not just entry-level)
 */
function isRemoteJob(job) {
  const title = (job.title || '').toLowerCase();
  const description = (job.description || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  
  // Must be remote
  const isRemote = location.includes('remote') || 
                   title.includes('remote') || 
                   description.includes('remote') ||
                   description.includes('work from home') ||
                   location.includes('anywhere');
  
  return isRemote;
}

/**
 * Fetch jobs from RemoteOK (free, no API key required)
 */
export async function fetchRemoteOKJobs(limit = 50) {
  try {
    console.log('Fetching jobs from RemoteOK...');
    const response = await axios.get('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)'
      }
    });

    // First item is just metadata, skip it
    const jobs = response.data.slice(1);
    
    // V2: Filter for ALL remote jobs with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.position,
        description: job.description || '',
        location: 'Remote',
        company: job.company
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `remoteok_${job.id}`,
      title: job.position,
      company: job.company,
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Not specified',
      location: 'Remote',
      originalUrl: job.url,
      datePosted: job.date ? new Date(job.date * 1000).toISOString() : new Date().toISOString(), // Fix: Handle invalid dates
      source: 'RemoteOK',
      category: job.tags?.[0] || 'General',
      companyEmailDomain: extractCompanyDomain(job.description, job.company, job.url)
    }));
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Remotive API (free, no API key required)
 * V2: Increased limit for high volume
 */
export async function fetchRemotiveJobs(limit = 200) {
  try {
    console.log('Fetching jobs from Remotive...');
    // Fetch more jobs to filter from
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: {
        limit: 200 // Increased from 100
      },
      timeout: 10000 // Add 10 second timeout
    });

    const jobs = response.data.jobs || [];
    
    // V2: Filter for ALL remote jobs with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        location: 'Remote',
        company: job.company_name
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `remotive_${job.id}`,
      title: job.title,
      company: job.company_name,
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: job.salary || 'Not specified',
      location: 'Remote',
      originalUrl: job.url,
      datePosted: job.publication_date,
      source: 'Remotive',
      category: job.category || 'General',
      companyEmailDomain: extractCompanyDomain(job.description, job.company_name, job.url)
    }));
  } catch (error) {
    console.error('Error fetching from Remotive:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Adzuna (requires API key, 1000 calls/month free)
 * V2: Fetch multiple pages for high volume
 */
export async function fetchAdzunaJobs(country = 'us', limit = 500) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('Skipping Adzuna (no API keys configured)');
    return [];
  }

  try {
    console.log('Fetching REMOTE jobs from Adzuna (targeting high volume)...');
    
    const allJobs = [];
    
    // Fetch multiple pages (50 jobs per page, fetch up to 10 pages = 500 jobs)
    for (let page = 1; page <= 10; page++) {
      try {
        const response = await axios.get(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`,
          {
            params: {
              app_id: appId,
              app_key: appKey,
              results_per_page: 50,
              what: 'remote work from home',
              location0: 'US'
            }
          }
        );

        const jobs = response.data.results || [];
        allJobs.push(...jobs);
        
        console.log(`Adzuna page ${page}: ${jobs.length} jobs`);
        
        if (jobs.length < 50) break; // No more pages
      } catch (err) {
        console.error(`Adzuna page ${page} failed:`, err.message);
        break;
      }
    }
    
    console.log(`Adzuna: Found ${allJobs.length} total jobs`);
    
    // V2: More lenient remote filter
    const filtered = allJobs.filter(job => {
      const title = (job.title || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      const location = (job.location?.display_name || '').toLowerCase();
      
      const hasRemote = title.includes('remote') || 
                       title.includes('work from home') ||
                       description.includes('remote') || 
                       description.includes('work from home') ||
                       location.includes('remote');
      
      return hasRemote && isEnglishWithGoodDescription({
        title: job.title,
        description: job.description,
        company: job.company?.display_name
      });
    }).slice(0, limit);
    
    console.log(`Adzuna: ${filtered.length} passed filters (remote only)`);

    return filtered.map(job => ({
      jobId: `adzuna_${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: job.salary_min ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}` : 'Not specified',
      location: 'Remote',
      originalUrl: job.redirect_url,
      datePosted: job.created,
      source: 'Adzuna',
      category: job.category?.label || 'General',
      companyEmailDomain: extractCompanyDomain(job.description, job.company?.display_name, job.redirect_url)
    }));
  } catch (error) {
    console.error('Error fetching from Adzuna:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Arbeitnow (free, EU-focused remote jobs)
 */
export async function fetchArbeitnowJobs(limit = 20) {
  try {
    console.log('Fetching jobs from Arbeitnow...');
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');

    const jobs = response.data.data || [];
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        category: job.tags?.join(' ') || '',
        company: job.company_name
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `arbeitnow_${job.slug}`,
      title: job.title,
      company: job.company_name,
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: 'Not specified',
      location: job.location || 'Remote',
      originalUrl: job.url,
      datePosted: job.created_at,
      source: 'Arbeitnow',
      category: job.tags?.[0] || 'General'
    }));
  } catch (error) {
    console.error('Error fetching from Arbeitnow:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from JSearch (RapidAPI - free tier available)
 */
export async function fetchJSearchJobs(limit = 20) {
  const apiKey = process.env.JSEARCH_API_KEY;

  if (!apiKey) {
    console.log('Skipping JSearch (no API key configured)');
    return [];
  }

  try {
    console.log('Fetching entry-level non-technical jobs from JSearch...');
    const queries = [
      'customer service representative remote',
      'sales representative remote',
      'virtual assistant remote',
      'content writer remote',
      'social media coordinator remote'
    ];

    const allJobs = [];

    for (const query of queries) {
      try {
        const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
          params: {
            query: query,
            page: '1',
            num_pages: '1',
            date_posted: 'week'
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        });

        const jobs = response.data.data || [];
        
        // Filter for non-technical entry-level jobs in English with good descriptions
        const filtered = jobs.filter(job => {
          const mapped = {
            title: job.job_title,
            description: job.job_description || '',
            category: job.job_employment_type || '',
            company: job.employer_name
          };
          return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
        });

        allJobs.push(...filtered);
      } catch (err) {
        console.error(`Error fetching "${query}":`, err.message);
      }
    }

    // Remove duplicates by job ID and limit
    const unique = Array.from(new Map(allJobs.map(job => [job.job_id, job])).values()).slice(0, limit);

    return unique.map(job => ({
      jobId: `jsearch_${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      description: sanitizeHTML(job.job_description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.job_description)),
      salaryRange: job.job_salary ? `${job.job_salary}` : 'Not specified',
      location: job.job_city ? `${job.job_city}, ${job.job_state}` : 'Remote',
      originalUrl: job.job_apply_link,
      datePosted: job.job_posted_at_datetime_utc,
      source: 'JSearch',
      category: job.job_employment_type || 'General'
    }));
  } catch (error) {
    console.error('Error fetching from JSearch:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from The Muse (free, high-quality job descriptions, US-focused)
 */
export async function fetchTheMuseJobs(limit = 20) {
  try {
    console.log('Fetching jobs from The Muse...');
    
    // Fetch entry-level jobs from non-technical categories
    const response = await axios.get('https://www.themuse.com/api/public/jobs', {
      params: {
        level: 'Entry Level',
        page: 0,
        descending: true,
        api_key: 'public'
      }
    });
    
    const jobs = response.data.results || [];
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.name,
        description: job.contents || '',
        category: job.categories?.[0]?.name || '',
        company: job.company?.name || ''
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);
    
    return filtered.map(job => ({
      jobId: `themuse_${job.id}`,
      title: job.name,
      company: job.company?.name || 'Unknown',
      description: sanitizeHTML(job.contents) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.contents)),
      salaryRange: 'Not specified',
      location: job.locations?.[0]?.name || 'Remote',
      originalUrl: job.refs?.landing_page || '',
      datePosted: job.publication_date,
      source: 'The Muse',
      category: job.categories?.[0]?.name || 'General'
    }));
  } catch (error) {
    console.error('Error fetching from The Muse:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from LinkedIn Jobs RSS (simple scraping)
 */
export async function fetchLinkedInRSSJobs(limit = 20) {
  try {
    console.log('Fetching jobs from LinkedIn RSS...');
    
    // LinkedIn has public RSS feeds for job searches
    const keywords = ['customer+service+remote', 'admin+assistant+remote', 'sales+representative+remote'];
    const allJobs = [];
    
    for (const keyword of keywords) {
      try {
        const response = await axios.get(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword}&location=United+States&f_E=1`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 5000
        });
        
        // Parse HTML for job listings (simple extraction)
        const jobMatches = response.data.match(/data-job-id="(\d+)"/g) || [];
        
        jobMatches.slice(0, 5).forEach(match => {
          const jobId = match.match(/data-job-id="(\d+)"/)?.[1];
          if (jobId) {
            allJobs.push({
              jobId: `linkedin_${jobId}`,
              title: `Job #${jobId}`, // Would need more parsing for full details
              company: 'See LinkedIn',
              description: 'View full posting on LinkedIn for details',
              requirements: 'See full posting',
              salaryRange: 'Not specified',
              location: 'Remote',
              originalUrl: `https://www.linkedin.com/jobs/view/${jobId}`,
              datePosted: new Date().toISOString(),
              source: 'LinkedIn',
              category: 'Entry Level'
            });
          }
        });
      } catch (err) {
        // LinkedIn might block, silently continue
      }
    }
    
    return allJobs.slice(0, limit);
  } catch (error) {
    console.error('Error fetching from LinkedIn:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from SimplyHired RSS
 */
export async function fetchSimplyHiredJobs(limit = 20) {
  try {
    console.log('Fetching jobs from SimplyHired...');
    
    const response = await axios.get('https://www.simplyhired.com/search', {
      params: {
        q: 'customer service entry level',
        l: 'Remote',
        job: 'entry_level'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 5000
    });
    
    // Parse response for jobs
    const titleMatches = response.data.match(/data-title="([^"]+)"/g) || [];
    const jobs = [];
    
    titleMatches.slice(0, limit).forEach((match, i) => {
      const title = match.match(/data-title="([^"]+)"/)?.[1];
      if (title) {
        jobs.push({
          jobId: `simplyhired_${Date.now()}_${i}`,
          title: title,
          company: 'See posting',
          description: 'View full posting for details',
          requirements: 'See full posting',
          salaryRange: 'Not specified',
          location: 'Remote',
          originalUrl: `https://www.simplyhired.com/`,
          datePosted: new Date().toISOString(),
          source: 'SimplyHired',
          category: 'Entry Level'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error fetching from SimplyHired:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Jooble (free, 500 requests/day)
 * V2: Fetch MANY more jobs with pagination
 */
export async function fetchJoobleJobs(limit = 500) {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    console.log('Skipping Jooble (no API key configured)');
    return [];
  }

  try {
    console.log('Fetching remote jobs from Jooble (targeting high volume)...');
    
    // V2: Broader search queries for all remote jobs
    const searches = [
      'remote',
      'work from home',
      'remote jobs',
      'telecommute',
      'remote position',
      'virtual',
      'anywhere',
      'distributed team'
    ];
    
    const allJobs = [];
    
    for (const keywords of searches) {
      try {
        // Fetch MANY pages for each search (up to 10 pages = 100 jobs per search)
        for (let page = 1; page <= 10; page++) {
          const response = await axios.post(
            `https://jooble.org/api/${apiKey}`,
            {
              keywords: keywords,
              location: 'USA',
              radius: '100',
              page: page.toString()
            }
          );

          const jobs = response.data.jobs || [];
          allJobs.push(...jobs);
          
          console.log(`Jooble "${keywords}" page ${page}: ${jobs.length} jobs`);
          
          // If we got less than expected, no point fetching next page
          if (jobs.length < 10) break;
        }
      } catch (err) {
        console.error(`Jooble search "${keywords}" failed:`, err.message);
      }
    }
    
    console.log(`Jooble: Fetched ${allJobs.length} total jobs before filtering`);
    
    // V2: Filter for ALL remote jobs with good descriptions
    const filtered = allJobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.snippet || '',
        location: job.location || '',
        company: job.company
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    });
    
    console.log(`Jooble: ${filtered.length} jobs passed filters`);
    
    // Remove duplicates by link
    const unique = Array.from(new Map(filtered.map(job => [job.link, job])).values()).slice(0, limit);

    console.log(`Jooble: Returning ${unique.length} unique jobs`);

    return unique.map(job => ({
      jobId: `jooble_${Buffer.from(job.link).toString('base64').substring(0, 20)}`,
      title: job.title,
      company: job.company || 'See posting',
      description: sanitizeHTML(job.snippet) || 'View full posting for details',
      requirements: 'See full posting',
      salaryRange: job.salary || 'Not specified',
      location: job.location || 'Remote',
      originalUrl: job.link,
      datePosted: job.updated || new Date().toISOString(),
      source: 'Jooble',
      category: 'Remote',
      companyEmailDomain: extractEmailDomain(job.snippet)
    }));
  } catch (error) {
    console.error('Error fetching from Jooble:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Findwork.dev (free, no API key required)
 */
export async function fetchFindworkJobs(limit = 20) {
  try {
    console.log('Fetching jobs from Findwork.dev...');
    
    const response = await axios.get('https://findwork.dev/api/jobs/', {
      params: {
        search: 'customer service OR sales OR administrative',
        location: 'remote',
        sort_by: 'date'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const jobs = response.data.results || [];
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.role,
        description: job.text || '',
        category: job.employment_type || '',
        company: job.company_name
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `findwork_${job.id}`,
      title: job.role,
      company: job.company_name || 'Unknown',
      description: sanitizeHTML(job.text) || 'No description available',
      requirements: 'See full posting',
      salaryRange: 'Not specified',
      location: job.location || 'Remote',
      originalUrl: job.url,
      datePosted: job.date_posted,
      source: 'Findwork',
      category: job.employment_type || 'Entry Level'
    }));
  } catch (error) {
    console.error('Error fetching from Findwork:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from WellFound (formerly AngelList Talent) - startup jobs
 */
export async function fetchWellFoundJobs(limit = 50) {
  try {
    console.log('Fetching jobs from WellFound...');
    
    // WellFound has a GraphQL API but also a simpler jobs feed
    const response = await axios.get('https://wellfound.com/api/jobs', {
      params: {
        remote: true,
        per_page: 50
      },
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const jobs = response.data.jobs || response.data || [];
    
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title || job.name,
        description: job.description || '',
        location: job.location || '',
        company: job.company?.name || job.startup?.name || ''
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `wellfound_${job.id}`,
      title: job.title || job.name,
      company: job.company?.name || job.startup?.name || 'Startup',
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: job.salary_range || 'Not specified',
      location: 'Remote',
      originalUrl: job.url || `https://wellfound.com/jobs/${job.id}`,
      datePosted: job.created_at || new Date().toISOString(),
      source: 'WellFound',
      category: job.role_type || 'Startup',
      companyEmailDomain: extractEmailDomain(job.description)
    }));
  } catch (error) {
    console.error('Error fetching from WellFound:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from WeWorkRemotely (curated remote jobs)
 */
export async function fetchWeWorkRemotelyJobs(limit = 50) {
  try {
    console.log('Fetching jobs from WeWorkRemotely...');
    
    const response = await axios.get('https://weworkremotely.com/remote-jobs.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const jobs = [];
    const categories = response.data || [];
    
    // WWR groups jobs by category
    categories.forEach(category => {
      if (category.jobs) {
        jobs.push(...category.jobs);
      }
    });
    
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        location: 'Remote',
        company: job.company
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `weworkremotely_${job.id}`,
      title: job.title,
      company: job.company,
      description: sanitizeHTML(job.description) || 'No description available',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: 'Not specified',
      location: 'Remote',
      originalUrl: job.url || `https://weworkremotely.com${job.path}`,
      datePosted: job.published_at || new Date().toISOString(),
      source: 'WeWorkRemotely',
      category: job.category || 'Remote',
      companyEmailDomain: extractEmailDomain(job.description)
    }));
  } catch (error) {
    console.error('Error fetching from WeWorkRemotely:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Remote.co
 */
export async function fetchRemoteCoJobs(limit = 50) {
  try {
    console.log('Fetching jobs from Remote.co...');
    
    const response = await axios.get('https://remote.co/api/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const jobs = response.data || [];
    
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title || job.position,
        description: job.description || '',
        location: 'Remote',
        company: job.company_name || job.company
      };
      return isRemoteJob(mapped) && isEnglishWithGoodDescription(mapped);
    }).slice(0, limit);

    return filtered.map(job => ({
      jobId: `remoteco_${job.id || Buffer.from(job.url).toString('base64').substring(0, 20)}`,
      title: job.title || job.position,
      company: job.company_name || job.company || 'See posting',
      description: sanitizeHTML(job.description) || 'View full posting for details',
      requirements: sanitizeHTML(extractRequirements(job.description)),
      salaryRange: job.salary || 'Not specified',
      location: 'Remote',
      originalUrl: job.url,
      datePosted: job.date_posted || new Date().toISOString(),
      source: 'Remote.co',
      category: job.category || 'Remote',
      companyEmailDomain: extractEmailDomain(job.description)
    }));
  } catch (error) {
    console.error('Error fetching from Remote.co:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Careerjet (free with attribution)
 */
export async function fetchCareerjetJobs(limit = 20) {
  const apiKey = process.env.CAREERJET_API_KEY;

  if (!apiKey) {
    console.log('Skipping Careerjet (no API key configured)');
    return [];
  }

  try {
    console.log('Fetching entry-level non-technical jobs from Careerjet...');
    
    const searches = [
      'customer service representative',
      'sales representative entry level',
      'administrative assistant',
      'virtual assistant',
      'data entry'
    ];
    
    const allJobs = [];
    
    for (const keywords of searches) {
      try {
        const response = await axios.get('http://public.api.careerjet.net/search', {
          params: {
            affid: apiKey,
            locale_code: 'en_US',
            keywords: keywords,
            location: 'United States',
            contracttype: 'p', // permanent
            page: 1,
            pagesize: 20
          }
        });

        const jobs = response.data.jobs || [];
        allJobs.push(...jobs);
      } catch (err) {
        console.error(`Careerjet search "${keywords}" failed:`, err.message);
      }
    }
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = allJobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        category: '',
        company: job.company
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
    });
    
    // Remove duplicates by URL
    const unique = Array.from(new Map(filtered.map(job => [job.url, job])).values()).slice(0, limit);

    return unique.map(job => ({
      jobId: `careerjet_${Buffer.from(job.url).toString('base64').substring(0, 20)}`,
      title: job.title,
      company: job.company || 'See posting',
      description: sanitizeHTML(job.description) || 'View full posting for details',
      requirements: 'See full posting',
      salaryRange: job.salary || 'Not specified',
      location: job.locations || 'USA',
      originalUrl: job.url,
      datePosted: job.date || new Date().toISOString(),
      source: 'Careerjet',
      category: 'Entry Level'
    }));
  } catch (error) {
    console.error('Error fetching from Careerjet:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from all available sources (V2: HIGH VOLUME - targeting 5000+ jobs)
 * NOTE: WellFound, WeWorkRemotely, Remote.co disabled due to API issues
 */
export async function fetchAllJobs(limitPerSource = 500) {
  console.log(`\nV2: HIGH VOLUME MODE - Fetching up to ${limitPerSource} remote jobs from each source...\n`);
  
  const [
    remoteOKJobs,  // Fixed: date handling
    remotiveJobs,  // Increased limit
    adzunaJobs,    // Multi-page fetch
    joobleJobs     // Multi-page fetch with multiple searches
  ] = await Promise.all([
    fetchRemoteOKJobs(limitPerSource),
    fetchRemotiveJobs(Math.min(limitPerSource, 200)), // Remotive API limit
    fetchAdzunaJobs('us', limitPerSource),
    fetchJoobleJobs(limitPerSource)
  ]);

  const allJobs = [
    ...remoteOKJobs, 
    ...remotiveJobs, 
    ...adzunaJobs, 
    ...joobleJobs
  ];
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`V2: Total remote jobs fetched: ${allJobs.length}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`- RemoteOK: ${remoteOKJobs.length}`);
  console.log(`- Remotive: ${remotiveJobs.length}`);
  console.log(`- Adzuna: ${adzunaJobs.length}`);
  console.log(`- Jooble: ${joobleJobs.length}`);
  
  const jobsWithEmail = allJobs.filter(j => j.companyEmailDomain).length;
  console.log(`\n📧 Jobs with company email domain: ${jobsWithEmail} (${allJobs.length > 0 ? Math.round(jobsWithEmail/allJobs.length*100) : 0}%)`);
  console.log(`🎯 Target was 5,000+ jobs, got ${allJobs.length} jobs\n`);
  
  return allJobs;
}

/**
 * Helper function to extract requirements from description
 */
function extractRequirements(description) {
  if (!description) return 'Not specified';
  
  // Try to find requirements section
  const requirementsMatch = description.match(/requirements?:?(.{0,500})/i);
  if (requirementsMatch) {
    return requirementsMatch[1].substring(0, 200).trim() + '...';
  }
  
  return 'See full description';
}
