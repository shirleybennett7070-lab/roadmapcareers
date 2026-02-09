import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { API_URL } from '../config/api';

export default function CertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    
    if (idFromUrl) {
      setCertificateId(idFromUrl.toUpperCase());
      // Auto-verify if ID is provided
      setTimeout(() => {
        handleVerifyWithId(idFromUrl.toUpperCase());
      }, 500);
    }
  }, []);

  const handleVerifyWithId = async (id) => {
    const idToVerify = id || certificateId;
    
    if (!idToVerify.trim()) {
      alert('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setVerificationStatus(null);
    setDemoMode(false);

    try {
      // Check if this is the sample ID - show demo verification
      if (idToVerify.trim() === 'RC-L5X8K9PQ-A7B3C9') {
        setTimeout(() => {
          setDemoMode(true);
          setVerificationStatus({
            valid: true,
            certificateId: 'RC-L5X8K9PQ-A7B3C9',
            message: 'Certificate is valid and authentic',
            details: {
              fullName: 'Alex Johnson',
              certification: 'Remote Work Professional Certification',
              issuer: 'RoadmapCareers',
              status: 'Active',
              issuedDate: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              score: '17/20 (85%)'
            }
          });
          setLoading(false);
        }, 1000);
        return;
      }

      // Call backend verification endpoint for real certificates
      const response = await fetch(`${API_URL}/api/certifications/verify/${idToVerify.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setVerificationStatus({
          valid: true,
          certificateId: data.certificate.certificateId,
          message: data.message,
          details: {
            fullName: data.certificate.fullName,
            certification: data.certificate.certification,
            issuer: data.certificate.issuer,
            status: data.certificate.status,
            issuedDate: new Date(data.certificate.issuedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            score: `${data.certificate.score}/${data.certificate.totalQuestions} (${Math.round((data.certificate.score / data.certificate.totalQuestions) * 100)}%)`
          }
        });
      } else {
        setVerificationStatus({
          valid: false,
          message: data.message || 'Certificate not found or invalid',
          isSampleId: false
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus({
        valid: false,
        message: 'Error verifying certificate. Please try again.'
      });
      setLoading(false);
    }
  };

  const handleVerify = () => handleVerifyWithId(certificateId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verify Certificate
          </h1>
          <p className="text-xl text-gray-600">
            Enter a certificate ID to verify its authenticity
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Certificate ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                placeholder="RC-XXXXXXXXX-XXXXXX"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <button
                onClick={handleVerify}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Certificate IDs follow the format: RC-XXXXXXXXX-XXXXXX
            </p>
          </div>

          {/* Verification Result */}
          {verificationStatus && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              verificationStatus.valid 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              {/* Demo Mode Badge */}
              {demoMode && (
                <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-blue-900 font-semibold text-sm">Demo Mode - Sample Certificate</p>
                      <p className="text-blue-800 text-xs mt-1">
                        This is how a real certificate verification looks. Actual certificates are issued after passing the exam.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {verificationStatus.valid ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    verificationStatus.valid ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {verificationStatus.valid ? 'Certificate Verified!' : 'Verification Failed'}
                  </h3>
                  <p className={`mb-4 ${
                    verificationStatus.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationStatus.message}
                  </p>

                  {/* Special message for sample certificate - removed since we now show demo mode */}

                  {/* Helpful message for invalid certificates */}
                  {!verificationStatus.valid && !verificationStatus.isSampleId && (
                    <div className="bg-red-50 rounded-lg p-3 text-sm">
                      <p className="text-red-900 mb-2"><strong>Possible reasons:</strong></p>
                      <ul className="text-red-800 space-y-1 ml-4">
                        <li>• Certificate ID may be incorrect or mistyped</li>
                        <li>• Certificate hasn't been issued yet (exam not completed)</li>
                        <li>• Payment may not be completed</li>
                        <li>• Certificate may have been issued recently (try again in a few minutes)</li>
                      </ul>
                    </div>
                  )}

                  {verificationStatus.valid && verificationStatus.details && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Certificate ID:</span>
                        <span className="text-green-800 font-mono">{verificationStatus.certificateId}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Holder Name:</span>
                        <span className="text-green-800">{verificationStatus.details.fullName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Certification:</span>
                        <span className="text-green-800">{verificationStatus.details.certification}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Issued By:</span>
                        <span className="text-green-800">{verificationStatus.details.issuer}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Issue Date:</span>
                        <span className="text-green-800">{verificationStatus.details.issuedDate}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Score:</span>
                        <span className="text-green-800">{verificationStatus.details.score}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Status:</span>
                        <span className="inline-block px-3 py-1 bg-green-200 text-green-900 rounded-full text-xs font-semibold">
                          {verificationStatus.details.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Why Verify Certificates?
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Confirm the authenticity of credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Prevent certificate fraud</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Provide a way for employers, recruiters, or other reviewers to verify certificate authenticity</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Instant verification available 24/7</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              For Employers
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Verify candidate certifications quickly and reliably. All RoadmapCareers certificates 
              include a unique ID for instant verification.
            </p>
            <span className="inline-block text-gray-400 font-semibold text-sm cursor-not-allowed">
              Learn more about bulk verification → (Coming Soon)
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
