import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

// Helper function to format the posted date
const formatPostedDate = (dateString) => {
  if (!dateString) return 'Recently Posted';
  
  try {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return dateString; // Return as-is if parsing fails
  }
};

// Helper function to derive additional job fields
const deriveJobDetails = (jobData) => {
  const { title, company, pay, location, type, description, posted: postedRaw } = jobData;
  const descLower = (description || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const locationLower = (location || '').toLowerCase();
  
  // Determine work setting
  let workSetting = 'On-site';
  if (locationLower.includes('remote') || descLower.includes('remote') || descLower.includes('work from home')) {
    workSetting = 'Remote';
  } else if (descLower.includes('hybrid')) {
    workSetting = 'Hybrid';
  }
  
  // Determine employment type
  let employmentType = 'Full-time';
  if (descLower.includes('part-time') || descLower.includes('part time')) {
    employmentType = 'Part-time';
  } else if (descLower.includes('contract')) {
    employmentType = 'Contract';
  } else if (descLower.includes('flexible') || descLower.includes('freelance')) {
    employmentType = 'Flexible';
  }
  
  // Determine schedule
  let schedule = 'Standard Business Hours';
  if (descLower.includes('flexible hours') || descLower.includes('flexible schedule') || descLower.includes('set your own')) {
    schedule = 'Flexible Hours';
  } else if (descLower.includes('evening') || descLower.includes('night')) {
    schedule = 'Evening/Night Shifts Available';
  } else if (descLower.includes('weekend')) {
    schedule = 'Weekends Available';
  } else if (workSetting === 'Remote') {
    schedule = 'Flexible Hours';
  }
  
  // Determine experience level
  let experienceRequired = 'Entry Level - Some experience preferred';
  if (descLower.includes('no experience') || descLower.includes('no prior experience') || descLower.includes('will train')) {
    experienceRequired = 'No Experience Required - Training Provided';
  } else if (type?.toLowerCase().includes('entry')) {
    experienceRequired = 'Entry Level - No experience required';
  } else if (descLower.includes('1-2 years') || descLower.includes('1+ year')) {
    experienceRequired = '1-2 Years Experience';
  }
  
  // Format the posted date from database
  const posted = formatPostedDate(postedRaw);
  
  // Determine start date
  let startDate = 'Upon Hire';
  if (descLower.includes('immediate') || descLower.includes('asap') || descLower.includes('urgently')) {
    startDate = 'Immediate Start';
  }
  
  // Determine benefits based on employment type
  let benefits = [];
  if (employmentType === 'Full-time') {
    benefits = ['Professional Development', 'Career Growth'];
  } else if (employmentType === 'Part-time') {
    benefits = ['Flexible Scheduling', 'Performance Bonuses'];
  } else {
    benefits = ['Flexible Schedule', 'Work-Life Balance'];
  }
  if (workSetting === 'Remote') {
    benefits.push('Work From Home');
  }
  
  // Generate Roadmap Careers summary based on role type
  let roadmapSummary = 'This remote position offers the opportunity to work from home while building valuable customer service skills. Remote roles like this typically provide flexibility, eliminate commuting, and allow you to develop professional communication abilities that are transferable across industries. Many candidates use entry-level remote positions as a stepping stone to advance their careers in customer success, sales, or management.';
  
  if (titleLower.includes('chat') || titleLower.includes('support')) {
    roadmapSummary = 'Live chat and support roles are among the fastest-growing remote positions. These roles develop your written communication skills, problem-solving abilities, and technical aptitude. Many companies prefer candidates who can multitask and handle multiple conversations simultaneously, making this an excellent opportunity to build in-demand skills.';
  } else if (titleLower.includes('sales') || titleLower.includes('account')) {
    roadmapSummary = 'Remote sales and account positions offer excellent earning potential with commission structures. These roles help you develop persuasion skills, relationship building, and business acumen. Many successful professionals started in entry-level sales before advancing to senior sales or management positions.';
  } else if (titleLower.includes('admin') || titleLower.includes('assistant')) {
    roadmapSummary = 'Administrative and virtual assistant roles provide a strong foundation for remote work careers. You will develop organizational skills, time management, and proficiency with various business tools. These positions often lead to executive assistant roles or operations management opportunities.';
  }

  return {
    workSetting,
    employmentType,
    schedule,
    experienceRequired,
    posted,
    startDate,
    benefits,
    roadmapSummary
  };
};

export default function JobDetails() {
  const [jobInfo, setJobInfo] = useState(null);
  const [derivedInfo, setDerivedInfo] = useState(null);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const jobData = {
      title: params.get('job') || 'Customer Service Representative',
      company: params.get('company') || 'Various Employers',
      pay: params.get('pay') || '$20-25/hour',
      location: params.get('location') || 'Remote',
      type: params.get('type') || 'Entry Level',
      originalUrl: params.get('url') || '',
      description: params.get('description') || '',
      posted: params.get('posted') || '' // Get posted date from URL (comes from database)
    };
    setJobInfo(jobData);
    setDerivedInfo(deriveJobDetails(jobData));
  }, []);

  if (!jobInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Job Opportunity Details
            </h2>
            <p className="text-gray-600">
              Review this exciting opportunity below
            </p>
          </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Role
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {jobInfo.title}
            </h2>
            <div className="h-1 w-20 bg-blue-600 rounded"></div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Company
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900 font-medium">
                  {jobInfo.company}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Pay Range
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-green-600 font-semibold">
                  {jobInfo.pay}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Location
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {jobInfo.location}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Work Setting
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.workSetting}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Employment Type
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.employmentType}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Schedule
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.schedule}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Experience
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.experienceRequired}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Start Date
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.startDate}
                </span>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-36 mr-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Posted
                </span>
              </div>
              <div className="flex-1">
                <span className="text-lg text-gray-900">
                  {derivedInfo?.posted}
                </span>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                  Actively Hiring
                </span>
              </div>
            </div>

            {derivedInfo?.benefits && derivedInfo.benefits.length > 0 && (
              <div className="flex items-start border-b border-gray-100 pb-4">
                <div className="flex-shrink-0 w-36 mr-4">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Benefits
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {derivedInfo.benefits.map((benefit, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {jobInfo.description && (
              <div className="flex items-start pt-2">
                <div className="flex-shrink-0 w-36 mr-4">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Description
                  </span>
                </div>
                <div className="flex-1">
                  <ul className="space-y-2">
                    {jobInfo.description
                      .split(/(?<=[.!?])\s+|[•·∙]\s*|-\s+|\n+/)
                      .map(item => item.replace(/^[-•·∙]\s*/, '').trim())
                      .filter(item => item.length > 2)
                      .map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-3 mt-1.5 flex-shrink-0">
                            <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="4" />
                            </svg>
                          </span>
                          <span className="text-gray-700 leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {derivedInfo?.roadmapSummary && (
              <div className="flex items-start border-b border-gray-100 pb-4 pt-2">
                <div className="flex-shrink-0 w-36 mr-4">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Roadmap Careers Summary
                  </span>
                </div>
                <div className="flex-1">
                  <ul className="space-y-2">
                    {derivedInfo.roadmapSummary
                      .split(/(?<=[.!?])\s+/)
                      .filter(item => item.trim().length > 0)
                      .map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-3 mt-1.5 flex-shrink-0">
                            <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="4" />
                            </svg>
                          </span>
                          <span className="text-gray-700 leading-relaxed">
                            {item.trim()}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Why Consider This Role */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why some candidates consider this role
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Entry-level role as described in the listing</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Competitive hourly pay relative to similar roles</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Customer-facing responsibilities</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Company operates a well-known consumer platform</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Interested in This Position?
              </h3>
              <p className="text-gray-700 mb-4">
                Katherine at Roadmap Careers can provide general information and answer questions about this opportunity.
              </p>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Contact:</strong> Katherine
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:katherine@roadmapcareers.com" className="text-blue-600 hover:underline">
                    katherine@roadmapcareers.com
                  </a>
                </p>
              </div>
            </div>

            {jobInfo.originalUrl && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <a 
                  href={jobInfo.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gray-700 hover:underline text-sm font-medium"
                >
                  More Info
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
