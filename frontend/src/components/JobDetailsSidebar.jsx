export default function JobDetailsSidebar({ jobInfo, assessmentType = 'candidate' }) {
  // Different text based on assessment type
  const assessmentText = assessmentType === 'skill' 
    ? 'This assessment helps us understand your skills for these roles.'
    : assessmentType === 'certification'
    ? 'This certification helps document your preparation for roles you\'re exploring.'
    : 'This assessment helps us understand your background for these roles.';

  // Create job details page URL
  const jobUrl = jobInfo?.originalUrl || jobInfo?.url || jobInfo?.applyUrl || '';
  const description = jobInfo?.description || '';
  const baseUrl = window.location.origin;
  const jobDetailsUrl = `${baseUrl}/job-details?job=${encodeURIComponent(jobInfo?.title || '')}&company=${encodeURIComponent(jobInfo?.company || '')}&pay=${encodeURIComponent(jobInfo?.pay || '')}&location=${encodeURIComponent(jobInfo?.location || '')}&type=${encodeURIComponent(jobInfo?.type || 'Customer Service')}&url=${encodeURIComponent(jobUrl)}&description=${encodeURIComponent(description)}`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Role You're Interested In
        </h3>
        <div className="h-1 w-12 bg-blue-600 rounded"></div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Role Title
          </span>
          <span className="text-lg font-bold text-gray-900 block">
            {jobInfo?.position || jobInfo?.title || 'Not specified'}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Category
          </span>
          <span className="text-gray-900 font-medium block">
            {jobInfo?.type || 'Customer Service'}
          </span>
        </div>

        {jobInfo?.pay && jobInfo.pay !== 'Not specified' && (
          <div className="border-t border-gray-200 pt-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Pay
            </span>
            <span className="text-gray-900 font-bold block text-lg">
              {jobInfo.pay}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Work Type
          </span>
          <span className="text-gray-900 font-medium block">
            Remote
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Responsibilities
          </span>
          <ul className="text-gray-900 text-sm space-y-1">
            <li>• Communicate with customers and clients</li>
            <li>• Complete tasks using online tools and systems</li>
          </ul>
        </div>

        {/* More Info Link */}
        <div className="border-t border-gray-200 pt-4">
          <a 
            href={jobDetailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
          >
            More Info →
          </a>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold block mb-1">
              {assessmentType === 'certification' ? '🏆 Certification Purpose' : '📝 Assessment Purpose'}
            </span>
            {assessmentText}
          </p>
        </div>
      </div>
    </div>
  );
}
