import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function IdentityPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefill = Object.fromEntries(searchParams.entries())

  const [form, setForm] = useState({
    firstName: prefill.firstName || '',
    middleName: '',
    lastName: prefill.lastName || '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idCountry: '',
    gender: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.dateOfBirth) e.dateOfBirth = 'Required'
    if (!form.nationality.trim()) e.nationality = 'Required'
    if (!form.idType) e.idType = 'Required'
    if (!form.idNumber.trim()) e.idNumber = 'Required'
    if (!form.idCountry.trim()) e.idCountry = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

  const handleContinue = () => {
    if (!validate()) return
    // Store data in sessionStorage so we can collect it at the end
    sessionStorage.setItem('verify_identity', JSON.stringify(form))
    navigate(`/verify/address?${searchParams.toString()}`)
  }

  return (
    <Layout step={2} totalSteps={11} stepLabel="Identity Verification">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Identity Verification</h2>
        <p className="text-slate-500 text-sm">Please provide your legal identity information exactly as it appears on your government-issued ID.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Legal Name</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" className={inputClass('firstName')} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Middle Name</label>
            <input type="text" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Michael" className={inputClass('middleName')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" className={inputClass('lastName')} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass('dateOfBirth')} />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nationality <span className="text-red-500">*</span></label>
            <input type="text" name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. American, British, Indian" className={inputClass('nationality')} />
            {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass('gender')}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">Government-Issued ID</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Type <span className="text-red-500">*</span></label>
            <select name="idType" value={form.idType} onChange={handleChange} className={inputClass('idType')}>
              <option value="">Select ID type</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID Card</option>
              <option value="drivers_license">Driver's License</option>
              <option value="residence_permit">Residence Permit</option>
              <option value="other">Other Government-Issued ID</option>
            </select>
            {errors.idType && <p className="text-red-500 text-xs mt-1">{errors.idType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Number <span className="text-red-500">*</span></label>
            <input type="text" name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="ID / Passport number" className={inputClass('idNumber')} />
            {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Issuing Country <span className="text-red-500">*</span></label>
            <input type="text" name="idCountry" value={form.idCountry} onChange={handleChange} placeholder="e.g. United States, United Kingdom" className={inputClass('idCountry')} />
            {errors.idCountry && <p className="text-red-500 text-xs mt-1">{errors.idCountry}</p>}
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          All ID information is encrypted and securely stored
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
