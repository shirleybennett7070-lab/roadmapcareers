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

// Technical keywords to EXCLUDE
const TECHNICAL_KEYWORDS = [
  'developer', 'engineer', 'programmer', 'software', 'coding', 'python', 'java',
  'javascript', 'react', 'node', 'backend', 'frontend', 'fullstack', 'devops',
  'architect', 'data scientist', 'machine learning', 'ai engineer', 'cloud',
  'aws', 'kubernetes', 'sql', 'database', 'system admin', 'network', 'security',
  'blockchain', 'mobile dev', 'ios', 'android', 'qa engineer', 'test automation'
];

// Entry-level keywords to INCLUDE
const ENTRY_LEVEL_KEYWORDS = [
  'entry', 'junior', 'associate', 'assistant', 'coordinator', 'representative',
  'support', 'admin', 'customer service', 'sales', 'marketing', 'social media',
  'content writer', 'data entry', 'virtual assistant', 'recruiter', 'hr',
  'account manager', 'project coordinator', 'operations', 'executive assistant',
  'bookkeeper', 'transcription', 'moderator', 'community manager', 'specialist',
  'analyst', 'copywriter', 'editor', 'researcher', 'scheduler', 'receptionist'
];

// Non-technical job categories
const NON_TECHNICAL_CATEGORIES = [
  'customer support', 'sales', 'marketing', 'writing', 'design', 'admin',
  'human resources', 'finance', 'business', 'operations', 'legal', 'teaching',
  'copywriting', 'content', 'management', 'consulting', 'project management',
  'accounting', 'communication', 'recruitment'
];

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
 * Check if a job is non-technical and entry-level
 */
function isNonTechnicalEntryLevel(job) {
  const title = (job.title || '').toLowerCase();
  const description = (job.description || '').toLowerCase();
  const category = (job.category || '').toLowerCase();
  const combined = `${title} ${description} ${category}`;
  
  // Exclude technical jobs
  const isTechnical = TECHNICAL_KEYWORDS.some(keyword => 
    title.includes(keyword) || combined.includes(keyword)
  );
  
  if (isTechnical) return false;
  
  // Include entry-level positions
  const isEntryLevel = ENTRY_LEVEL_KEYWORDS.some(keyword => 
    combined.includes(keyword)
  );
  
  // Or jobs in non-technical categories
  const isNonTechCategory = NON_TECHNICAL_CATEGORIES.some(cat =>
    category.includes(cat)
  );
  
  return isEntryLevel || isNonTechCategory;
}

/**
 * Fetch jobs from RemoteOK (free, no API key required)
 */
export async function fetchRemoteOKJobs(limit = 20) {
  try {
    console.log('Fetching jobs from RemoteOK...');
    const response = await axios.get('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)'
      }
    });

    // First item is just metadata, skip it
    const jobs = response.data.slice(1);
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.position,
        description: job.description || '',
        category: job.tags?.[0] || '',
        company: job.company
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
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
      datePosted: new Date(job.date * 1000).toISOString(),
      source: 'RemoteOK',
      category: job.tags?.[0] || 'General'
    }));
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Remotive API (free, no API key required)
 */
export async function fetchRemotiveJobs(limit = 20) {
  try {
    console.log('Fetching jobs from Remotive...');
    // Fetch more jobs to filter from
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: {
        limit: 100
      }
    });

    const jobs = response.data.jobs || [];
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        category: job.category || '',
        company: job.company_name
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
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
      category: job.category || 'General'
    }));
  } catch (error) {
    console.error('Error fetching from Remotive:', error.message);
    return [];
  }
}

/**
 * Fetch jobs from Adzuna (requires API key, 1000 calls/month free)
 */
