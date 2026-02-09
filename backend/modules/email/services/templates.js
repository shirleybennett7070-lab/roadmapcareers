import { LEAD_STAGES } from './leadsService.js';
import { getAllJobs } from '../../jobs/services/sheetsService.js';

/**
 * Email templates for Customer Service Training funnel
 * Dynamically includes top job from database
 */

// Base URL for the frontend - change this for production
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Get the best single job to feature in emails
 * Prioritizes jobs with salary info (hourly preferred, then highest pay)
 */
async function getTopJob() {
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
    
    // Sort all jobs: salary > no salary, hourly > other, highest pay first
    const sorted = allJobs.sort((a, b) => {
      const aHasSalary = a.salaryRange && a.salaryRange !== 'Not specified' ? 1 : 0;
      const bHasSalary = b.salaryRange && b.salaryRange !== 'Not specified' ? 1 : 0;
      if (bHasSalary !== aHasSalary) return bHasSalary - aHasSalary;
      const aIsHourly = isHourly(a.salaryRange) ? 1 : 0;
      const bIsHourly = isHourly(b.salaryRange) ? 1 : 0;
      if (bIsHourly !== aIsHourly) return bIsHourly - aIsHourly;
      return getFirstNumber(b.salaryRange) - getFirstNumber(a.salaryRange);
    });
    
    return sorted[0] || null;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return null;
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
function formatJobListing(job) {
  const jobDetailsUrl = buildJobUrl('/job-details', job);
  const salaryLine = job.salaryRange && job.salaryRange !== 'Not specified' ? `\n   Pay: ${job.salaryRange}` : '';
  return `<b>${job.title}</b>
   Company: ${job.company}${salaryLine}
   Location: ${job.location}
   <a href="${jobDetailsUrl}">View Details</a>`;
}

/**
 * Format a job with action link (assessment, certification, etc.)
 */
function formatJobWithAction(job, actionPath, actionText) {
  const actionUrl = buildJobUrl(actionPath, job);
  return `<b>${job.title}</b> (${job.category || 'Entry Level'} | Remote)
   <a href="${actionUrl}"><b>${actionText}</b></a>`;
}

/**
 * Get a formatted job or fallback
 */
function getJobOrFallback(job) {
  if (job) return job;
  return {
    title: 'Customer Service Representative',
    company: 'Various Employers',
    salaryRange: '$20-25/hour',
    location: 'Remote (US-based)',
    category: 'Full-time, Entry-level'
  };
}

/**
 * STAGE 1: Initial Response Template
 * Sends 1 job and asks if they're interested in that role
 */
export async function getInitialResponseTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  
  return {
    subject: 'Re: Remote Positions',
    body: `${greeting},

Thank you for your interest in the remote opportunities.

${jobListing}

This is an entry-level friendly position with an established company that provides training for qualified candidates.

Would you be interested in this role? If so, I can share the next steps to get you started.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 2: Assessment Offer Template
 * Sends assessment link for the role
 */
export async function getAssessmentOfferTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  const assessmentLink = formatJobWithAction(job, '/assessment', 'Take Assessment');
  
  return {
    subject: 'Re: Applicant- Assessment',
    body: `${greeting},


Next Steps:
Are you willing to complete a brief assessment? This helps me understand your background for the job that you are interested in:

${jobListing}

${assessmentLink}

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
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  
  return {
    subject: 'Re: Your Assessment Results - Next Steps',
    body: `${greeting},

Thank you for completing the professional skills assessment.

I've reviewed your responses and wanted to reach out personally. Based on what I've seen, I believe you have strong potential for this role:

${jobListing}

However, I noticed your resume doesn't list any certifications related to this role.
I've noticed that many candidates who apply to similar positions with some sort of certification tend to demonstrate greater readiness to potential employers.

Are you open to completing a certification?

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 5: Training/Certification Offer Template
 * Offers certification with link to our certification page
 */
export async function getTrainingOfferTemplate(name, quizScore) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  const certificationLink = formatJobWithAction(job, '/certification', 'Get Certification');
  
  return {
    subject: 'Re: Follow up on remote role',
    body: `${greeting},

Here is the role we discussed:

${jobListing}

Next Steps:

This quick certification helps document your preparation for the role. It's also a great asset for other remote positions — many employers look for candidates who can demonstrate readiness through certifications like this.

Please note there is a small fee associated with the certification. You will find details in the link

${certificationLink}

Once you pass the exam and receive your certificate, the next step will be a technical assessment which I will send to you directly.

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
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  
  return {
    subject: 'Re: Remote Customer Service Opportunities',
    body: `${greeting},

I wanted to follow up regarding the role I shared with you:

${jobListing}

If you're still interested, I'd be happy to walk you through the next steps.

Just let me know and I can get you started right away.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * Skill Assessment Offer Template
 * Sent automatically after candidate assessment completion (Stage 2 -> Stage 3)
 */
export async function getSkillAssessmentOfferTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);
  const skillAssessmentLink = formatJobWithAction(job, '/skill-assessment', 'Take Skills Assessment');
  
  return {
    subject: 'Re: Next Step - Skills Assessment',
    body: `${greeting},

Thank you for completing the initial assessment!

Next Steps:
Are you willing to complete a skill assessment? This helps me understand your skills for the role:

${jobListing}

${skillAssessmentLink}

The skills assessment includes:
- Real-world remote work scenarios
- Problem-solving questions
- Written communication exercises
- Time management and organization challenges

This assessment typically takes 15-20 minutes to complete.

Once completed, I'll follow up with relevant information.

Best regards,
Katherine
Roadmap Careers
katherine@roadmapcareers.com`
  };
}

/**
 * STAGE 1B: Intake Request Template
 * Asks candidate to fill out intake form with info + consent to represent
 */
export async function getIntakeRequestTemplate(name) {
  const greeting = name ? `Hi ${name}` : 'Hello';
  const job = getJobOrFallback(await getTopJob());
  const jobListing = formatJobListing(job);

  const intakeUrl = buildJobUrl('/intake', job);

  return {
    subject: 'Re: Next Step - Candidate Intake',
    body: `${greeting},

Great to hear you're interested! Before we proceed, I need to collect a few details so I can represent you for this role:

${jobListing}

Please fill out this quick form (takes about 2 minutes):

<a href="${intakeUrl}"><b>Complete Intake/b></a>

Once submitted, I'll follow up with the next steps right away.

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

    case LEAD_STAGES.STAGE_1B_INTAKE_REQUESTED:
      return await getIntakeRequestTemplate(name);

    case LEAD_STAGES.STAGE_2_INTAKE_COMPLETED:
      // Intake done -> Send assessment offer
      return await getAssessmentOfferTemplate(name);
      
    case LEAD_STAGES.STAGE_3_ASSESSMENT_OFFERED:
      // Assessment done -> Send skill assessment offer
      return await getSkillAssessmentOfferTemplate(name);
      
    case LEAD_STAGES.STAGE_5_SOFT_PITCH_SENT:
      return await getAssessmentReviewTemplate(name);
      
    case LEAD_STAGES.STAGE_6_TRAINING_OFFERED:
      return await getTrainingOfferTemplate(name, quizScore);
      
    case LEAD_STAGES.STAGE_8_FOLLOW_UP:
      return await getFollowUpTemplate(name);
      
    default:
      return null;
  }
}
