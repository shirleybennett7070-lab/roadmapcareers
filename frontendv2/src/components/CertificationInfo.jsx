export default function CertificationInfo({ jobInfo, onGetCertified }) {
  // Create prep page URL with job info
  const prepUrl = jobInfo ? 
    `/certification/prep?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type)}` 
    : '/certification/prep';

  return (
    <div className="mb-8">
      <div className="mb-6">
        <p className="text-gray-700 text-base mb-6">
          This certification helps document your preparation for roles you were interested in like <strong>{jobInfo?.title || 'remote work positions'}</strong>.
        </p>

        {/* 2-Step Process */}
        <div className="bg-blue-50 rounded-lg p-5 mb-6">
          <p className="font-semibold text-gray-900 mb-3">How It Works:</p>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              <div>
                <p className="font-medium text-gray-900">Review Questions</p>
                <p className="text-sm text-gray-700">Study all 50 questions with detailed explanations at your own pace</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              <div>
                <p className="font-medium text-gray-900">Take the Exam</p>
                <p className="text-sm text-gray-700">Complete a 30-minute exam with 20 randomly selected questions</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <p className="font-semibold text-gray-900 mb-3">Certification Details:</p>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><span className="font-medium">Format:</span> Multiple-Choice Questions</li>
            <li><span className="font-medium">Question Bank:</span> 50 questions available to review</li>
            <li><span className="font-medium">Exam Questions:</span> 20 randomly selected from the bank</li>
            <li><span className="font-medium">Passing Score:</span> 12/20 (60%)</li>
            <li><span className="font-medium">Duration:</span> 30 Minutes</li>
            <li><span className="font-medium">Retakes:</span> Unlimited</li>
            <li><span className="font-medium">Delivery:</span> Online</li>
            <li><span className="font-medium">Certificate:</span> Professional digital certificate with unique ID</li>
            <li><strong>Verification: Employers, recruiters, or other reviewers may independently verify the authenticity of the certificate online using the certificate ID</strong></li>
          </ul>
        </div>

        <button
          onClick={onGetCertified}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Certified
        </button>

        <div className="mt-4">
          <a
            href="/certificate?id=RC-L5X8K9PQ-A7B3C9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            View Sample Certificate →
          </a>
        </div>
      </div>
    </div>
  );
}
