import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyEducation = () => ({
  institution: '', degree: '', fieldOfStudy: '', city: '', state: '', fromDate: '', toDate: '', graduated: true,
})

const DEGREE_TYPES = ['High School Diploma / GED', 'Associate\'s Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate / PhD', 'Professional Degree (JD, MD)', 'Trade / Vocational Certificate', 'Other']

export default function EducationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [entries, setEntries] = useState([emptyEducation()])
  const [errors, setErrors] = useState({})

  const update = (index, field, value) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    setEntries(updated)
    if (errors[`${index}_${field}`]) {
      const e = { ...errors }
      delete e[`${index}_${field}`]
      setErrors(e)
    }
  }

  const addEntry = () => setEntries([...entries, emptyEducation()])
  const removeEntry = (i) => { if (entries.length > 1) setEntries(entries.filter((_, idx) => idx !== i)) }

  const validate = () => {
    const e = {}
    entries.forEach((entry, i) => {
      if (!entry.institution.trim()) e[`${i}_institution`] = 'Required'
      if (!entry.degree) e[`${i}_degree`] = 'Required'
      if (!entry.fromDate) e[`${i}_fromDate`] = 'Required'
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
    sessionStorage.setItem('verify_education', JSON.stringify(entries))
    navigate(`/verify/criminal?${searchParams.toString()}`)
  }

  return (
    <Layout step={5} totalSteps={11} stepLabel="Education Verification">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Education Verification</h2>
        <p className="text-slate-500 text-sm">Provide details about your educational background, starting with the highest level of education.</p>
      </div>

      {entries.map((entry, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">🎓 Education {entries.length > 1 ? `#${i + 1}` : ''}</h3>
            {entries.length > 1 && (
              <button onClick={() => removeEntry(i)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution Name <span className="text-red-500">*</span></label>
              <input type="text" value={entry.institution} onChange={(e) => update(i, 'institution', e.target.value)} placeholder="University of..." className={inputClass(`${i}_institution`)} />
              {errors[`${i}_institution`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_institution`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Degree Type <span className="text-red-500">*</span></label>
              <select value={entry.degree} onChange={(e) => update(i, 'degree', e.target.value)} className={inputClass(`${i}_degree`)}>
                <option value="">Select degree</option>
                {DEGREE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors[`${i}_degree`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_degree`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Field of Study</label>
              <input type="text" value={entry.fieldOfStudy} onChange={(e) => update(i, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" className={inputClass(`${i}_fieldOfStudy`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
              <input type="text" value={entry.city} onChange={(e) => update(i, 'city', e.target.value)} placeholder="Boston" className={inputClass(`${i}_city`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
              <input type="text" value={entry.state} onChange={(e) => update(i, 'state', e.target.value)} placeholder="MA" className={inputClass(`${i}_state`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date <span className="text-red-500">*</span></label>
              <input type="month" value={entry.fromDate} onChange={(e) => update(i, 'fromDate', e.target.value)} className={inputClass(`${i}_fromDate`)} />
              {errors[`${i}_fromDate`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_fromDate`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Graduation Date</label>
              <input type="month" value={entry.toDate} onChange={(e) => update(i, 'toDate', e.target.value)} className={inputClass(`${i}_toDate`)} />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={entry.graduated} onChange={(e) => update(i, 'graduated', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500" />
                <span className="text-sm text-slate-700">I graduated / completed this program</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-8">
        + Add Another Education
      </button>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
