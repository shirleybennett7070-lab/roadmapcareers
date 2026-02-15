import Header from './Header';
import Footer from './Footer';

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Careers at Roadmap Careers
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join our growing team and help people launch their remote careers.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">

            {/* Job Listing Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-8 md:p-10">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Talent Manager
                    </h2>
                    <div className="h-1 w-16 bg-blue-600 rounded mb-4"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Remote
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Full-Time
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Entry Level
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Closed / Filled
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 font-medium mb-1">Company</p>
                    <p className="text-gray-900 font-semibold">Roadmap Careers</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                    <p className="text-gray-900 font-semibold">Remote (US)</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 font-medium mb-1">Compensation</p>
                    <p className="text-gray-900 font-semibold">Competitive</p>
                  </div>
                </div>

                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h3>
                    <p className="leading-relaxed">
                      We're looking for a motivated Talent Manager to join our team. In this role, you'll
                      work directly with candidates to help them find and secure remote job opportunities.
                      You'll guide individuals through the application process, provide career coaching, and
                      serve as their advocate with hiring employers.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                    <ul className="space-y-2">
                      {[
                        'Screen and evaluate candidates for remote job readiness',
                        'Provide personalized career guidance and support to candidates',
                        'Match candidates with suitable remote job opportunities',
                        'Maintain regular communication with candidates throughout the hiring process',
                        'Collaborate with the team to improve recruitment strategies',
                        'Track candidate progress and maintain organized records',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                    <ul className="space-y-2">
                      {[
                        'Strong written and verbal communication skills',
                        'Highly organized with attention to detail',
                        'Empathetic and people-oriented mindset',
                        'Comfortable working independently in a remote environment',
                        'Previous experience in recruiting, HR, or customer service is a plus but not required',
                        'Proficiency with basic computer tools and willingness to learn new platforms',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Perks</h3>
                    <div className="flex flex-wrap gap-2">
                      {['100% Remote', 'Flexible Hours', 'Professional Development', 'Supportive Team Culture'].map((perk, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Section - Not Hiring */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" id="apply">
              <div className="p-8 md:p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-400 mb-2">
                  Apply Now
                </h2>
                <div className="h-1 w-16 bg-gray-300 rounded mx-auto mb-6"></div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-1">
                    This role has been filled.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Check back soon — new openings are posted regularly.
                  </p>
                </div>
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-semibold cursor-not-allowed"
                >
                  Applications Closed
                </button>
              </div>
            </div>
      </div>

      <Footer />
    </div>
  );
}
