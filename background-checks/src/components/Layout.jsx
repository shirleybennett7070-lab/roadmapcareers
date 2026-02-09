import { useEffect } from 'react'

export default function Layout({ step, totalSteps, stepLabel, children, progressColor = 'navy', warnOnLeave = true }) {
  // Warn user if they try to refresh or close during verification
  useEffect(() => {
    if (!warnOnLeave) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [warnOnLeave])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
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
      {step && totalSteps && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-navy-800">Step {step} of {totalSteps}</span>
              <span className="text-slate-300">|</span>
              <span>{stepLabel}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${progressColor === 'emerald' ? 'bg-emerald-500' : 'bg-navy-700'}`}
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>&copy; 2026 VerifyCandidates. All rights reserved.</span>
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
