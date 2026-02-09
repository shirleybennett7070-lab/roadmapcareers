import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyJob = () => ({
  employer: '', jobTitle: '', city: '', country: '', fromDate: '', toDate: '', current: false, reasonForLeaving: '', supervisorName: '', supervisorEmail: '',
})

export default function EmploymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([{ ...emptyJob(), current: true, toDate: 'Present' }])
  const [errors, setErrors] = useState({})

  const updateJob = (index, field, value) => {
    const updated = [...jobs]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'current' && value) updated[index].toDate = 'Present'
    setJobs(updated)
    if (errors[`${index}_${field}`]) {
      const e = { ...errors }
      delete e[`${index}_${field}`]
      setErrors(e)
    }
  }

  const addJob = () => setJobs([...jobs, emptyJob()])
  const removeJob = (i) => { if (jobs.length > 1) setJobs(jobs.filter((_, idx) => idx !== i)) }

  const validate = () => {
    const e = {}
    jobs.forEach((job, i) => {
      if (!job.employer.trim()) e[`${i}_employer`] = 'Required'
      if (!job.jobTitle.trim()) e[`${i}_jobTitle`] = 'Required'
      if (!job.fromDate) e[`${i}_fromDate`] = 'Required'
      if (!job.current && !job.toDate) e[`${i}_toDate`] = 'Required'
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
    sessionStorage.setItem('verify_employment', JSON.stringify(jobs))
    navigate(`/verify/education?${searchParams.toString()}`)
  }

  return (
    <Layout step={4} totalSteps={11} stepLabel="Employment History">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Employment History</h2>
        <p className="text-slate-500 text-sm">List your employment history starting with your most recent or current position.</p>
      </div>

      {jobs.map((job, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">
              {job.current ? '💼 Current Employer' : `Previous Employer ${i}`}
            </h3>
            {!job.current && jobs.length > 1 && (
              <button onClick={() => removeJob(i)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employer Name <span className="text-red-500">*</span></label>
              <input type="text" value={job.employer} onChange={(e) => updateJob(i, 'employer', e.target.value)} placeholder="Company Inc." className={inputClass(`${i}_employer`)} />
              {errors[`${i}_employer`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_employer`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input type="text" value={job.jobTitle} onChange={(e) => updateJob(i, 'jobTitle', e.target.value)} placeholder="Software Engineer" className={inputClass(`${i}_jobTitle`)} />
              {errors[`${i}_jobTitle`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_jobTitle`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City / Town</label>
              <input type="text" value={job.city} onChange={(e) => updateJob(i, 'city', e.target.value)} placeholder="e.g. London, Toronto, Mumbai" className={inputClass(`${i}_city`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
              <input type="text" value={job.country} onChange={(e) => updateJob(i, 'country', e.target.value)} placeholder="e.g. United States, United Kingdom" className={inputClass(`${i}_country`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date <span className="text-red-500">*</span></label>
              <input type="month" value={job.fromDate} onChange={(e) => updateJob(i, 'fromDate', e.target.value)} className={inputClass(`${i}_fromDate`)} />
              {errors[`${i}_fromDate`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_fromDate`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date {!job.current && <span className="text-red-500">*</span>}</label>
              {job.current ? (
                <div className="px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">Present</div>
              ) : (
                <>
                  <input type="month" value={job.toDate} onChange={(e) => updateJob(i, 'toDate', e.target.value)} className={inputClass(`${i}_toDate`)} />
                  {errors[`${i}_toDate`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_toDate`]}</p>}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervisor Name</label>
              <input type="text" value={job.supervisorName} onChange={(e) => updateJob(i, 'supervisorName', e.target.value)} placeholder="Jane Smith" className={inputClass(`${i}_supervisorName`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Supervisor Email</label>
              <input type="email" value={job.supervisorEmail} onChange={(e) => updateJob(i, 'supervisorEmail', e.target.value)} placeholder="supervisor@company.com" className={inputClass(`${i}_supervisorEmail`)} />
            </div>
            {!job.current && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Leaving</label>
                <input type="text" value={job.reasonForLeaving} onChange={(e) => updateJob(i, 'reasonForLeaving', e.target.value)} placeholder="Career advancement" className={inputClass(`${i}_reasonForLeaving`)} />
              </div>
            )}
          </div>
        </div>
      ))}

      <button onClick={addJob} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-8">
        + Add Another Employer
      </button>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
