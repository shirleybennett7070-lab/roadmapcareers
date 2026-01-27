import { getAllJobs } from '../../jobs/services/sheetsService.js';

/**
 * Extract job ID from email body
 */
export function extractJobId(emailBody, subject) {
  const text = `${subject} ${emailBody}`.toLowerCase();
  
  // Pattern 1: Explicit job ID mentions
  const patterns = [
    /job\s*id[:\s]+([a-z0-9_-]+)/i,
    /position\s*id[:\s]+([a-z0-9_-]+)/i,
    /ref[:\s]+([a-z0-9_-]+)/i,
    /reference[:\s]+([a-z0-9_-]+)/i,
    /job\s*#([a-z0-9_-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Find job ID by fuzzy matching job title or company
 */
export async function findJobByContent(emailBody, subject) {
  const text = `${subject} ${emailBody}`.toLowerCase();
  const jobs = await getAllJobs();
  
  // Try to match job title or company name
  for (const job of jobs) {
    const title = job.title.toLowerCase();
    const company = job.company.toLowerCase();
    
    // If email mentions significant parts of title or company
    const titleWords = title.split(' ').filter(w => w.length > 3);
    const companyWords = company.split(' ').filter(w => w.length > 3);
    
    let titleMatches = 0;
    let companyMatches = 0;
    
    for (const word of titleWords) {
      if (text.includes(word)) titleMatches++;
    }
    
    for (const word of companyWords) {
      if (text.includes(word)) companyMatches++;
    }
    
    // If we match most of the title words and some company words
    if (titleMatches >= Math.ceil(titleWords.length / 2) && companyMatches > 0) {
      return job;
    }
    
    // Or if we match the exact job title
    if (text.includes(title)) {
      return job;
    }
  }
  
  return null;
}

/**
 * Determine if email is a job inquiry
 */
export function isJobInquiry(emailBody, subject) {
  const text = `${subject} ${emailBody}`.toLowerCase();
  
  const inquiryKeywords = [
    'job',
    'position',
    'role',
    'opening',
    'hiring',
    'application',
    'apply',
    'interested',
    'opportunity',
    'career'
  ];
  
  let keywordCount = 0;
  for (const keyword of inquiryKeywords) {
    if (text.includes(keyword)) keywordCount++;
  }
  
  // If email contains 2+ job-related keywords, likely a job inquiry
  return keywordCount >= 2;
}

/**
 * Parse email and extract relevant info
 */
export async function parseEmailForJobInfo(email) {
  const { subject, body, email: senderEmail, name } = email;
  
  // Check if it's a job inquiry
  if (!isJobInquiry(body, subject)) {
    return {
      isJobInquiry: false,
      senderEmail,
      name
    };
  }
  
  // Try to extract explicit job ID
  let jobId = extractJobId(body, subject);
  let job = null;
  
  // If no explicit ID, try fuzzy matching
  if (!jobId) {
    job = await findJobByContent(body, subject);
    if (job) {
      jobId = job.jobId;
    }
  } else {
    // If we have ID, look up the job
    const jobs = await getAllJobs();
    job = jobs.find(j => j.jobId === jobId);
  }
  
  return {
    isJobInquiry: true,
    senderEmail,
    name,
    jobId,
    job,
    hasJobId: !!jobId,
    originalBody: body,
    originalSubject: subject
  };
}
