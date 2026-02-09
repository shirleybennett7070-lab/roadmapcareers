import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyAlias = () => ({ name: '', reason: '' })
const emptyLicense = () => ({ type: '', number: '', issuingBody: '', country: '', expiryDate: '', status: '' })

export default function AdditionalInfoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Aliases
  const [hasAliases, setHasAliases] = useState(null)
  const [aliases, setAliases] = useState([emptyAlias()])

  // Driving
  const [hasDriversLicense, setHasDriversLicense] = useState(null)
  const [drivingInfo, setDrivingInfo] = useState({ licenseNumber: '', issuingCountry: '', hasViolations: null, violationDetails: '' })

  // Professional Licenses
  const [hasLicenses, setHasLicenses] = useState(null)
  const [licenses, setLicenses] = useState([emptyLicense()])

  // Military
  const [hasMilitary, setHasMilitary] = useState(null)
  const [militaryInfo, setMilitaryInfo] = useState({ branch: '', country: '', rank: '', fromDate: '', toDate: '', dischargeType: '' })

  // Civil Litigation
  const [hasLitigation, setHasLitigation] = useState(null)
  const [litigationDetails, setLitigationDetails] = useState('')

  // International / Trust & Compliance
  const [workAuth, setWorkAuth] = useState('')
  const [workAuthDetails, setWorkAuthDetails] = useState('')
  const [hasDeportation, setHasDeportation] = useState(null)
  const [deportationDetails, setDeportationDetails] = useState('')
  const [hasVisaDenial, setHasVisaDenial] = useState(null)
  const [visaDenialDetails, setVisaDenialDetails] = useState('')
  const [hasSanctions, setHasSanctions] = useState(null)
  const [sanctionsDetails, setSanctionsDetails] = useState('')
  const [hasTerrorism, setHasTerrorism] = useState(null)
  const [terrorismDetails, setTerrorismDetails] = useState('')
  const [hasDebarment, setHasDebarment] = useState(null)
  const [debarmentDetails, setDebarmentDetails] = useState('')
  const [hasBankruptcy, setHasBankruptcy] = useState(null)
  const [bankruptcyDetails, setBankruptcyDetails] = useState('')
  const [hasDebt, setHasDebt] = useState(null)
  const [debtDetails, setDebtDetails] = useState('')
  const [englishProficiency, setEnglishProficiency] = useState('')
  const [countriesWorked, setCountriesWorked] = useState('')
  const [socialMediaHandles, setSocialMediaHandles] = useState({ linkedin: '', other: '' })

  const [errors, setErrors] = useState({})

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

  const YesNoToggle = ({ value, onChange, error }) => (
    <div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={() => onChange(true)} className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${value === true ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>Yes</button>
        <button type="button" onClick={() => onChange(false)} className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${value === false ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>No</button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  const validate = () => {
    const e = {}
    if (hasAliases === null) e.hasAliases = 'Please select an option'
    if (hasDriversLicense === null) e.hasDriversLicense = 'Please select an option'
    if (hasLicenses === null) e.hasLicenses = 'Please select an option'
    if (hasMilitary === null) e.hasMilitary = 'Please select an option'
    if (hasLitigation === null) e.hasLitigation = 'Please select an option'

    if (hasAliases) {
      aliases.forEach((a, i) => {
        if (!a.name.trim()) e[`alias_${i}_name`] = 'Required'
      })
    }

    if (hasDriversLicense) {
      if (!drivingInfo.licenseNumber.trim()) e.dl_number = 'Required'
      if (!drivingInfo.issuingCountry.trim()) e.dl_country = 'Required'
      if (drivingInfo.hasViolations === null) e.dl_violations = 'Please select'
      if (drivingInfo.hasViolations && !drivingInfo.violationDetails.trim()) e.dl_violationDetails = 'Please provide details'
    }

    if (hasLicenses) {
      licenses.forEach((l, i) => {
        if (!l.type.trim()) e[`lic_${i}_type`] = 'Required'
        if (!l.issuingBody.trim()) e[`lic_${i}_issuingBody`] = 'Required'
      })
    }

    if (hasMilitary) {
      if (!militaryInfo.branch.trim()) e.mil_branch = 'Required'
      if (!militaryInfo.country.trim()) e.mil_country = 'Required'
    }

    if (hasLitigation && !litigationDetails.trim()) e.litigationDetails = 'Please provide details'

    // International / Trust
    if (!workAuth) e.workAuth = 'Please select an option'
    if (workAuth === 'visa' && !workAuthDetails.trim()) e.workAuthDetails = 'Please specify visa type'
    if (hasDeportation === null) e.hasDeportation = 'Please select an option'
    if (hasDeportation && !deportationDetails.trim()) e.deportationDetails = 'Please provide details'
    if (hasVisaDenial === null) e.hasVisaDenial = 'Please select an option'
    if (hasVisaDenial && !visaDenialDetails.trim()) e.visaDenialDetails = 'Please provide details'
    if (hasSanctions === null) e.hasSanctions = 'Please select an option'
    if (hasSanctions && !sanctionsDetails.trim()) e.sanctionsDetails = 'Please provide details'
    if (hasTerrorism === null) e.hasTerrorism = 'Please select an option'
    if (hasTerrorism && !terrorismDetails.trim()) e.terrorismDetails = 'Please provide details'
    if (hasDebarment === null) e.hasDebarment = 'Please select an option'
    if (hasDebarment && !debarmentDetails.trim()) e.debarmentDetails = 'Please provide details'
    if (hasBankruptcy === null) e.hasBankruptcy = 'Please select an option'
    if (hasBankruptcy && !bankruptcyDetails.trim()) e.bankruptcyDetails = 'Please provide details'
    if (hasDebt === null) e.hasDebt = 'Please select an option'
    if (hasDebt && !debtDetails.trim()) e.debtDetails = 'Please provide details'
    if (!englishProficiency) e.englishProficiency = 'Please select an option'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    sessionStorage.setItem('verify_additional', JSON.stringify({
      hasAliases, aliases: hasAliases ? aliases : [],
      hasDriversLicense, drivingInfo: hasDriversLicense ? drivingInfo : {},
      hasLicenses, licenses: hasLicenses ? licenses : [],
      hasMilitary, militaryInfo: hasMilitary ? militaryInfo : {},
      hasLitigation, litigationDetails: hasLitigation ? litigationDetails : '',
      workAuth, workAuthDetails,
      hasDeportation, deportationDetails: hasDeportation ? deportationDetails : '',
      hasVisaDenial, visaDenialDetails: hasVisaDenial ? visaDenialDetails : '',
      hasSanctions, sanctionsDetails: hasSanctions ? sanctionsDetails : '',
      hasTerrorism, terrorismDetails: hasTerrorism ? terrorismDetails : '',
      hasDebarment, debarmentDetails: hasDebarment ? debarmentDetails : '',
      hasBankruptcy, bankruptcyDetails: hasBankruptcy ? bankruptcyDetails : '',
      hasDebt, debtDetails: hasDebt ? debtDetails : '',
      englishProficiency,
      countriesWorked,
      socialMediaHandles,
    }))
    navigate(`/verify/references?${searchParams.toString()}`)
  }

  return (
    <Layout step={7} totalSteps={11} stepLabel="Additional Information">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Additional Information</h2>
        <p className="text-slate-500 text-sm">Please answer the following questions to complete your background verification.</p>
      </div>

      {/* Aliases */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever used any other names, aliases, or maiden names?</h3>
        <p className="text-xs text-slate-400 mb-3">Include name changes due to marriage, legal name changes, nicknames used professionally, etc.</p>
        <YesNoToggle value={hasAliases} onChange={setHasAliases} error={errors.hasAliases} />
        {hasAliases && (
          <div className="mt-5 space-y-3">
            {aliases.map((alias, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={alias.name} onChange={(e) => { const u = [...aliases]; u[i] = { ...u[i], name: e.target.value }; setAliases(u) }} placeholder="Previous or alternate name" className={inputClass(`alias_${i}_name`)} />
                    {errors[`alias_${i}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`alias_${i}_name`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Name</label>
                    <input type="text" value={alias.reason} onChange={(e) => { const u = [...aliases]; u[i] = { ...u[i], reason: e.target.value }; setAliases(u) }} placeholder="e.g. Maiden name, Legal change" className={inputClass(`alias_${i}_reason`)} />
                  </div>
                </div>
                {aliases.length > 1 && (
                  <button onClick={() => setAliases(aliases.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer mt-2">Remove</button>
                )}
              </div>
            ))}
            <button onClick={() => setAliases([...aliases, emptyAlias()])} className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-slate-400 cursor-pointer">+ Add Another Name</button>
          </div>
        )}
      </div>

      {/* Driving Record */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Do you hold a valid driver's license?</h3>
        <p className="text-xs text-slate-400 mb-3">If applicable to the position you are applying for.</p>
        <YesNoToggle value={hasDriversLicense} onChange={setHasDriversLicense} error={errors.hasDriversLicense} />
        {hasDriversLicense && (
          <div className="mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">License Number <span className="text-red-500">*</span></label>
                <input type="text" value={drivingInfo.licenseNumber} onChange={(e) => setDrivingInfo({ ...drivingInfo, licenseNumber: e.target.value })} placeholder="License number" className={inputClass('dl_number')} />
                {errors.dl_number && <p className="text-red-500 text-xs mt-1">{errors.dl_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Issuing Country <span className="text-red-500">*</span></label>
                <input type="text" value={drivingInfo.issuingCountry} onChange={(e) => setDrivingInfo({ ...drivingInfo, issuingCountry: e.target.value })} placeholder="e.g. United States, Canada" className={inputClass('dl_country')} />
                {errors.dl_country && <p className="text-red-500 text-xs mt-1">{errors.dl_country}</p>}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Have you had any driving violations, suspensions, or DUIs in the past 7 years?</h4>
              <YesNoToggle value={drivingInfo.hasViolations} onChange={(v) => setDrivingInfo({ ...drivingInfo, hasViolations: v })} error={errors.dl_violations} />
              {drivingInfo.hasViolations && (
                <div className="mt-3">
                  <textarea value={drivingInfo.violationDetails} onChange={(e) => setDrivingInfo({ ...drivingInfo, violationDetails: e.target.value })} placeholder="Describe violations, suspensions, or DUI incidents including dates and outcomes" rows={3} className={inputClass('dl_violationDetails')} />
                  {errors.dl_violationDetails && <p className="text-red-500 text-xs mt-1">{errors.dl_violationDetails}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Licenses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Do you hold any professional licenses or certifications?</h3>
        <p className="text-xs text-slate-400 mb-3">e.g. CPA, Medical License, Bar Admission, Teaching Certificate, etc.</p>
        <YesNoToggle value={hasLicenses} onChange={setHasLicenses} error={errors.hasLicenses} />
        {hasLicenses && (
          <div className="mt-5 space-y-3">
            {licenses.map((lic, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">License / Certification Type <span className="text-red-500">*</span></label>
                    <input type="text" value={lic.type} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], type: e.target.value }; setLicenses(u) }} placeholder="e.g. CPA, RN, Bar License" className={inputClass(`lic_${i}_type`)} />
                    {errors[`lic_${i}_type`] && <p className="text-red-500 text-xs mt-1">{errors[`lic_${i}_type`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                    <input type="text" value={lic.number} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], number: e.target.value }; setLicenses(u) }} placeholder="License number" className={inputClass(`lic_${i}_number`)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Issuing Body <span className="text-red-500">*</span></label>
                    <input type="text" value={lic.issuingBody} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], issuingBody: e.target.value }; setLicenses(u) }} placeholder="e.g. State Board, Professional Body" className={inputClass(`lic_${i}_issuingBody`)} />
                    {errors[`lic_${i}_issuingBody`] && <p className="text-red-500 text-xs mt-1">{errors[`lic_${i}_issuingBody`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input type="text" value={lic.country} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], country: e.target.value }; setLicenses(u) }} placeholder="e.g. United States" className={inputClass(`lic_${i}_country`)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input type="month" value={lic.expiryDate} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], expiryDate: e.target.value }; setLicenses(u) }} className={inputClass(`lic_${i}_expiryDate`)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select value={lic.status} onChange={(e) => { const u = [...licenses]; u[i] = { ...u[i], status: e.target.value }; setLicenses(u) }} className={inputClass(`lic_${i}_status`)}>
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                      <option value="revoked">Revoked</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                {licenses.length > 1 && (
                  <button onClick={() => setLicenses(licenses.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer mt-2">Remove</button>
                )}
              </div>
            ))}
            <button onClick={() => setLicenses([...licenses, emptyLicense()])} className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-slate-400 cursor-pointer">+ Add Another License</button>
          </div>
        )}
      </div>

      {/* Military Service */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you served in the military or armed forces of any country?</h3>
        <YesNoToggle value={hasMilitary} onChange={setHasMilitary} error={errors.hasMilitary} />
        {hasMilitary && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch / Service <span className="text-red-500">*</span></label>
              <input type="text" value={militaryInfo.branch} onChange={(e) => setMilitaryInfo({ ...militaryInfo, branch: e.target.value })} placeholder="e.g. Army, Navy, Air Force" className={inputClass('mil_branch')} />
              {errors.mil_branch && <p className="text-red-500 text-xs mt-1">{errors.mil_branch}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country <span className="text-red-500">*</span></label>
              <input type="text" value={militaryInfo.country} onChange={(e) => setMilitaryInfo({ ...militaryInfo, country: e.target.value })} placeholder="e.g. United States" className={inputClass('mil_country')} />
              {errors.mil_country && <p className="text-red-500 text-xs mt-1">{errors.mil_country}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rank at Separation</label>
              <input type="text" value={militaryInfo.rank} onChange={(e) => setMilitaryInfo({ ...militaryInfo, rank: e.target.value })} placeholder="e.g. Sergeant, Lieutenant" className={inputClass('mil_rank')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Discharge Type</label>
              <select value={militaryInfo.dischargeType} onChange={(e) => setMilitaryInfo({ ...militaryInfo, dischargeType: e.target.value })} className={inputClass('mil_discharge')}>
                <option value="">Select</option>
                <option value="honorable">Honorable</option>
                <option value="general">General (Under Honorable Conditions)</option>
                <option value="other_than_honorable">Other Than Honorable</option>
                <option value="bad_conduct">Bad Conduct</option>
                <option value="dishonorable">Dishonorable</option>
                <option value="still_serving">Still Serving</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date</label>
              <input type="month" value={militaryInfo.fromDate} onChange={(e) => setMilitaryInfo({ ...militaryInfo, fromDate: e.target.value })} className={inputClass('mil_from')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date</label>
              <input type="month" value={militaryInfo.toDate} onChange={(e) => setMilitaryInfo({ ...militaryInfo, toDate: e.target.value })} className={inputClass('mil_to')} />
            </div>
          </div>
        )}
      </div>

      {/* Civil Litigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Are you currently involved in, or have you been involved in, any civil litigation or lawsuits?</h3>
        <p className="text-xs text-slate-400 mb-3">Include any cases where you were a plaintiff, defendant, or party to the action.</p>
        <YesNoToggle value={hasLitigation} onChange={setHasLitigation} error={errors.hasLitigation} />
        {hasLitigation && (
          <div className="mt-5">
            <textarea value={litigationDetails} onChange={(e) => { setLitigationDetails(e.target.value); if (errors.litigationDetails) setErrors({ ...errors, litigationDetails: '' }) }} placeholder="Describe the case(s), including parties involved, dates, jurisdiction, and current status" rows={3} className={inputClass('litigationDetails')} />
            {errors.litigationDetails && <p className="text-red-500 text-xs mt-1">{errors.litigationDetails}</p>}
          </div>
        )}
      </div>

      {/* === International Trust & Compliance === */}
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-navy-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <h3 className="text-lg font-bold text-slate-900">International Trust & Compliance</h3>
        </div>
        <p className="text-slate-500 text-sm">The following questions are required for candidates working with US-based companies.</p>
      </div>

      {/* Work Authorization */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">What is your current work authorization status? <span className="text-red-500">*</span></h3>
        <p className="text-xs text-slate-400 mb-3">Select the option that best describes your ability to legally work for a US company.</p>
        <select value={workAuth} onChange={(e) => { setWorkAuth(e.target.value); if (errors.workAuth) setErrors({ ...errors, workAuth: '' }) }} className={inputClass('workAuth')}>
          <option value="">Select</option>
          <option value="us_citizen">US Citizen</option>
          <option value="permanent_resident">US Permanent Resident (Green Card)</option>
          <option value="visa">Work Visa (H-1B, L-1, O-1, etc.)</option>
          <option value="ead">Employment Authorization Document (EAD)</option>
          <option value="remote_international">Working remotely from outside the US</option>
          <option value="contractor">Independent contractor (non-US based)</option>
          <option value="other">Other</option>
        </select>
        {errors.workAuth && <p className="text-red-500 text-xs mt-1">{errors.workAuth}</p>}
        {workAuth === 'visa' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Visa type and expiry date <span className="text-red-500">*</span></label>
            <input type="text" value={workAuthDetails} onChange={(e) => { setWorkAuthDetails(e.target.value); if (errors.workAuthDetails) setErrors({ ...errors, workAuthDetails: '' }) }} placeholder="e.g. H-1B, expires December 2027" className={inputClass('workAuthDetails')} />
            {errors.workAuthDetails && <p className="text-red-500 text-xs mt-1">{errors.workAuthDetails}</p>}
          </div>
        )}
        {workAuth === 'other' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please describe</label>
            <input type="text" value={workAuthDetails} onChange={(e) => setWorkAuthDetails(e.target.value)} placeholder="Describe your work authorization" className={inputClass('workAuthDetails_other')} />
          </div>
        )}
      </div>

      {/* Deportation / Removal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been deported, removed, or excluded from any country?</h3>
        <p className="text-xs text-slate-400 mb-3">Include voluntary departures under a deportation order.</p>
        <YesNoToggle value={hasDeportation} onChange={setHasDeportation} error={errors.hasDeportation} />
        {hasDeportation && (
          <div className="mt-5">
            <textarea value={deportationDetails} onChange={(e) => { setDeportationDetails(e.target.value); if (errors.deportationDetails) setErrors({ ...errors, deportationDetails: '' }) }} placeholder="Include country, date, and circumstances" rows={3} className={inputClass('deportationDetails')} />
            {errors.deportationDetails && <p className="text-red-500 text-xs mt-1">{errors.deportationDetails}</p>}
          </div>
        )}
      </div>

      {/* Visa Denials */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been denied a visa, entry, or work permit to any country?</h3>
        <YesNoToggle value={hasVisaDenial} onChange={setHasVisaDenial} error={errors.hasVisaDenial} />
        {hasVisaDenial && (
          <div className="mt-5">
            <textarea value={visaDenialDetails} onChange={(e) => { setVisaDenialDetails(e.target.value); if (errors.visaDenialDetails) setErrors({ ...errors, visaDenialDetails: '' }) }} placeholder="Include country, visa type, date, and reason for denial" rows={3} className={inputClass('visaDenialDetails')} />
            {errors.visaDenialDetails && <p className="text-red-500 text-xs mt-1">{errors.visaDenialDetails}</p>}
          </div>
        )}
      </div>

      {/* Sanctions / Watchlists */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Are you, or have you ever been, listed on any government sanctions list, watchlist, or denied persons list?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes OFAC SDN, UN sanctions, EU sanctions, or any equivalent national list.</p>
        <YesNoToggle value={hasSanctions} onChange={setHasSanctions} error={errors.hasSanctions} />
        {hasSanctions && (
          <div className="mt-5">
            <textarea value={sanctionsDetails} onChange={(e) => { setSanctionsDetails(e.target.value); if (errors.sanctionsDetails) setErrors({ ...errors, sanctionsDetails: '' }) }} placeholder="Include which list, reason, dates, and current status" rows={3} className={inputClass('sanctionsDetails')} />
            {errors.sanctionsDetails && <p className="text-red-500 text-xs mt-1">{errors.sanctionsDetails}</p>}
          </div>
        )}
      </div>

      {/* Terrorism / Extremism */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been associated with, charged with, or investigated for terrorism, espionage, or extremist activities?</h3>
        <YesNoToggle value={hasTerrorism} onChange={setHasTerrorism} error={errors.hasTerrorism} />
        {hasTerrorism && (
          <div className="mt-5">
            <textarea value={terrorismDetails} onChange={(e) => { setTerrorismDetails(e.target.value); if (errors.terrorismDetails) setErrors({ ...errors, terrorismDetails: '' }) }} placeholder="Provide details including dates, countries, and outcome" rows={3} className={inputClass('terrorismDetails')} />
            {errors.terrorismDetails && <p className="text-red-500 text-xs mt-1">{errors.terrorismDetails}</p>}
          </div>
        )}
      </div>

      {/* Professional Debarment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been debarred, suspended, or prohibited from working in any industry or profession?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes bans by regulatory bodies, professional organizations, or government agencies in any country.</p>
        <YesNoToggle value={hasDebarment} onChange={setHasDebarment} error={errors.hasDebarment} />
        {hasDebarment && (
          <div className="mt-5">
            <textarea value={debarmentDetails} onChange={(e) => { setDebarmentDetails(e.target.value); if (errors.debarmentDetails) setErrors({ ...errors, debarmentDetails: '' }) }} placeholder="Include the industry/profession, issuing body, country, date, and reason" rows={3} className={inputClass('debarmentDetails')} />
            {errors.debarmentDetails && <p className="text-red-500 text-xs mt-1">{errors.debarmentDetails}</p>}
          </div>
        )}
      </div>

      {/* Bankruptcy */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever filed for bankruptcy or been declared insolvent in any country?</h3>
        <YesNoToggle value={hasBankruptcy} onChange={setHasBankruptcy} error={errors.hasBankruptcy} />
        {hasBankruptcy && (
          <div className="mt-5">
            <textarea value={bankruptcyDetails} onChange={(e) => { setBankruptcyDetails(e.target.value); if (errors.bankruptcyDetails) setErrors({ ...errors, bankruptcyDetails: '' }) }} placeholder="Include country, date, type (personal/business), and current status (discharged, active, etc.)" rows={3} className={inputClass('bankruptcyDetails')} />
            {errors.bankruptcyDetails && <p className="text-red-500 text-xs mt-1">{errors.bankruptcyDetails}</p>}
          </div>
        )}
      </div>

      {/* Outstanding Debt / Judgments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Do you have any outstanding court judgments, liens, or significant unpaid debts?</h3>
        <p className="text-xs text-slate-400 mb-3">Relevant for positions involving financial responsibility or access to funds.</p>
        <YesNoToggle value={hasDebt} onChange={setHasDebt} error={errors.hasDebt} />
        {hasDebt && (
          <div className="mt-5">
            <textarea value={debtDetails} onChange={(e) => { setDebtDetails(e.target.value); if (errors.debtDetails) setErrors({ ...errors, debtDetails: '' }) }} placeholder="Include type of debt, approximate amount, creditor, and status" rows={3} className={inputClass('debtDetails')} />
            {errors.debtDetails && <p className="text-red-500 text-xs mt-1">{errors.debtDetails}</p>}
          </div>
        )}
      </div>

      {/* English Proficiency */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">What is your English language proficiency level? <span className="text-red-500">*</span></h3>
        <select value={englishProficiency} onChange={(e) => { setEnglishProficiency(e.target.value); if (errors.englishProficiency) setErrors({ ...errors, englishProficiency: '' }) }} className={`mt-2 ${inputClass('englishProficiency')}`}>
          <option value="">Select</option>
          <option value="native">Native / Bilingual</option>
          <option value="fluent">Fluent (professional working proficiency)</option>
          <option value="advanced">Advanced (can work independently in English)</option>
          <option value="intermediate">Intermediate (can communicate but may need support)</option>
          <option value="basic">Basic (limited working ability)</option>
        </select>
        {errors.englishProficiency && <p className="text-red-500 text-xs mt-1">{errors.englishProficiency}</p>}
      </div>

      {/* Countries Worked */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">List all countries where you have lived or worked in the past 10 years</h3>
        <p className="text-xs text-slate-400 mb-3">Helps us verify international records. Separate with commas.</p>
        <input type="text" value={countriesWorked} onChange={(e) => setCountriesWorked(e.target.value)} placeholder="e.g. United States, India, United Kingdom, Philippines" className={inputClass('countriesWorked')} />
      </div>

      {/* Social Media / Online Presence */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Professional online presence</h3>
        <p className="text-xs text-slate-400 mb-3">Optional — helps verify your professional identity and work history.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn Profile URL</label>
            <input type="url" value={socialMediaHandles.linkedin} onChange={(e) => setSocialMediaHandles({ ...socialMediaHandles, linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" className={inputClass('sm_linkedin')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Other professional profile</label>
            <input type="url" value={socialMediaHandles.other} onChange={(e) => setSocialMediaHandles({ ...socialMediaHandles, other: e.target.value })} placeholder="Portfolio, GitHub, personal website, etc." className={inputClass('sm_other')} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
