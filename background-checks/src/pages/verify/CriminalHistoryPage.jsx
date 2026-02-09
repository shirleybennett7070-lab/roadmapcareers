import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyOffense = () => ({
  offenseType: '', description: '', date: '', city: '', country: '', outcome: '', sentence: '',
})

export default function CriminalHistoryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [hasConvictions, setHasConvictions] = useState(null)
  const [hasPending, setHasPending] = useState(null)
  const [hasDrugOffenses, setHasDrugOffenses] = useState(null)
  const [drugDetails, setDrugDetails] = useState('')
  const [hasDUI, setHasDUI] = useState(null)
  const [duiDetails, setDuiDetails] = useState('')
  const [hasFraud, setHasFraud] = useState(null)
  const [fraudDetails, setFraudDetails] = useState('')
  const [hasDomesticViolence, setHasDomesticViolence] = useState(null)
  const [domesticDetails, setDomesticDetails] = useState('')
  const [hasSexOffenses, setHasSexOffenses] = useState(null)
  const [sexOffenseDetails, setSexOffenseDetails] = useState('')
  const [hasRestrainingOrders, setHasRestrainingOrders] = useState(null)
  const [restrainingDetails, setRestrainingDetails] = useState('')
  const [hasArrest, setHasArrest] = useState(null)
  const [arrestDetails, setArrestDetails] = useState('')
  const [hasProbation, setHasProbation] = useState(null)
  const [probationDetails, setProbationDetails] = useState('')
  const [hasTerminations, setHasTerminations] = useState(null)
  const [terminationDetails, setTerminationDetails] = useState('')
  const [convictions, setConvictions] = useState([emptyOffense()])
  const [pendingCharges, setPendingCharges] = useState([emptyOffense()])
  const [errors, setErrors] = useState({})

  const updateEntry = (list, setList, index, field, value) => {
    const updated = [...list]
    updated[index] = { ...updated[index], [field]: value }
    setList(updated)
  }

  const addEntry = (list, setList) => setList([...list, emptyOffense()])
  const removeEntry = (list, setList, i) => { if (list.length > 1) setList(list.filter((_, idx) => idx !== i)) }

  const validate = () => {
    const e = {}
    if (hasConvictions === null) e.hasConvictions = 'Please select an option'
    if (hasPending === null) e.hasPending = 'Please select an option'
    if (hasDrugOffenses === null) e.hasDrugOffenses = 'Please select an option'
    if (hasDUI === null) e.hasDUI = 'Please select an option'
    if (hasFraud === null) e.hasFraud = 'Please select an option'
    if (hasDomesticViolence === null) e.hasDomesticViolence = 'Please select an option'
    if (hasSexOffenses === null) e.hasSexOffenses = 'Please select an option'
    if (hasRestrainingOrders === null) e.hasRestrainingOrders = 'Please select an option'
    if (hasArrest === null) e.hasArrest = 'Please select an option'
    if (hasProbation === null) e.hasProbation = 'Please select an option'
    if (hasTerminations === null) e.hasTerminations = 'Please select an option'

    if (hasConvictions) {
      convictions.forEach((c, i) => {
        if (!c.offenseType) e[`conv_${i}_offenseType`] = 'Required'
        if (!c.description.trim()) e[`conv_${i}_description`] = 'Required'
        if (!c.date) e[`conv_${i}_date`] = 'Required'
        if (!c.country.trim()) e[`conv_${i}_country`] = 'Required'
      })
    }

    if (hasPending) {
      pendingCharges.forEach((c, i) => {
        if (!c.description.trim()) e[`pend_${i}_description`] = 'Required'
        if (!c.country.trim()) e[`pend_${i}_country`] = 'Required'
      })
    }

    if (hasDrugOffenses && !drugDetails.trim()) e.drugDetails = 'Please provide details'
    if (hasDUI && !duiDetails.trim()) e.duiDetails = 'Please provide details'
    if (hasFraud && !fraudDetails.trim()) e.fraudDetails = 'Please provide details'
    if (hasDomesticViolence && !domesticDetails.trim()) e.domesticDetails = 'Please provide details'
    if (hasSexOffenses && !sexOffenseDetails.trim()) e.sexOffenseDetails = 'Please provide details'
    if (hasRestrainingOrders && !restrainingDetails.trim()) e.restrainingDetails = 'Please provide details'
    if (hasArrest && !arrestDetails.trim()) e.arrestDetails = 'Please provide details'
    if (hasProbation && !probationDetails.trim()) e.probationDetails = 'Please provide details'
    if (hasTerminations && !terminationDetails.trim()) e.terminationDetails = 'Please provide details'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    }`

  const handleContinue = () => {
    if (!validate()) return
    sessionStorage.setItem('verify_criminal', JSON.stringify({
      hasConvictions, convictions: hasConvictions ? convictions : [],
      hasPending, pendingCharges: hasPending ? pendingCharges : [],
      hasDrugOffenses, drugDetails: hasDrugOffenses ? drugDetails : '',
      hasDUI, duiDetails: hasDUI ? duiDetails : '',
      hasFraud, fraudDetails: hasFraud ? fraudDetails : '',
      hasDomesticViolence, domesticDetails: hasDomesticViolence ? domesticDetails : '',
      hasSexOffenses, sexOffenseDetails: hasSexOffenses ? sexOffenseDetails : '',
      hasRestrainingOrders, restrainingDetails: hasRestrainingOrders ? restrainingDetails : '',
      hasArrest, arrestDetails: hasArrest ? arrestDetails : '',
      hasProbation, probationDetails: hasProbation ? probationDetails : '',
      hasTerminations, terminationDetails: hasTerminations ? terminationDetails : '',
    }))
    navigate(`/verify/additional?${searchParams.toString()}`)
  }

  const YesNoToggle = ({ value, onChange, error }) => (
    <div>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
            value === true ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
            value === false ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          No
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  const OffenseForm = ({ prefix, entries, setEntries, showOutcome = true }) => (
    <>
      {entries.map((entry, i) => (
        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Entry #{i + 1}</span>
            {entries.length > 1 && (
              <button onClick={() => removeEntry(entries, setEntries, i)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type of Offense <span className="text-red-500">*</span></label>
              <select value={entry.offenseType} onChange={(e) => updateEntry(entries, setEntries, i, 'offenseType', e.target.value)} className={inputClass(`${prefix}_${i}_offenseType`)}>
                <option value="">Select</option>
                <option value="misdemeanor">Misdemeanor</option>
                <option value="felony">Felony</option>
                <option value="infraction">Infraction / Violation</option>
                <option value="other">Other</option>
              </select>
              {errors[`${prefix}_${i}_offenseType`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}_${i}_offenseType`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="month" value={entry.date} onChange={(e) => updateEntry(entries, setEntries, i, 'date', e.target.value)} className={inputClass(`${prefix}_${i}_date`)} />
              {errors[`${prefix}_${i}_date`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}_${i}_date`]}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea value={entry.description} onChange={(e) => updateEntry(entries, setEntries, i, 'description', e.target.value)} placeholder="Brief description of the offense" rows={2} className={inputClass(`${prefix}_${i}_description`)} />
              {errors[`${prefix}_${i}_description`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}_${i}_description`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City / Town</label>
              <input type="text" value={entry.city} onChange={(e) => updateEntry(entries, setEntries, i, 'city', e.target.value)} placeholder="e.g. London, Toronto" className={inputClass(`${prefix}_${i}_city`)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country <span className="text-red-500">*</span></label>
              <input type="text" value={entry.country} onChange={(e) => updateEntry(entries, setEntries, i, 'country', e.target.value)} placeholder="e.g. United States" className={inputClass(`${prefix}_${i}_country`)} />
              {errors[`${prefix}_${i}_country`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}_${i}_country`]}</p>}
            </div>
            {showOutcome && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Outcome</label>
                  <select value={entry.outcome} onChange={(e) => updateEntry(entries, setEntries, i, 'outcome', e.target.value)} className={inputClass(`${prefix}_${i}_outcome`)}>
                    <option value="">Select</option>
                    <option value="convicted">Convicted</option>
                    <option value="pled_guilty">Pled Guilty</option>
                    <option value="pled_no_contest">Pled No Contest</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="acquitted">Acquitted</option>
                    <option value="deferred">Deferred Adjudication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sentence / Penalty</label>
                  <input type="text" value={entry.sentence} onChange={(e) => updateEntry(entries, setEntries, i, 'sentence', e.target.value)} placeholder="e.g. Fine, Probation, Community Service" className={inputClass(`${prefix}_${i}_sentence`)} />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      <button onClick={() => addEntry(entries, setEntries)} className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer mt-1">
        + Add Another Entry
      </button>
    </>
  )

  return (
    <Layout step={6} totalSteps={11} stepLabel="Criminal History">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Criminal History Disclosure</h2>
        <p className="text-slate-500 text-sm">Please answer all questions truthfully. Disclosure of a record does not automatically disqualify you. All information is kept strictly confidential.</p>
      </div>

      {/* Convictions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been convicted of, or pled guilty/no contest to, any criminal offense?</h3>
        <p className="text-xs text-slate-400 mb-3">Include felonies, misdemeanors, and military offenses. Exclude minor traffic violations (e.g. parking tickets).</p>
        <YesNoToggle value={hasConvictions} onChange={setHasConvictions} error={errors.hasConvictions} />
        {hasConvictions && (
          <div className="mt-5">
            <OffenseForm prefix="conv" entries={convictions} setEntries={setConvictions} />
          </div>
        )}
      </div>

      {/* Pending Charges */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Do you currently have any pending criminal charges or are you awaiting trial?</h3>
        <p className="text-xs text-slate-400 mb-3">Include any charges that have not yet been resolved.</p>
        <YesNoToggle value={hasPending} onChange={setHasPending} error={errors.hasPending} />
        {hasPending && (
          <div className="mt-5">
            <OffenseForm prefix="pend" entries={pendingCharges} setEntries={setPendingCharges} showOutcome={false} />
          </div>
        )}
      </div>

      {/* Drug Offenses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been charged with or convicted of any drug or controlled substance offense?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes possession, distribution, manufacturing, trafficking, or use of illegal drugs or controlled substances.</p>
        <YesNoToggle value={hasDrugOffenses} onChange={setHasDrugOffenses} error={errors.hasDrugOffenses} />
        {hasDrugOffenses && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={drugDetails} onChange={(e) => { setDrugDetails(e.target.value); if (errors.drugDetails) setErrors({ ...errors, drugDetails: '' }) }} placeholder="Include type of offense, substance involved, date, location, and outcome (convicted, dismissed, etc.)" rows={3} className={inputClass('drugDetails')} />
            {errors.drugDetails && <p className="text-red-500 text-xs mt-1">{errors.drugDetails}</p>}
          </div>
        )}
      </div>

      {/* DUI / DWI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been charged with or convicted of driving under the influence (DUI/DWI) or similar offense?</h3>
        <p className="text-xs text-slate-400 mb-3">Include alcohol-related and drug-related driving offenses in any country.</p>
        <YesNoToggle value={hasDUI} onChange={setHasDUI} error={errors.hasDUI} />
        {hasDUI && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={duiDetails} onChange={(e) => { setDuiDetails(e.target.value); if (errors.duiDetails) setErrors({ ...errors, duiDetails: '' }) }} placeholder="Include date, location, blood alcohol level (if known), outcome, and any license suspensions" rows={3} className={inputClass('duiDetails')} />
            {errors.duiDetails && <p className="text-red-500 text-xs mt-1">{errors.duiDetails}</p>}
          </div>
        )}
      </div>

      {/* Fraud / Financial Crimes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been charged with or convicted of fraud, embezzlement, theft, forgery, or any financial crime?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes identity theft, money laundering, tax evasion, insurance fraud, check fraud, or any dishonesty-related offense.</p>
        <YesNoToggle value={hasFraud} onChange={setHasFraud} error={errors.hasFraud} />
        {hasFraud && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={fraudDetails} onChange={(e) => { setFraudDetails(e.target.value); if (errors.fraudDetails) setErrors({ ...errors, fraudDetails: '' }) }} placeholder="Include type of offense, date, amount involved (if applicable), location, and outcome" rows={3} className={inputClass('fraudDetails')} />
            {errors.fraudDetails && <p className="text-red-500 text-xs mt-1">{errors.fraudDetails}</p>}
          </div>
        )}
      </div>

      {/* Domestic Violence */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been charged with or convicted of domestic violence, assault, battery, or any violent offense?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes any offense involving physical harm or threat of harm to another person.</p>
        <YesNoToggle value={hasDomesticViolence} onChange={setHasDomesticViolence} error={errors.hasDomesticViolence} />
        {hasDomesticViolence && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={domesticDetails} onChange={(e) => { setDomesticDetails(e.target.value); if (errors.domesticDetails) setErrors({ ...errors, domesticDetails: '' }) }} placeholder="Include type of offense, date, location, relationship to victim (if applicable), and outcome" rows={3} className={inputClass('domesticDetails')} />
            {errors.domesticDetails && <p className="text-red-500 text-xs mt-1">{errors.domesticDetails}</p>}
          </div>
        )}
      </div>

      {/* Sex Offenses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been charged with or convicted of any sexual offense, or are you required to register as a sex offender?</h3>
        <YesNoToggle value={hasSexOffenses} onChange={setHasSexOffenses} error={errors.hasSexOffenses} />
        {hasSexOffenses && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={sexOffenseDetails} onChange={(e) => { setSexOffenseDetails(e.target.value); if (errors.sexOffenseDetails) setErrors({ ...errors, sexOffenseDetails: '' }) }} placeholder="Include type of offense, date, location, outcome, and registry status" rows={3} className={inputClass('sexOffenseDetails')} />
            {errors.sexOffenseDetails && <p className="text-red-500 text-xs mt-1">{errors.sexOffenseDetails}</p>}
          </div>
        )}
      </div>

      {/* Restraining Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever had a restraining order, protection order, or no-contact order issued against you?</h3>
        <YesNoToggle value={hasRestrainingOrders} onChange={setHasRestrainingOrders} error={errors.hasRestrainingOrders} />
        {hasRestrainingOrders && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={restrainingDetails} onChange={(e) => { setRestrainingDetails(e.target.value); if (errors.restrainingDetails) setErrors({ ...errors, restrainingDetails: '' }) }} placeholder="Include date, jurisdiction/country, reason, and current status (active or expired)" rows={3} className={inputClass('restrainingDetails')} />
            {errors.restrainingDetails && <p className="text-red-500 text-xs mt-1">{errors.restrainingDetails}</p>}
          </div>
        )}
      </div>

      {/* Arrests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been arrested for any reason, even if no charges were filed or charges were later dropped?</h3>
        <p className="text-xs text-slate-400 mb-3">Exclude arrests already disclosed in the questions above.</p>
        <YesNoToggle value={hasArrest} onChange={setHasArrest} error={errors.hasArrest} />
        {hasArrest && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={arrestDetails} onChange={(e) => { setArrestDetails(e.target.value); if (errors.arrestDetails) setErrors({ ...errors, arrestDetails: '' }) }} placeholder="Include date, reason for arrest, location/country, and outcome (charges filed, dismissed, etc.)" rows={3} className={inputClass('arrestDetails')} />
            {errors.arrestDetails && <p className="text-red-500 text-xs mt-1">{errors.arrestDetails}</p>}
          </div>
        )}
      </div>

      {/* Probation / Parole */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Are you currently on, or have you ever been on, probation, parole, or any form of supervised release?</h3>
        <YesNoToggle value={hasProbation} onChange={setHasProbation} error={errors.hasProbation} />
        {hasProbation && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={probationDetails} onChange={(e) => { setProbationDetails(e.target.value); if (errors.probationDetails) setErrors({ ...errors, probationDetails: '' }) }} placeholder="Include type (probation/parole), start and end dates, supervising jurisdiction, and current status" rows={3} className={inputClass('probationDetails')} />
            {errors.probationDetails && <p className="text-red-500 text-xs mt-1">{errors.probationDetails}</p>}
          </div>
        )}
      </div>

      {/* Terminations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Have you ever been terminated, asked to resign, or left a position due to misconduct or disciplinary action?</h3>
        <p className="text-xs text-slate-400 mb-3">This includes involuntary separations from any employer, military service, or volunteer position.</p>
        <YesNoToggle value={hasTerminations} onChange={setHasTerminations} error={errors.hasTerminations} />
        {hasTerminations && (
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Please provide details <span className="text-red-500">*</span></label>
            <textarea value={terminationDetails} onChange={(e) => { setTerminationDetails(e.target.value); if (errors.terminationDetails) setErrors({ ...errors, terminationDetails: '' }) }} placeholder="Describe the circumstances, including employer name, date, and reason" rows={3} className={inputClass('terminationDetails')} />
            {errors.terminationDetails && <p className="text-red-500 text-xs mt-1">{errors.terminationDetails}</p>}
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-blue-800 text-sm font-semibold">Your rights</p>
          <p className="text-blue-600 text-xs mt-0.5">A criminal record does not automatically disqualify you. Each case is reviewed individually based on the nature of the offense, how recent it was, and its relevance to the position.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
