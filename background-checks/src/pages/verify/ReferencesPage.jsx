import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyRef = () => ({
  fullName: '', relationship: '', company: '', phone: '', email: '', yearsKnown: '',
})

export default function ReferencesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [refs, setRefs] = useState([emptyRef(), emptyRef()])
  const [errors, setErrors] = useState({})

  const updateRef = (index, field, value) => {
    const updated = [...refs]
    updated[index] = { ...updated[index], [field]: value }
    setRefs(updated)
    if (errors[`${index}_${field}`]) {
      const e = { ...errors }
      delete e[`${index}_${field}`]
      setErrors(e)
    }
  }

  const addRef = () => setRefs([...refs, emptyRef()])
  const removeRef = (i) => { if (refs.length > 2) setRefs(refs.filter((_, idx) => idx !== i)) }

  const validate = () => {
    const e = {}
    refs.forEach((ref, i) => {
      if (!ref.fullName.trim()) e[`${i}_fullName`] = 'Required'
      if (!ref.relationship.trim()) e[`${i}_relationship`] = 'Required'
      if (!ref.phone.trim() && !ref.email.trim()) e[`${i}_contact`] = 'Phone or email required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

  const handleContinue = () => {
    if (!validate()) return
    sessionStorage.setItem('verify_references', JSON.stringify(refs))
    navigate(`/verify/review?${searchParams.toString()}`)
  }

  return (
    <Layout step={8} totalSteps={11} stepLabel="Professional References">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Professional References</h2>
        <p className="text-slate-500 text-sm">Provide at least 2 professional references who can verify your work history and character.</p>
      </div>

      {refs.map((ref, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">📋 Reference #{i + 1}</h3>
            {refs.length > 2 && (
              <button onClick={() => removeRef(i)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={ref.fullName} onChange={(e) => updateRef(i, 'fullName', e.target.value)} placeholder="Jane Smith" className={inputClass(`${i}_fullName`)} />
              {errors[`${i}_fullName`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_fullName`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Relationship <span className="text-red-500">*</span></label>
              <input type="text" value={ref.relationship} onChange={(e) => updateRef(i, 'relationship', e.target.value)} placeholder="Former Manager" className={inputClass(`${i}_relationship`)} />
              {errors[`${i}_relationship`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_relationship`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
              <input type="text" value={ref.company} onChange={(e) => updateRef(i, 'company', e.target.value)} placeholder="Company Inc." className={inputClass(`${i}_company`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Years Known</label>
              <input type="text" value={ref.yearsKnown} onChange={(e) => updateRef(i, 'yearsKnown', e.target.value)} placeholder="3 years" className={inputClass(`${i}_yearsKnown`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" value={ref.phone} onChange={(e) => updateRef(i, 'phone', e.target.value)} placeholder="(555) 123-4567" className={inputClass(`${i}_phone`)} />
              {errors[`${i}_contact`] && !ref.email && <p className="text-red-500 text-xs mt-1">{errors[`${i}_contact`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" value={ref.email} onChange={(e) => updateRef(i, 'email', e.target.value)} placeholder="jane@company.com" className={inputClass(`${i}_email`)} />
              {errors[`${i}_contact`] && !ref.phone && <p className="text-red-500 text-xs mt-1">{errors[`${i}_contact`]}</p>}
            </div>
          </div>
        </div>
      ))}

      <button onClick={addRef} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-8">
        + Add Another Reference
      </button>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
