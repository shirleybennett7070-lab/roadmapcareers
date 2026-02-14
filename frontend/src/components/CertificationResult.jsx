import { useState, useEffect } from 'react';
import PaymentButton from './PaymentButton';
import Certificate from './Certificate';
import Header from './Header';
import Footer from './Footer';
import { API_URL } from '../config/api';

export default function CertificationResult() {
  // Extract token from URL path
  const pathParts = window.location.pathname.split('/');
  const token = pathParts[pathParts.length - 1];
  
  // Extract query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  const sessionId = urlParams.get('session_id');
  const paymentProvider = urlParams.get('provider'); // 'paypal' when returning from PayPal
  
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showCancelledNotice, setShowCancelledNotice] = useState(paymentStatus === 'cancelled');

  useEffect(() => {
    console.log('🔍 CertificationResult mounted');
    console.log('Token:', token);
    console.log('Payment Status:', paymentStatus);
    console.log('Session ID:', sessionId);
    console.log('Provider:', paymentProvider);
    console.log('Full URL:', window.location.href);
    
    const initPage = async () => {
      if (paymentStatus === 'success' && paymentProvider === 'paypal') {
        // Returning from PayPal — capture the order using the token from the URL
        console.log('✅ Capturing PayPal payment...');
        await capturePayPal();
      } else if (paymentStatus === 'success' && sessionId) {
        // Returning from Stripe
        console.log('✅ Verifying Stripe payment with session:', sessionId);
        await verifyPayment(sessionId);
      } else {
        await loadExamResult();
      }
    };
    
    initPage();
  }, []);

  const loadExamResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/certifications/exam-result/${token}`);
      
      if (!response.ok) {
        throw new Error('Result not found');
      }

      const data = await response.json();
      setExamResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (sessionId) => {
    try {
      console.log('💳 Starting payment verification...');
      setLoading(true);
      setVerifyingPayment(true);
      
      const response = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      console.log('💳 Payment verification response:', data);

        if (data.success && data.paid) {
        console.log('✅ Payment verified! Reloading exam result...');
        // Reload exam result to get updated payment status and certificate ID
        const resultResponse = await fetch(`${API_URL}/api/certifications/exam-result/${token}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          console.log('📄 Updated exam result:', resultData);
          setExamResult(resultData);
          console.log('🎉 Certificate ready to display!');
        }
      } else {
        // Payment not completed, still load the exam result
        await loadExamResult();
      }
    } catch (err) {
      console.error('❌ Error verifying payment:', err);
      // Still try to load the exam result even if verification fails
      await loadExamResult();
      alert('Payment verification failed. Please refresh the page or contact support.');
    } finally {
      setLoading(false);
      setVerifyingPayment(false);
    }
  };

  /**
   * Capture a PayPal order after user returns from PayPal approval page.
   * PayPal appends ?token=ORDER_ID to the return URL automatically.
   */
  const capturePayPal = async () => {
    try {
      setLoading(true);
      setVerifyingPayment(true);

      // PayPal adds its order ID as the "token" query param on redirect
      const paypalOrderId = urlParams.get('token');

      if (!paypalOrderId) {
        console.error('❌ No PayPal order ID in URL');
        await loadExamResult();
        return;
      }

      console.log('💳 Capturing PayPal order:', paypalOrderId);

      const response = await fetch(`${API_URL}/api/payments/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paypalOrderId }),
      });

      const data = await response.json();
      console.log('💳 PayPal capture response:', data);

      if (data.success && data.paid) {
        console.log('✅ PayPal payment captured! Reloading exam result...');
        const resultResponse = await fetch(`${API_URL}/api/certifications/exam-result/${token}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          console.log('📄 Updated exam result:', resultData);
          setExamResult(resultData);
          console.log('🎉 Certificate ready to display!');
        }
      } else {
        await loadExamResult();
      }
    } catch (err) {
      console.error('❌ Error capturing PayPal payment:', err);
      await loadExamResult();
      alert('PayPal payment verification failed. Please refresh the page or contact support.');
    } finally {
      setLoading(false);
      setVerifyingPayment(false);
    }
  };

  if (loading || verifyingPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            {verifyingPayment ? 'Verifying Payment...' : 'Loading Assessment Results...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !examResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Result Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to retrieve assessment result'}</p>
          <a
            href="/certification"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Certification
          </a>
        </div>
      </div>
    );
  }

  const percentage = Math.round((examResult.score / examResult.totalQuestions) * 100);
  const passed = examResult.passed;
  const paymentCompleted = examResult.paymentStatus === 'completed';

  // Check if job info exists and build jobInfo object for sidebar
  const hasJobInfo = examResult.jobTitle && examResult.jobTitle.trim() !== '';
  const jobInfo = hasJobInfo ? {
    title: examResult.jobTitle,
    type: examResult.jobType,
    location: examResult.jobLocation,
    pay: examResult.jobPay,
    company: examResult.jobCompany,
    originalUrl: examResult.jobOriginalUrl || ''
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Payment Cancelled Notice */}
        {showCancelledNotice && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-800 font-medium">Payment was cancelled. You can try again when you're ready.</p>
            </div>
            <button 
              onClick={() => setShowCancelledNotice(false)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {passed && !paymentCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Job Details */}
            {hasJobInfo && (
              <div className="lg:col-span-4">
                <div className="space-y-4">
                  {/* Remove sticky from JobDetailsSidebar by wrapping in non-sticky container */}
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Role You're Interested In
                      </h3>
                      <div className="h-1 w-12 bg-blue-600 rounded"></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Role Title
                        </span>
                        <span className="text-lg font-bold text-gray-900 block">
                          {jobInfo?.title || 'Not specified'}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Category
                        </span>
                        <span className="text-gray-900 font-medium block">
                          {jobInfo?.type || 'Customer Service'}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Work Type
                        </span>
                        <span className="text-gray-900 font-medium block">
                          Remote
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold block mb-1">🏆 Certification Purpose</span>
                          This certification helps document your preparation for roles you're exploring.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Certificate Info - Only on Result Page */}
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Certificate Details</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Digital certificate with unique ID</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <strong>Employers, recruiters, or other reviewers may independently verify the authenticity of the certificate online using the certificate ID</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={hasJobInfo ? "lg:col-span-8" : "lg:col-span-12 max-w-4xl mx-auto"}>
              {/* Combined Official Result & Certificate Issuance */}
              <div className="bg-white border border-gray-400 shadow-lg mb-8">
                {/* Header Bar */}
                <div className="bg-gray-800 text-white py-4 px-8">
                  <h1 className="text-xl font-semibold text-center uppercase tracking-widest">
                    Official Assessment Result
                  </h1>
                </div>
                
                <div className="p-8">
                  <p className="text-center text-gray-600 text-sm mb-6 uppercase tracking-wide">
                    Remote Work Readiness Certification
                  </p>

                  {/* Results Table */}
                  <table className="w-full max-w-md mx-auto mb-6 border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50 w-1/3">Status</td>
                        <td className="py-3 px-4 text-xl font-bold text-green-600 text-center">PASS</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Score</td>
                        <td className="py-3 px-4 text-xl font-bold text-gray-900 text-center">{examResult.score}/{examResult.totalQuestions}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Percentage</td>
                        <td className="py-3 px-4 text-xl font-bold text-gray-900 text-center">{percentage}%</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Candidate</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium text-center">{examResult.fullName}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Email</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{examResult.email}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Date</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{new Date(examResult.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Divider */}
                  <div className="border-t border-gray-300 my-8"></div>

                  {/* Certificate Issuance */}
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Certificate Issuance
                    </h2>
                    <p className="text-gray-700 mb-6">
                      Complete payment to receive your official professional certificate. <a href="/certificate?id=RC-L5X8K9PQ-A7B3C9" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">View Sample →</a>
                    </p>
                    <table className="w-full max-w-xl mx-auto mb-6 border border-gray-300 text-sm">
                      <tbody>
                        <tr className="border-b border-gray-300">
                          <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50 w-1/4">Certificate</td>
                          <td className="py-3 px-4 text-gray-700">Digital certificate with unique ID</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-xs text-gray-500 uppercase tracking-widest bg-gray-50">Verification</td>
                          <td className="py-3 px-4 text-gray-700"><strong>Employers, recruiters, or other reviewers may independently verify the authenticity online</strong></td>
                        </tr>
                      </tbody>
                    </table>
                    
                    {jobInfo && (
                      <p className="text-sm text-gray-600 mb-4">
                        This certification helps document your preparation for roles you were interested in like{' '}
                        <a 
                          href={`/job-details?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type)}${jobInfo.originalUrl ? `&url=${encodeURIComponent(jobInfo.originalUrl)}` : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                        >
                          {jobInfo.title} <span className="text-xs">↗</span>
                        </a>.
                      </p>
                    )}
                    
                    <PaymentButton token={token} examResult={examResult} />
                  </div>
                </div>
              </div>

              {/* Certificate Benefits - Only show if no sidebar */}
              {!hasJobInfo && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Certificate Includes</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Instant Delivery</h4>
                      <p className="text-sm text-gray-600">Digital certificate delivered immediately via email</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Professional Format</h4>
                      <p className="text-sm text-gray-600">High-quality PDF suitable for professional use</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Lifetime Validity</h4>
                      <p className="text-sm text-gray-600">Non-expiring certification with unique ID</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : passed && paymentCompleted ? (
          <>
            {/* Certificate Display - Show directly after payment */}
            <Certificate
              userInfo={{ fullName: examResult.fullName, email: examResult.email }}
              examResult={{ score: examResult.score, totalQuestions: examResult.totalQuestions }}
              certificateId={examResult.certificateId}
              onDownload={() => console.log('Certificate downloaded')}
            />
          </>
        ) : (
          <>
            {/* Failed Assessment */}
            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-8">
              <div className="border-b-2 border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center uppercase tracking-wide">
                  Official Assessment Result
                </h1>
                <p className="text-center text-gray-600 text-sm">
                  Remote Work Readiness Certification
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-8">
                <div className="bg-red-50 border-2 border-red-600 rounded-lg px-8 py-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wider">Status</p>
                    <p className="text-4xl font-bold text-red-700 uppercase tracking-wide">FAIL</p>
                  </div>
                </div>
              </div>

              {/* Score Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Score Achieved</p>
                  <p className="text-2xl font-bold text-gray-900">{examResult.score}/{examResult.totalQuestions}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Percentage</p>
                  <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
                </div>
              </div>

              {/* Passing Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Passing Requirements:</p>
                <p className="text-gray-700">Minimum score of 12 out of 20 (60%) required to pass</p>
              </div>

              {/* Candidate Information */}
              <div className="border-t-2 border-gray-200 pt-6 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Candidate Name:</span>
                  <span className="text-sm text-gray-900 font-medium">{examResult.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Email:</span>
                  <span className="text-sm text-gray-900">{examResult.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Assessment Date:</span>
                  <span className="text-sm text-gray-900">{new Date(examResult.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="text-center">
                <a
                  href={`/certification?retake=true&email=${encodeURIComponent(examResult.email)}&name=${encodeURIComponent(examResult.fullName)}${examResult.phone ? `&phone=${encodeURIComponent(examResult.phone)}` : ''}${examResult.jobTitle ? `&job=${encodeURIComponent(examResult.jobTitle)}` : ''}${examResult.jobCompany ? `&company=${encodeURIComponent(examResult.jobCompany)}` : ''}${examResult.jobPay ? `&pay=${encodeURIComponent(examResult.jobPay)}` : ''}${examResult.jobLocation ? `&location=${encodeURIComponent(examResult.jobLocation)}` : ''}${examResult.jobType ? `&type=${encodeURIComponent(examResult.jobType)}` : ''}`}
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors uppercase tracking-wide text-sm"
                >
                  Retake Exam
                </a>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
