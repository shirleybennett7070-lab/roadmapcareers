import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Certificate from './Certificate';
import { API_URL } from '../config/api';

export default function CertificateView() {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certId = params.get('id');

    if (!certId) {
      setError('No certificate ID provided');
      setLoading(false);
      return;
    }

    fetchCertificate(certId);
  }, []);

  const fetchCertificate = async (certId) => {
    try {
      // Check if this is the demo/sample certificate
      if (certId === 'RC-L5X8K9PQ-A7B3C9') {
        setIsDemoMode(true);
        setCertificateData({
          userInfo: {
            fullName: 'Alex Johnson',
            email: 'alex.johnson@example.com'
          },
          examResult: {
            score: 17,
            totalQuestions: 20,
            passed: true
          },
          certificateId: 'RC-L5X8K9PQ-A7B3C9'
        });
        setLoading(false);
        return;
      }

      // Fetch real certificate from backend
      const response = await fetch(`${API_URL}/api/certifications/verify/${certId}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setCertificateData({
          userInfo: {
            fullName: data.certificate.fullName,
            email: data.certificate.email
          },
          examResult: {
            score: data.certificate.score,
            totalQuestions: data.certificate.totalQuestions,
            passed: true
          },
          certificateId: data.certificate.certificateId
        });
        setLoading(false);
      } else {
        setError('Certificate not found or invalid');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to load certificate');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading certificate...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-xl p-10 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate ID Required
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">How to View a Certificate</h3>
              <p className="text-gray-700 text-sm mb-3">
                To view a certificate, you need to include the certificate ID in the URL like this:
              </p>
              <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                <code className="text-sm text-blue-600">/certificate?id=RC-XXXXXXXXX-XXXXXX</code>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Try the demo:</strong>
              </p>
              <a 
                href="/certificate?id=RC-L5X8K9PQ-A7B3C9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                View Sample Certificate →
              </a>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/certificate?id=RC-L5X8K9PQ-A7B3C9"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Sample Certificate
              </a>
              <a
                href="/verify-certificate"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Verify a Certificate
              </a>
              <a
                href="/certification"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Get Certified
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900">Demo Certificate - For Preview Only</p>
                <p className="text-blue-800 text-sm">
                  This is a sample certificate. Real certificates are issued after passing the exam.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {certificateData && (
          <>
            {/* Certificate Component */}
            <Certificate 
              userInfo={certificateData.userInfo}
              examResult={certificateData.examResult}
              certificateId={certificateData.certificateId}
              isSample={isDemoMode}
              onDownload={() => {
                console.log('Certificate downloaded:', certificateData.certificateId);
              }}
            />

            {/* Verification Link */}
            <div className="mt-8 text-center">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Verify This Certificate</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Employers can verify the authenticity of this certificate
                </p>
                <a
                  href={`/verify-certificate?id=${certificateData.certificateId}`}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Verify Certificate →
                </a>
              </div>
            </div>


            {/* Demo CTA */}
            {isDemoMode && (
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-10 text-center text-white">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-3xl font-bold mb-4">
                  Ready to Earn Your Certificate?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Take the certification exam and get your own professional certificate
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/certification-prep"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Study Guide
                  </a>
                  <a
                    href="/certification"
                    className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                  >
                    Take the Exam →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
