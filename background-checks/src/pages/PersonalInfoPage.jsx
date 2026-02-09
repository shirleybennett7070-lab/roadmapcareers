import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

export default function PersonalInfoPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    deliveryEmail: '',
  })

  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountError, setDiscountError] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const basePrice = 10
  const discountedPrice = 5
  const currentPrice = discountApplied ? discountedPrice : basePrice

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleApplyCode = () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a code')
      return
    }
    setDiscountApplied(true)
    setDiscountError('')
  }

  const handleRemoveCode = () => {
    setDiscountApplied(false)
    setDiscountCode('')
    setDiscountError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'Required'
    if (!form.lastName.trim()) newErrors.lastName = 'Required'
    if (!form.email.trim()) newErrors.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.phone.trim()) newErrors.phone = 'Required'
    if (!form.companyName.trim()) newErrors.companyName = 'Required'
    if (!form.deliveryEmail.trim()) newErrors.deliveryEmail = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.deliveryEmail)) newErrors.deliveryEmail = 'Enter a valid email'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePay = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      setPaymentError('')

      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountApplied,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setPaymentError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
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
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-navy-800">Step 2 of 3</span>
            <span className="text-slate-300">|</span>
            <span>Your Details & Payment</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-navy-700 h-1.5 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Your Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-navy-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Your Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" className={inputClass('firstName')} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" className={inputClass('lastName')} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@email.com" className={inputClass('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" className={inputClass('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Report Delivery */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-navy-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Report Delivery</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            The completed background check report will be delivered to the requesting employer.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Acme Corporation" className={inputClass('companyName')} />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employer Email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="deliveryEmail" value={form.deliveryEmail} onChange={handleChange} placeholder="hr@company.com" className={inputClass('deliveryEmail')} />
              {errors.deliveryEmail && <p className="text-red-500 text-xs mt-1">{errors.deliveryEmail}</p>}
              <p className="text-slate-400 text-xs mt-1">Report will be sent here</p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-navy-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Payment</h3>
          </div>

          {/* Price Line */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">Comprehensive Background Check</span>
            <span className={`text-sm font-semibold ${discountApplied ? 'text-slate-400 line-through' : 'text-slate-900'}`}>$10.00</span>
          </div>

          {discountApplied && (
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enterprise Discount
              </span>
              <span className="text-sm font-semibold text-emerald-600">-$5.00</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between py-4 mb-5">
            <span className="text-base font-bold text-slate-900">Total</span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900">${currentPrice}.00</span>
              {discountApplied && <p className="text-emerald-600 text-xs font-medium">You save $5.00</p>}
            </div>
          </div>

          {/* Enterprise Code */}
          <div className="mb-6">
            {!discountApplied ? (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Enterprise Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => { setDiscountCode(e.target.value); setDiscountError('') }}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 hover:border-slate-300"
                  />
                  <button
                    onClick={handleApplyCode}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  <span>{discountCode}</span>
                </div>
                <button onClick={handleRemoveCode} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer">
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 rounded-xl text-base font-bold tracking-wide bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting to payment...
              </span>
            ) : (
              `Pay $${currentPrice}.00 & Submit`
            )}
          </button>

          {paymentError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{paymentError}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          ← Back to Consent
        </button>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
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
