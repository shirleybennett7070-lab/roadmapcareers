import { Routes, Route } from 'react-router-dom'
import ConsentPage from './pages/ConsentPage'
import PersonalInfoPage from './pages/PersonalInfoPage'
import ConfirmationPage from './pages/ConfirmationPage'
import StartPage from './pages/verify/StartPage'
import IdentityPage from './pages/verify/IdentityPage'
import AddressPage from './pages/verify/AddressPage'
import EmploymentPage from './pages/verify/EmploymentPage'
import EducationPage from './pages/verify/EducationPage'
import CriminalHistoryPage from './pages/verify/CriminalHistoryPage'
import AdditionalInfoPage from './pages/verify/AdditionalInfoPage'
import ReferencesPage from './pages/verify/ReferencesPage'
import ReviewPage from './pages/verify/ReviewPage'
import CameraPage from './pages/verify/CameraPage'

function App() {
  return (
    <Routes>
      {/* Pre-payment flow */}
      <Route path="/" element={<ConsentPage />} />
      <Route path="/personal-info" element={<PersonalInfoPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />

      {/* Verification flow (post-payment) */}
      <Route path="/verify/start" element={<StartPage />} />         {/* Step 1 */}
      <Route path="/verify/identity" element={<IdentityPage />} />   {/* Step 2 */}
      <Route path="/verify/address" element={<AddressPage />} />     {/* Step 3 */}
      <Route path="/verify/employment" element={<EmploymentPage />} /> {/* Step 4 */}
      <Route path="/verify/education" element={<EducationPage />} /> {/* Step 5 */}
      <Route path="/verify/criminal" element={<CriminalHistoryPage />} /> {/* Step 6 */}
      <Route path="/verify/additional" element={<AdditionalInfoPage />} /> {/* Step 7 */}
      <Route path="/verify/references" element={<ReferencesPage />} /> {/* Step 8 */}
      <Route path="/verify/review" element={<ReviewPage />} />       {/* Step 9 */}
      <Route path="/verify/camera" element={<CameraPage />} />     {/* Step 10 / 11 */}
    </Routes>
  )
}

export default App
