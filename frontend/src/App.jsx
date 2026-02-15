import { useState } from 'react';
import Assessment from './components/Assessment';
import SkillAssessment from './components/SkillAssessment';
import Certification from './components/Certification';
import CertificationResult from './components/CertificationResult';
import CertificationPrep from './components/CertificationPrep';
import CertificateVerification from './components/CertificateVerification';
import CertificateView from './components/CertificateView';
import JobDetails from './components/JobDetails';
import CandidateIntake from './components/CandidateIntake';
import TechnicalAssessment from './components/TechnicalAssessment';
import Admin from './components/Admin';
import About from './components/About';
import Careers from './components/Careers';

function App() {
  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPath === '/about' ? (
        <About />
      ) : currentPath === '/careers' ? (
        <Careers />
      ) : currentPath === '/admin' ? (
        <Admin />
      ) : currentPath.startsWith('/certification/result') ? (
        <CertificationResult />
      ) : currentPath === '/certification/prep' ? (
        <CertificationPrep />
      ) : currentPath === '/certificate' ? (
        <CertificateView />
      ) : currentPath === '/verify-certificate' ? (
        <CertificateVerification />
      ) : currentPath === '/certification' ? (
        <Certification />
      ) : currentPath === '/job-details' ? (
        <JobDetails />
      ) : currentPath === '/intake' ? (
        <CandidateIntake />
      ) : currentPath === '/technical-assessment' ? (
        <TechnicalAssessment />
      ) : currentPath === '/skill-assessment' ? (
        <SkillAssessment />
      ) : currentPath === '/assessment' || currentPath === '/' ? (
        <Assessment />
      ) : (
        <Assessment />
      )}
    </div>
  );
}

export default App;
