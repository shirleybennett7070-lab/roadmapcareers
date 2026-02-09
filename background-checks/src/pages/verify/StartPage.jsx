import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const STEPS = [
  { num: 1, title: 'Identity Verification', desc: 'Legal name, date of birth, nationality, and government-issued ID', icon: '🪪' },
  { num: 2, title: 'Address History', desc: 'Current and previous residential addresses for the past 7 years', icon: '🏠' },
  { num: 3, title: 'Employment History', desc: 'Past employers, job titles, dates of employment', icon: '💼' },
  { num: 4, title: 'Education Verification', desc: 'Schools attended, degrees earned, graduation dates', icon: '🎓' },
  { num: 5, title: 'Criminal History', desc: 'Self-disclosure of any criminal convictions, pending charges, or terminations', icon: '⚖️' },
  { num: 6, title: 'Additional Information', desc: 'Aliases, driving record, professional licenses, military service, and civil litigation', icon: '📄' },
  { num: 7, title: 'Professional References', desc: 'Contact information for professional references', icon: '📋' },
  { num: 8, title: 'Review & Submit', desc: 'Review all information before final submission', icon: '✅' },
  { num: 9, title: 'Live Photo Verification', desc: 'Camera-based identity confirmation matched against your submitted ID', icon: '📸' },
]

export default function StartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleBegin = () => {
    navigate(`/verify/identity?${searchParams.toString()}`)
  }

  return (
    <Layout step={1} totalSteps={11} stepLabel="Begin Verification">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Payment Confirmed
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Background Verification Process
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          You'll be guided through {STEPS.length} sections. Please have your information ready. 
          All data is encrypted and handled securely.
        </p>
      </div>

      {/* Steps Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Verification Steps</h3>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.num} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {step.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{step.icon}</span>
                  <span className="font-semibold text-slate-800 text-sm">{step.title}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Estimate */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-blue-800 text-sm font-semibold">Estimated time: 15–20 minutes</p>
          <p className="text-blue-600 text-xs mt-0.5">Please complete all steps in one session.</p>
        </div>
      </div>

      {/* Do not refresh warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-red-700 text-sm font-semibold">Do not refresh or close the page during verification</p>
          <p className="text-red-600 text-xs mt-0.5">Refreshing or leaving the page will erase your progress and you will need to start over. Your verification session cannot be recovered.</p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleBegin}
          className="px-12 py-4 rounded-xl text-base font-bold tracking-wide bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 transition-all cursor-pointer"
        >
          Begin Verification →
        </button>
      </div>
    </Layout>
  )
}
