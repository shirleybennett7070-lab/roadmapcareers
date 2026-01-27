import { LEAD_STAGES } from './leadsService.js';
import { getAllJobs } from '../../jobs/services/sheetsService.js';

/**
 * Email templates for Customer Service Training funnel
 * Dynamically includes top 3 jobs from database
 */

// Base URL for the frontend - change this for production
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Get top 3 featured jobs to show in emails
 * 2 from Jooble, 1 from Adzuna (prioritize jobs with salary, but include any if needed)
 */
async function getTop3Jobs() {
  try {
    const allJobs = await getAllJobs();
    
    // Helper to extract first number from salary string
    const getFirstNumber = (str) => {
      if (!str) return 0;
      const match = str.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    // Helper to check if salary is hourly
    const isHourly = (str) => {
      if (!str) return false;
      return /hour|hr|\/h|\bph\b/i.test(str);
    };
    
    // Prefer Jooble jobs - get 3, sorted by hourly pay then salary amount
    const joobleJobs = allJobs
      .filter(job => job.source === 'Jooble')
      .sort((a, b) => {
        const aHasSalary = a.salaryRange && a.salaryRange !== 'Not specified' ? 1 : 0;
        const bHasSalary = b.salaryRange && b.salaryRange !== 'Not specified' ? 1 : 0;
        // First: jobs with salary over jobs without
        if (bHasSalary !== aHasSalary) return bHasSalary - aHasSalary;
        // Second: prefer hourly pay
        const aIsHourly = isHourly(a.salaryRange) ? 1 : 0;
        const bIsHourly = isHourly(b.salaryRange) ? 1 : 0;
        if (bIsHourly !== aIsHourly) return bIsHourly - aIsHourly;
        // Third: sort by amount
        return getFirstNumber(b.salaryRange) - getFirstNumber(a.salaryRange);
      })
      .slice(0, 3);
    
    const selectedJobs = [...joobleJobs];
    
    // If we don't have enough, fill with any available jobs
    if (selectedJobs.length < 3) {
      const remaining = allJobs
        .filter(job => !selectedJobs.includes(job))
        .slice(0, 3 - selectedJobs.length);
      selectedJobs.push(...remaining);
    }
    
    return selectedJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return [];
  }
}

/**
 * Build URL parameters for a job - SINGLE SOURCE OF TRUTH
 * All job links use this function to ensure consistency
 */
function buildJobParams(job) {
  return {
    job: job.title,
    company: job.company,
    pay: job.salaryRange,
    location: job.location,
    type: job.category || 'Customer Service',
    url: job.originalUrl || job.url || job.applyUrl || '',
    description: job.description || '',
    posted: job.datePosted || ''
  };
}

/**
 * Build a URL with job parameters
 */
function buildJobUrl(basePath, job) {
  const params = buildJobParams(job);
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  
  return `${BASE_URL}${basePath}?${searchParams.toString()}`;
}

/**
 * Format a single job listing for email
 */
function formatJobListing(job, index) {
  const jobDetailsUrl = buildJobUrl('/job-details', job);
  return `${index + 1}. ${job.title}
   Company: ${job.company}
   Pay: ${job.salaryRange}
   Location: ${job.location}
   Type: ${job.category || 'Customer Service'}
   <a href="${jobDetailsUrl}">More Info</a>`;
}

/**
 * Format a job with action link (assessment, certification, etc.)
 */
function formatJobWithAction(job, index, actionPath, actionText) {
  const actionUrl = buildJobUrl(actionPath, job);
  return `${index + 1}. ${job.title} (${job.category || 'Entry Level'} | Remote)
   <a href="${actionUrl}"><b>${actionText}</b></a>`;
}

/**
 * Format jobs for email display with full details and clickable links
 */
function formatJobsForEmail(jobs) {
  if (!jobs || jobs.length === 0) {
    // Fallback jobs if database is empty
    const fallbackJobs = [
      { title: 'Customer Service Representative', company: 'Various Employers', salaryRange: '$20-25/hour', location: 'Remote (US-based)', category: 'Full-time, Entry-level' },
      { title: 'Live Chat Support Specialist', company: 'Various Employers', salaryRange: '$18-22/hour', location: 'Remote (US-based)', category: 'Full-time, Entry-level' },
      { title: 'Email Support Agent', company: 'Various Employers', salaryRange: '$19-23/hour', location: 'Remote (US-based)', category: 'Full-time, Entry-level' }
    ];
    return fallbackJobs.map((job, index) => formatJobListing(job, index)).join('\n\n');
  }
  
  return jobs.map((job, index) => formatJobListing(job, index)).join('\n\n');
}

/**
 * Format jobs with action links (for assessments, certifications, etc.)
 */
function formatJobsWithAction(jobs, actionPath, actionText) {
  return jobs.map((job, index) => formatJobWithAction(job, index, actionPath, actionText)).join('\n\n');
}

/**
 * STAGE 1: Initial Response Template
 * Sends jobs list with links to our job-details page
 */
export async function getInitialResponseTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const jobs = await getTop3Jobs();
  const jobsList = formatJobsForEmail(jobs);
  
  return {
    subject: 'Re: Remote Positions',
    body: `${greeting},

Thank you for your interest in the remote opportunities.


${jobsList}

These positions are opportunities with established companies. Most are entry-level friendly and provide training for qualified candidates.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 2: Assessment Offer Template
 * Sends assessment links with job details
 */
export async function getAssessmentOfferTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const jobs = await getTop3Jobs();
  
  const jobsList = formatJobsForEmail(jobs);
  const assessmentLinks = formatJobsWithAction(jobs, '/assessment', 'Take Assessment');
  
  return {
    subject: 'Re: Applicant- Assessment',
    body: `${greeting},

Thank you for your interest in these opportunities.

${jobsList}

Next Steps:
Are you willing to complete a brief assessment?

This assessment helps me understand your background for roles you're exploring:

${assessmentLinks}

This takes approximately 5 minutes to complete.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 4: Assessment Review / Soft Pitch Template
 * Reviews assessment and hints at certification
 */
export async function getAssessmentReviewTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const jobs = await getTop3Jobs();
  const jobsList = formatJobsForEmail(jobs);
  
  return {
    subject: 'Re:Your Assessment Results - Next Steps',
    body: `${greeting},

Thank you for completing the professional skills assessment.

I've reviewed your responses and wanted to reach out personally. Based on what I've seen, I believe you have strong potential for these roles:

${jobsList}

However, I noticed your resume doesn’t list any certifications related to this role.
I've noticed that many candidates who apply to similar positions with some sort of certification tend to demonstrate greater readiness to potential employers.

are you open to completing certification? 

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 5: Training/Certification Offer Template
 * Offers certification with links to our certification page
 */
export async function getTrainingOfferTemplate(name, quizScore) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const jobs = await getTop3Jobs();
  
  const jobsList = formatJobsForEmail(jobs);
  const certificationLinks = formatJobsWithAction(jobs, '/certification', 'Get Certification');
  
  return {
    subject: 'Re: Follow up on remote role ',
    body: `${greeting},


Here are the roles we discussed:

${jobsList}

Next Steps:

This quick certification helps document your preparation for roles you're exploring.

${certificationLinks}

Once you complete the certification, I will follow up with more information.


Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 7: Follow Up Template
 * Re-engages leads who haven't responded
 */
export async function getFollowUpTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  
  return {
    subject: 'Re: Remote Customer Service Opportunities',
    body: `${greeting},

I wanted to reach out once more regarding the customer service positions I shared with you.

Several companies I work with have added new remote customer service openings this week, with competitive hourly rates ranging from $18-25/hour for entry-level candidates.

If you're still exploring remote work opportunities, I'd be happy to:

- Share the latest job postings
- Provide application guidance
- Connect you with hiring managers
- Answer any questions about the roles

Please let me know if you'd like me to send updated listings.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * Skill Assessment Offer Template
 * Sent automatically after candidate assessment completion (Stage 2 → Stage 3)
 */
export async function getSkillAssessmentOfferTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const jobs = await getTop3Jobs();
  
  const jobsList = formatJobsForEmail(jobs);
  const skillAssessmentLinks = formatJobsWithAction(jobs, '/skill-assessment', 'Take Skills Assessment');
  
  return {
    subject: 'Re: Next Step - Skills Assessment',
    body: `${greeting},

Thank you for completing the initial assessment!

${jobsList}

Next Steps:
Are you willing to complete a skill assessment?
This assessment helps me understand your skills for roles you're exploring

${skillAssessmentLinks}

The skills assessment includes:
- Real-world remote work scenarios
- Problem-solving questions
- Written communication exercises
- Time management and organization challenges

This assessment typically takes 15-20 minutes to complete.

Once completed, I’ll follow up with relevant information

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * Get appropriate template based on lead stage
 */
export async function getTemplateForStage(stage, leadData) {
  const { name, quizScore } = leadData;
  
  switch (stage) {
    case LEAD_STAGES.STAGE_1_JOBS_LIST_SENT:
      return await getInitialResponseTemplate(name);
      
    case LEAD_STAGES.STAGE_2_ASSESSMENT_COMPLETED:
      // Reply to Stage 1 → Send assessment offer
      return await getAssessmentOfferTemplate(name);
      
    case LEAD_STAGES.STAGE_3_SKILL_ASSESSMENT_COMPLETED:
      // Reply to Stage 2 → Send skill assessment offer
      return await getSkillAssessmentOfferTemplate(name);
      
    case LEAD_STAGES.STAGE_4_SOFT_PITCH_SENT:
      return await getAssessmentReviewTemplate(name);
      
    case LEAD_STAGES.STAGE_5_TRAINING_OFFERED:
      return await getTrainingOfferTemplate(name, quizScore);
      
    case LEAD_STAGES.STAGE_7_FOLLOW_UP:
      return await getFollowUpTemplate(name);
      
    default:
      return null;
  }
}
