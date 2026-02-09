import { useState, useEffect } from 'react';
import JobDetailsSidebar from './JobDetailsSidebar';
import CertificationInfo from './CertificationInfo';
import PricingCards from './PricingCards';
import CertificationExam from './CertificationExam';
import Header from './Header';
import Footer from './Footer';
import { API_URL } from '../config/api';

const certifications = [
  {
    id: 'remote-work',
    name: 'Remote Work Professional Certification',
    icon: '💼',
    description: 'Master essential remote work skills including communication, productivity, and professional best practices for distributed teams.',
    recommended: true
  },
  {
    id: 'customer-service',
    name: 'Customer Service Excellence Certification',
    icon: '🎧',
    description: 'Develop advanced customer service skills, conflict resolution techniques, and support strategies for remote environments.'
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant Professional Certification',
    icon: '📋',
    description: 'Learn administrative support skills, time management, and tools for excelling as a virtual assistant.'
  }
];

export default function Certification() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
  // Get job info from URL parameters
  const [jobInfo, setJobInfo] = useState(null);
  const [selectedCert, setSelectedCert] = useState('remote-work');
  const [showPricing, setShowPricing] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [examKey, setExamKey] = useState(0); // Key to force remount
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobTitle = params.get('job');
    const company = params.get('company');
    const pay = params.get('pay');
    const location = params.get('location');
    const type = params.get('type');
    
    // Check for retake parameters
    const isRetake = params.get('retake');
    const retakeEmail = params.get('email');
    const retakeName = params.get('name');
    const retakePhone = params.get('phone');
    
    if (jobTitle) {
      setJobInfo({
        title: jobTitle,
        company: company || 'Remote Employers',
        pay: pay || 'Competitive',
        location: location || 'Remote',
        type: type || 'Entry Level',
        originalUrl: params.get('url') || ''
      });
    }
    
    // If retaking, pre-fill form and start exam
    if (isRetake && retakeEmail && retakeName) {
      setFormData({
        fullName: retakeName,
        email: retakeEmail,
        phone: retakePhone || ''
      });
      setShowExam(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleStartExam = () => {
    // Go directly to exam (which will show contact form first)
    setShowExam(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExamComplete = async (result) => {
    try {
      // Generate certificate ID for passed exams
      const certificateId = result.passed ? generateCertificateId() : null;
      
      // Save exam result to backend
      const response = await fetch(`${API_URL}/api/certifications/exam-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone || '',
          jobTitle: jobInfo?.title || '',
          jobCompany: jobInfo?.company || '',
          score: result.score,
          totalQuestions: result.totalQuestions,
          passed: result.passed,
          jobPay: jobInfo?.pay || '',
          jobLocation: jobInfo?.location || '',
          jobType: jobInfo?.type || '',
          jobOriginalUrl: jobInfo?.originalUrl || '',
          certificateId: certificateId
        })
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        // Redirect to result page with token
        window.location.href = `/certification/result/${data.token}`;
      } else {
        // If no token, show error and allow retry
        alert('Error saving exam result. Please try again.');
        setShowExam(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error saving exam result:', error);
      alert('Error connecting to server. Please check your connection and try again.');
      setShowExam(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RC-${timestamp}-${randomStr}`;
  };

  const handleBackToPricing = () => {
    setShowExam(false);
    setShowPricing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If showing exam, render only the exam component
  if (showExam) {
    return (
      <CertificationExam 
        key={examKey}
        userInfo={formData}
        setUserInfo={setFormData}
        jobInfo={jobInfo}
        onComplete={handleExamComplete}
        onBack={handleBackToPricing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section - Only show when no job info */}
      {!jobInfo && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Certifications
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Choose the Right Certification for Your Career Goals
            </p>
            <a href="#enroll" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors">
              Get Certified Now
            </a>
          </div>
        </div>
      )}

      {/* Simple Header for Job-Specific Pages */}
      {jobInfo && (
        <div className="bg-gray-50 border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Roadmap Careers Certification 
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* Job-Specific Section (when job info is present) */}
        {jobInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Job Details */}
            <div className="lg:col-span-4">
              <JobDetailsSidebar jobInfo={jobInfo} assessmentType="certification" />
            </div>

            {/* Main Content Area - Right Side */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-8 md:p-12">
                  {/* Certification Info Title */}
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Remote Work Professional Certification
                    </h2>
                    <div className="h-1 w-16 bg-blue-600 rounded"></div>
                  </div>

                  {/* Recommended Certification - Initial View */}
                  {!showPricing && (
                    <CertificationInfo 
                      jobInfo={jobInfo} 
                      onGetCertified={() => {
                        setShowPricing(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {/* Pricing Options - After Get Certified Click */}
                  {showPricing && (
                    <PricingCards 
                      jobInfo={jobInfo}
                      onEnroll={handleStartExam}
                      onBack={() => setShowPricing(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Certifications (when no job info) */}
        {!jobInfo && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Choose Your Certification Program
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Select the certification that best matches your career goals and the roles you're targeting
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {certifications.map((cert) => (
                <div 
                  key={cert.id}
                  onClick={() => setSelectedCert(cert.id)}
                  className={`bg-white p-8 rounded-lg shadow-lg cursor-pointer transition-all border-4 ${
                    selectedCert === cert.id 
                      ? 'border-blue-600 shadow-xl transform scale-105' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {cert.recommended && (
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-6xl mb-4">{cert.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600 text-sm">{cert.description}</p>
                  {selectedCert === cert.id && (
                    <div className="mt-4 text-blue-600 font-semibold">
                      ✓ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