export async function fetchAdzunaJobs(country = 'us', limit = 20) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('Skipping Adzuna (no API keys configured)');
    return [];
  }

  try {
    console.log('Fetching entry-level non-technical REMOTE jobs from Adzuna...');
    
    // Fetch remote customer service jobs
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 50,
          what: 'customer service remote',
          where: 'remote'
        }
      }
    );

    const jobs = response.data.results || [];
    
    console.log(`Adzuna: Found ${jobs.length} total jobs`);
    
    // Filter for remote, non-technical entry-level jobs in English with good descriptions
    const filtered = jobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.description || '',
        category: job.category?.label || '',
        company: job.company?.display_name || ''
      };
      
      // Check if job is remote
      const locationLower = (job.location?.display_name || '').toLowerCase();
      const titleLower = (job.title || '').toLowerCase();
      const descLower = (job.description || '').toLowerCase();
      const isRemote = locationLower.includes('remote') || 
                       titleLower.includes('remote') || 
                       descLower.includes('remote') ||
                       descLower.includes('work from home');
      
      if (!isRemote) {
        return false;
      }
      
      const pass = isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
      return pass;
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
      category: job.category?.label || 'General'
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
 */
export async function fetchJoobleJobs(limit = 50) {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    console.log('Skipping Jooble (no API key configured)');
    return [];
  }

  try {
    console.log('Fetching entry-level non-technical jobs from Jooble...');
    
    const searches = [
      'customer service representative entry level',
      'customer service remote',
      'sales representative entry level',
      'sales associate remote',
      'administrative assistant',
      'virtual assistant',
      'data entry clerk',
      'social media coordinator',
      'content writer remote',
      'email support specialist',
      'chat support representative'
    ];
    
    const allJobs = [];
    
    for (const keywords of searches) {
      try {
        // Fetch multiple pages for each search
        for (let page = 1; page <= 2; page++) {
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
          
          // If we got less than expected, no point fetching next page
          if (jobs.length < 10) break;
        }
      } catch (err) {
        console.error(`Jooble search "${keywords}" failed:`, err.message);
      }
    }
    
    console.log(`Jooble: Fetched ${allJobs.length} total jobs before filtering`);
    
    // Filter for non-technical entry-level jobs in English with good descriptions
    const filtered = allJobs.filter(job => {
      const mapped = {
        title: job.title,
        description: job.snippet || '',
        category: '',
        company: job.company
      };
      return isNonTechnicalEntryLevel(mapped) && isEnglishWithGoodDescription(mapped);
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
      location: job.location || 'USA',
      originalUrl: job.link,
      datePosted: job.updated || new Date().toISOString(),
      source: 'Jooble',
      category: 'Entry Level'
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
 * Fetch jobs from all available sources
 */
export async function fetchAllJobs(limit = 20) {
  console.log(`\nFetching ${limit} non-technical entry-level jobs from each source...\n`);
  
  const [
    remoteOKJobs, 
    remotiveJobs, 
    adzunaJobs, 
    jsearchJobs,
    linkedinJobs,
    simplyhiredJobs,
    joobleJobs,
    findworkJobs,
    careerjetJobs
  ] = await Promise.all([
    fetchRemoteOKJobs(limit),
    fetchRemotiveJobs(limit),
    fetchAdzunaJobs('us', limit),
    fetchJSearchJobs(limit),
    fetchLinkedInRSSJobs(limit),
    fetchSimplyHiredJobs(limit),
    fetchJoobleJobs(limit),
    fetchFindworkJobs(limit),
    fetchCareerjetJobs(limit)
  ]);

  const allJobs = [
    ...remoteOKJobs, 
    ...remotiveJobs, 
    ...adzunaJobs, 
    ...jsearchJobs,
    ...linkedinJobs,
    ...simplyhiredJobs,
    ...joobleJobs,
    ...findworkJobs,
    ...careerjetJobs
  ];
  
  console.log(`\nTotal non-technical entry-level jobs fetched: ${allJobs.length}`);
  console.log(`- RemoteOK: ${remoteOKJobs.length}`);
  console.log(`- Remotive: ${remotiveJobs.length}`);
  console.log(`- Adzuna: ${adzunaJobs.length}`);
  console.log(`- JSearch: ${jsearchJobs.length}`);
  console.log(`- LinkedIn: ${linkedinJobs.length}`);
  console.log(`- SimplyHired: ${simplyhiredJobs.length}`);
  console.log(`- Jooble: ${joobleJobs.length}`);
  console.log(`- Findwork: ${findworkJobs.length}`);
  console.log(`- Careerjet: ${careerjetJobs.length}`);
  
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
