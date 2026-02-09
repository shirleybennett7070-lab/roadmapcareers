import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VERIFICATION_ITEMS = [
  {
    icon: '🪪',
    title: 'Identity Verification',
    description: 'Full legal name, date of birth, and government-issued ID validation',
  },
  {
    icon: '⚖️',
    title: 'Criminal Record Check',
    description: 'National and international criminal history search',
  },
  {
    icon: '🎓',
    title: 'Education Verification',
    description: 'Degree, institution, and graduation date confirmation',
  },
  {
    icon: '💼',
    title: 'Employment History',
    description: 'Past employer verification including job title, dates, and eligibility for rehire',
  },
  {
    icon: '📋',
    title: 'Professional References',
    description: 'Contact and verify references provided by the candidate',
  },
  {
    icon: '🏠',
    title: 'Address History',
    description: 'Residential address verification for the past 7 years',
  },
]

export default function ConsentPage() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState({
    consent: false,
    accuracy: false,
    fcra: false,
  })

  const allAgreed = agreed.consent && agreed.accuracy && agreed.fcra

  const handleContinue = () => {
    if (!allAgreed) return
    // Navigate to next page (personal info)
    navigate('/personal-info')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight">VerifyCandidates</h1>
              <p className="text-slate-400 text-xs tracking-wide uppercase">Background Verification Services</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-navy-800">Step 1 of 3</span>
            <span className="text-slate-300">|</span>
            <span>Consent & Authorization</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-navy-700 h-1.5 rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-navy-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Employer-Required Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Comprehensive Background Check
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            An employer has requested a background verification as part of your hiring process. 
            VerifyCandidates is an independent third-party verification service that ensures a safe 
            and trustworthy workplace for all parties involved.
          </p>
        </div>

        {/* Cost Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Standard Background Screening</h3>
              <p className="text-slate-500 text-sm">One-time verification fee — results delivered within 24–48 hours</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-center min-w-[120px]">
              <div className="text-3xl font-extrabold text-emerald-700">$5</div>
              <div className="text-emerald-600 text-xs font-medium">One-time fee</div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">What Will Be Verified</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VERIFICATION_ITEMS.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{item.title}</div>
                    <div className="text-slate-500 text-xs leading-relaxed mt-0.5">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-5">How This Process Works</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Provide Consent', desc: 'Review and agree to the background check terms below.' },
              { step: '2', title: 'Enter Your Information', desc: 'Fill out your personal details, employment history, and education.' },
              { step: '3', title: 'Submit & Pay', desc: 'Complete the $5 one-time verification fee to begin the check.' },
              { step: '4', title: 'Receive Results', desc: 'Your verified report is sent to the employer within 24–48 hours.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-navy-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-slate-500 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-navy-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Consent & Authorization</h3>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
            <p className="mb-2">
              <strong>DISCLOSURE AND AUTHORIZATION</strong>
            </p>
            <p className="mb-2">
              In connection with your application for employment, the employer may obtain a consumer report and/or 
              investigative consumer report about you from VerifyCandidates, a consumer reporting agency. These reports 
              may contain information regarding your character, general reputation, personal characteristics, credit 
              worthiness, mode of living, and criminal history.
            </p>
            <p className="mb-2">
              Under the Fair Credit Reporting Act (FCRA), you have the right to: (1) be informed if information in your 
              file has been used against you; (2) request disclosure of the information; (3) dispute incomplete or 
              inaccurate information; and (4) have consumer reporting agencies correct or delete inaccurate, incomplete, 
              or unverifiable information.
            </p>
            <p>
              By proceeding, you acknowledge that you have read and understand this disclosure, and you authorize 
              VerifyCandidates and its agents to obtain the above-described reports.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed.consent}
                onChange={(e) => setAgreed({ ...agreed, consent: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                I authorize VerifyCandidates to conduct a comprehensive background check, including criminal records, 
                employment history, education verification, and identity validation.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed.accuracy}
                onChange={(e) => setAgreed({ ...agreed, accuracy: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                I certify that all information I provide during this process will be true, complete, and accurate 
                to the best of my knowledge.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed.fcra}
                onChange={(e) => setAgreed({ ...agreed, fcra: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                I have read and understand the FCRA disclosure above and agree to the terms of service and 
                privacy policy.
              </span>
            </label>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            disabled={!allAgreed}
            className={`
              w-full sm:w-auto px-12 py-4 rounded-xl text-base font-bold tracking-wide transition-all duration-200
              ${allAgreed
                ? 'bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Continue to Background Check →
          </button>
          <p className="text-xs text-slate-400">
            Your data is protected with 256-bit SSL encryption
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>© 2026 VerifyCandidates. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition-colors">FCRA Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
