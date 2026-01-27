export default function PricingCards({ jobInfo, onEnroll, onBack }) {
  // Create prep page URL with job info
  const prepUrl = jobInfo ? 
    `/certification/prep?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type)}` 
    : '/certification/prep';

  return (
    <div className="mb-16 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
        Get Your Certification
      </h2>
      <p className="text-center text-gray-600 mb-10">
        Follow these steps to earn your professional certification
      </p>

      {/* Step-by-step Cards */}
      <div className="space-y-6">
        {/* Step 1: Free Prep Card */}
        <div className="border-2 border-gray-300 rounded-lg p-8 bg-white relative">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Prepare</h3>
              <p className="text-gray-700 mb-6">
                Access all 50 exam questions with detailed explanations. Study at your own pace.
              </p>
              <a
                href={prepUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-blue-600 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Review Questions →
              </a>
            </div>
          </div>
        </div>

        {/* Connecting Line */}
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gray-300"></div>
        </div>

        {/* Step 2: Certification Card */}
        <div className="border-2 border-gray-300 rounded-lg p-8 bg-white">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-gray-900">Take the Certification Exam</h3>
                <div>
                  <span className="text-gray-500 line-through text-sm mr-2">$20</span>
                  <span className="text-2xl font-bold text-gray-900">$9</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Complete the online exam. Payment is only required if you pass (60% or higher).
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-semibold text-gray-900 mb-3 text-sm">Exam Details:</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Format:</span> <span className="ml-1">Multiple-Choice</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="font-medium">Questions:</span> <span className="ml-1">20</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Passing:</span> <span className="ml-1">12/20 (60%)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Duration:</span> <span className="ml-1">30 Minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-medium">Certificate:</span> <span className="ml-1">Digital with unique ID</span>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <strong>Verification: Employers, recruiters, or other reviewers may independently verify the authenticity of the certificate online using the certificate ID</strong>
                </div>
              </div>
              
              {jobInfo && (
                <p className="text-sm text-gray-600 mb-4">
                  This certification helps document your preparation for roles you were interested in like{' '}
                  <a 
                    href={`/job-details?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type)}${jobInfo.originalUrl ? `&url=${encodeURIComponent(jobInfo.originalUrl)}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {jobInfo.title} <span className="text-xs">↗</span>
                  </a>.
                </p>
              )}
              
              <button
                onClick={onEnroll}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Take Exam - $9
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Payment is processed only after passing the exam.<br />
                The fee helps cover the costs of operating and maintaining the platform, including assessment testing and delivery, certificate issuance, and verification services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {onBack && (
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
