import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import Layout from '../components/Layout'

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState('verifying')
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`${API_URL}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await response.json()
        if (data.paid) {
          setPaymentData(data)
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }

    verifyPayment()
  }, [sessionId])

  const handleBeginVerification = () => {
    // Pass metadata along so we prefill fields
    const params = new URLSearchParams()
    if (paymentData?.metadata) {
      Object.entries(paymentData.metadata).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
    }
    if (sessionId) params.set('session_id', sessionId)
    navigate(`/verify/start?${params.toString()}`)
  }

  return (
    <Layout>
      <div className="py-8 sm:py-16">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-navy-700 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying your payment...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your transaction.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Payment Successful</h2>
            <p className="text-slate-600 text-base max-w-lg mx-auto mb-4">
              Thank you, <strong>{paymentData?.metadata?.firstName}</strong>. Your payment of <strong>${paymentData?.amount?.toFixed(2)}</strong> has been received.
            </p>
            <p className="text-slate-500 text-sm max-w-lg mx-auto mb-10">
              You can now begin the background verification process. This will take approximately 15–20 minutes to complete.
            </p>

            {/* What's Next */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-lg mx-auto mb-8 text-left">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">What You'll Need to Provide</h3>
              <div className="space-y-3">
                {[
                  { icon: '🪪', label: 'Identity details (government-issued ID)' },
                  { icon: '🏠', label: 'Address history (past 7 years)' },
                  { icon: '💼', label: 'Employment history' },
                  { icon: '🎓', label: 'Education information' },
                  { icon: '⚖️', label: 'Criminal history disclosure' },
                  { icon: '📄', label: 'Driving, licenses, military service' },
                  { icon: '📋', label: 'Professional references' },
                  { icon: '📸', label: 'Live photo verification (camera access required)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBeginVerification}
              className="px-12 py-4 rounded-xl text-base font-bold tracking-wide bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 transition-all cursor-pointer"
            >
              Begin Verification Process
            </button>
            <p className="text-xs text-slate-400 mt-3">Estimated time: 10–15 minutes</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Payment Could Not Be Verified</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              We were unable to verify your payment. If you believe this is an error, please contact support.
            </p>
            <a href="/personal-info" className="inline-block px-8 py-3 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white transition-colors">
              Try Again
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}
