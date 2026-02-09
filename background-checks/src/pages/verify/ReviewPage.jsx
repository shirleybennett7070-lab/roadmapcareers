import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function ReviewPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({})

  useEffect(() => {
    setData({
      identity: JSON.parse(sessionStorage.getItem('verify_identity') || '{}'),
      addresses: JSON.parse(sessionStorage.getItem('verify_address') || '[]'),
      employment: JSON.parse(sessionStorage.getItem('verify_employment') || '[]'),
      education: JSON.parse(sessionStorage.getItem('verify_education') || '[]'),
      criminal: JSON.parse(sessionStorage.getItem('verify_criminal') || '{}'),
      additional: JSON.parse(sessionStorage.getItem('verify_additional') || '{}'),
      references: JSON.parse(sessionStorage.getItem('verify_references') || '[]'),
    })
  }, [])

  const Section = ({ title, icon, editPath, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <button onClick={() => navigate(editPath)} className="text-navy-700 hover:text-navy-900 text-xs font-semibold cursor-pointer">Edit</button>
      </div>
      {children}
    </div>
  )

  const Field = ({ label, value }) => (
    <div>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <p className="text-sm text-slate-800 font-medium mt-0.5">{value || '—'}</p>
    </div>
  )

  return (
    <Layout step={9} totalSteps={11} stepLabel="Review & Submit">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Review & Submit</h2>
        <p className="text-slate-500 text-sm">Please review all your information carefully before submitting. Click "Edit" on any section to make changes.</p>
      </div>

      {/* Identity */}
      <Section title="Identity Verification" icon="🪪" editPath="/verify/identity">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="First Name" value={data.identity?.firstName} />
          <Field label="Middle Name" value={data.identity?.middleName} />
          <Field label="Last Name" value={data.identity?.lastName} />
          <Field label="Date of Birth" value={data.identity?.dateOfBirth} />
          <Field label="Nationality" value={data.identity?.nationality} />
          <Field label="ID Type" value={data.identity?.idType} />
          <Field label="ID Number" value={data.identity?.idNumber} />
          <Field label="Issuing Country" value={data.identity?.idCountry} />
        </div>
      </Section>

      {/* Addresses */}
      <Section title="Address History" icon="🏠" editPath="/verify/address">
        <div className="space-y-3">
          {data.addresses?.map((addr, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{addr.street}{addr.apt ? `, ${addr.apt}` : ''}</p>
              <p className="text-xs text-slate-500">{addr.city}{addr.stateProvince ? `, ${addr.stateProvince}` : ''} {addr.postalCode}</p>
              <p className="text-xs text-slate-500">{addr.country}</p>
              <p className="text-xs text-slate-400 mt-1">{addr.fromDate} — {addr.current ? 'Present' : addr.toDate}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Employment */}
      <Section title="Employment History" icon="💼" editPath="/verify/employment">
        <div className="space-y-3">
          {data.employment?.map((job, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{job.jobTitle} at {job.employer}</p>
              <p className="text-xs text-slate-500">{job.city}{job.country ? `, ${job.country}` : ''}</p>
              <p className="text-xs text-slate-400 mt-1">{job.fromDate} — {job.current ? 'Present' : job.toDate}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="Education" icon="🎓" editPath="/verify/education">
        <div className="space-y-3">
          {data.education?.map((edu, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
              <p className="text-xs text-slate-500">{edu.institution}</p>
              <p className="text-xs text-slate-400 mt-1">{edu.fromDate} — {edu.toDate || 'Present'} {edu.graduated ? '(Graduated)' : ''}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Criminal History */}
      <Section title="Criminal History" icon="⚖️" editPath="/verify/criminal">
        <div className="space-y-1 text-sm">
          {[
            ['Prior convictions', data.criminal?.hasConvictions],
            ['Pending charges', data.criminal?.hasPending],
            ['Drug offenses', data.criminal?.hasDrugOffenses],
            ['DUI / DWI', data.criminal?.hasDUI],
            ['Fraud / financial crimes', data.criminal?.hasFraud],
            ['Domestic violence / assault', data.criminal?.hasDomesticViolence],
            ['Sex offenses', data.criminal?.hasSexOffenses],
            ['Restraining orders', data.criminal?.hasRestrainingOrders],
            ['Other arrests', data.criminal?.hasArrest],
            ['Probation / parole', data.criminal?.hasProbation],
            ['Prior terminations', data.criminal?.hasTerminations],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between p-2">
              <span className="text-slate-500">{label}</span>
              <span className={`font-medium ${val ? 'text-amber-600' : 'text-emerald-600'}`}>{val ? 'Yes' : 'No'}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Additional Info */}
      <Section title="Additional Information" icon="📄" editPath="/verify/additional">
        <div className="space-y-1 text-sm">
          {[
            ['Other names / aliases', data.additional?.hasAliases],
            ['Driver\'s license', data.additional?.hasDriversLicense],
            ['Professional licenses', data.additional?.hasLicenses],
            ['Military service', data.additional?.hasMilitary],
            ['Civil litigation', data.additional?.hasLitigation],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between p-2">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-700">{val ? 'Yes' : 'No'}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 mt-2 pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">International Trust & Compliance</p>
            <div className="flex justify-between p-2">
              <span className="text-slate-500">Work authorization</span>
              <span className="font-medium text-slate-700">{data.additional?.workAuth || '—'}</span>
            </div>
            {[
              ['Deportation / removal', data.additional?.hasDeportation],
              ['Visa denials', data.additional?.hasVisaDenial],
              ['Sanctions / watchlists', data.additional?.hasSanctions],
              ['Terrorism / extremism', data.additional?.hasTerrorism],
              ['Professional debarment', data.additional?.hasDebarment],
              ['Bankruptcy', data.additional?.hasBankruptcy],
              ['Outstanding debts / judgments', data.additional?.hasDebt],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between p-2">
                <span className="text-slate-500">{label}</span>
                <span className={`font-medium ${val ? 'text-amber-600' : 'text-emerald-600'}`}>{val ? 'Yes' : 'No'}</span>
              </div>
            ))}
            <div className="flex justify-between p-2">
              <span className="text-slate-500">English proficiency</span>
              <span className="font-medium text-slate-700">{data.additional?.englishProficiency || '—'}</span>
            </div>
            {data.additional?.countriesWorked && (
              <div className="flex justify-between p-2">
                <span className="text-slate-500">Countries lived/worked</span>
                <span className="font-medium text-slate-700">{data.additional.countriesWorked}</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* References */}
      <Section title="Professional References" icon="📋" editPath="/verify/references">
        <div className="space-y-3">
          {data.references?.map((ref, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{ref.fullName}</p>
              <p className="text-xs text-slate-500">{ref.relationship}{ref.company ? ` at ${ref.company}` : ''}</p>
              <p className="text-xs text-slate-400 mt-1">{ref.phone}{ref.phone && ref.email ? ' · ' : ''}{ref.email}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Certification */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-amber-800 text-sm font-semibold">Please verify all information is accurate</p>
          <p className="text-amber-700 text-xs mt-0.5">Submitting false or misleading information may result in disqualification from the hiring process.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button
          onClick={() => navigate('/verify/camera')}
          className="px-10 py-4 rounded-xl text-base font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          Continue to Photo Verification →
        </button>
      </div>
    </Layout>
  )
}
