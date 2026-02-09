import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'

const emptyAddress = () => ({
  street: '', apt: '', city: '', stateProvince: '', postalCode: '', country: '', fromDate: '', toDate: '', current: false,
})

export default function AddressPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [addresses, setAddresses] = useState([{ ...emptyAddress(), current: true, toDate: 'Present' }])
  const [errors, setErrors] = useState({})

  const updateAddress = (index, field, value) => {
    const updated = [...addresses]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'current' && value) {
      updated[index].toDate = 'Present'
    }
    setAddresses(updated)
    if (errors[`${index}_${field}`]) {
      const e = { ...errors }
      delete e[`${index}_${field}`]
      setErrors(e)
    }
  }

  const addAddress = () => {
    setAddresses([...addresses, emptyAddress()])
  }

  const removeAddress = (index) => {
    if (addresses.length <= 1) return
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  const validate = () => {
    const e = {}
    addresses.forEach((addr, i) => {
      if (!addr.street.trim()) e[`${i}_street`] = 'Required'
      if (!addr.city.trim()) e[`${i}_city`] = 'Required'
      if (!addr.country.trim()) e[`${i}_country`] = 'Required'
      if (!addr.fromDate) e[`${i}_fromDate`] = 'Required'
      if (!addr.current && !addr.toDate) e[`${i}_toDate`] = 'Required'
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
    sessionStorage.setItem('verify_address', JSON.stringify(addresses))
    navigate(`/verify/employment?${searchParams.toString()}`)
  }

  return (
    <Layout step={3} totalSteps={11} stepLabel="Address History">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Address History</h2>
        <p className="text-slate-500 text-sm">Provide your residential addresses for the past 7 years, starting with your current address.</p>
      </div>

      {addresses.map((addr, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">
              {addr.current ? '📍 Current Address' : `Previous Address ${i}`}
            </h3>
            {!addr.current && addresses.length > 1 && (
              <button onClick={() => removeAddress(i)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Remove</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
              <input type="text" value={addr.street} onChange={(e) => updateAddress(i, 'street', e.target.value)} placeholder="123 Main St" className={inputClass(`${i}_street`)} />
              {errors[`${i}_street`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_street`]}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Apt / Suite / Unit</label>
              <input type="text" value={addr.apt} onChange={(e) => updateAddress(i, 'apt', e.target.value)} placeholder="Apt 4B" className={inputClass(`${i}_apt`)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City / Town <span className="text-red-500">*</span></label>
              <input type="text" value={addr.city} onChange={(e) => updateAddress(i, 'city', e.target.value)} placeholder="e.g. London, Toronto, Mumbai" className={inputClass(`${i}_city`)} />
              {errors[`${i}_city`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_city`]}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">State / Province / Region</label>
              <input type="text" value={addr.stateProvince} onChange={(e) => updateAddress(i, 'stateProvince', e.target.value)} placeholder="e.g. California, Ontario" className={inputClass(`${i}_stateProvince`)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Postal / ZIP Code</label>
              <input type="text" value={addr.postalCode} onChange={(e) => updateAddress(i, 'postalCode', e.target.value)} placeholder="e.g. 10001, SW1A 1AA" className={inputClass(`${i}_postalCode`)} />
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country <span className="text-red-500">*</span></label>
              <input type="text" value={addr.country} onChange={(e) => updateAddress(i, 'country', e.target.value)} placeholder="e.g. United States, United Kingdom, India" className={inputClass(`${i}_country`)} />
              {errors[`${i}_country`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_country`]}</p>}
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date <span className="text-red-500">*</span></label>
              <input type="month" value={addr.fromDate} onChange={(e) => updateAddress(i, 'fromDate', e.target.value)} className={inputClass(`${i}_fromDate`)} />
              {errors[`${i}_fromDate`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_fromDate`]}</p>}
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date {!addr.current && <span className="text-red-500">*</span>}</label>
              {addr.current ? (
                <div className="px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">Present</div>
              ) : (
                <>
                  <input type="month" value={addr.toDate} onChange={(e) => updateAddress(i, 'toDate', e.target.value)} className={inputClass(`${i}_toDate`)} />
                  {errors[`${i}_toDate`] && <p className="text-red-500 text-xs mt-1">{errors[`${i}_toDate`]}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addAddress}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-8"
      >
        + Add Another Address
      </button>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back</button>
        <button onClick={handleContinue} className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer">Continue →</button>
      </div>
    </Layout>
  )
}
