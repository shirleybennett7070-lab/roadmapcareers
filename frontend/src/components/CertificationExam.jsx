import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { questionBank } from '../data/examQuestions.js';

// Using shared question bank from examQuestions.js - randomly selects 20 for each exam

export default function CertificationExam({ userInfo, setUserInfo, jobInfo, onComplete, onBack }) {
  const [examState, setExamState] = useState('pre-exam'); // 'pre-exam', 'in-progress', 'completed'
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState(new Set()); // Track locked questions
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false); // Track if user confirmed their info
  const [examResult, setExamResult] = useState(null);
  const [certificateId, setCertificateId] = useState(null);

  // Generate unique certificate ID
  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RC-${timestamp}-${randomStr}`;
  };

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && examState === 'in-progress') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining, examState]);

  // Prevent page refresh/close during exam
  useEffect(() => {
    if (examState === 'in-progress') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost!';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [examState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExam = () => {
    // Select 20 random questions from the bank
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 20);
    setSelectedQuestions(selected);
    setExamState('in-progress');
    setExamStarted(true);
    setTimeRemaining(30 * 60);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    // Lock current question before moving to next
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (answers[currentQuestion.id] !== undefined) {
      setLockedQuestions(prev => new Set([...prev, currentQuestion.id]));
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const handleSubmitExam = () => {
    setExamStarted(false);
    const score = selectedQuestions.reduce((total, question) => {
      return answers[question.id] === question.correctAnswer ? total + 1 : total;
    }, 0);
    
    const passed = score >= 12; // 60% passing score
    const result = {
      score,
      totalQuestions: 20,
      passed,
      answers
    };
    
    setExamResult(result);
    setExamState('completed');
    
    // Generate certificate ID if passed
    if (passed) {
      const certId = generateCertificateId();
      setCertificateId(certId);
    }
    
    onComplete(result);
  };

  const retakeExam = () => {
    setExamState('pre-exam');
    setAnswers({});
    setLockedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setTimeRemaining(30 * 60);
    setInfoConfirmed(false); // Reset to show info form again
    setExamResult(null);
    setCertificateId(null);
  };

  // DEV MODE: Quick test functions (only available in development)
  // Check Vite's DEV flag, localhost, or dev subdomain on Netlify
  const isDev = import.meta.env.DEV || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('-dev.netlify.app');
  
  const devAutoPass = () => {
    // Auto-answer all questions correctly
    const autoAnswers = {};
    selectedQuestions.forEach(q => {
      autoAnswers[q.id] = q.correctAnswer;
    });
    setAnswers(autoAnswers);
    
    // Submit exam with correct answers
    setExamStarted(false);
    const result = {
      score: 20,
      totalQuestions: 20,
      passed: true,
      answers: autoAnswers
    };
    setExamResult(result);
    setExamState('completed');
    const certId = generateCertificateId();
    setCertificateId(certId);
    onComplete(result);
  };

  const devAutoFail = () => {
    // Auto-answer all questions incorrectly
    const autoAnswers = {};
    selectedQuestions.forEach(q => {
      // Pick wrong answer (opposite of correct)
      autoAnswers[q.id] = (q.correctAnswer + 1) % q.options.length;
    });
    setAnswers(autoAnswers);
    
    // Submit exam with wrong answers
    setExamStarted(false);
    const result = {
      score: 0,
      totalQuestions: 20,
      passed: false,
      answers: autoAnswers
    };
    setExamResult(result);
    setExamState('completed');
    onComplete(result);
  };

  // Pre-exam screen (info collection OR instructions)
  if (examState === 'pre-exam') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Sidebar - Job & Exam Info */}
            <div className="md:col-span-1 space-y-6">
              {/* Job Role Info */}
              {jobInfo && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-2">Preparing for</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{jobInfo.title}</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="font-semibold text-gray-900">{jobInfo.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Work Location</p>
                      <p className="font-semibold text-gray-900">Remote</p>
                    </div>
                    <div className="pt-2">
                      <a 
                        href={`${window.location.origin}/job-details?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type || 'Customer Service')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                      >
                        More Info →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Format:</strong> Multiple-Choice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Questions:</strong> 20 random</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Passing:</strong> 12/20 (60%)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Time:</strong> 30 Minutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Retakes:</strong> Unlimited</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Certificate:</strong> Digital with unique ID</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm">
                  <strong>Verification: Employers, recruiters, or other reviewers may independently verify the authenticity of the certificate online using the certificate ID</strong>
                </p>
              </div>
            </div>

            {/* Main Content - Exam Information */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-xl p-10">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Remote Work Professional Certification Exam
                </h1>

                {/* Conditional Content based on if user info is collected */}
                {!infoConfirmed ? (
                  // Step 1: Collect Candidate Information
                  <>
                    {/* Candidate Information Form */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={userInfo.fullName || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={userInfo.email || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-amber-600">
                            Please use the same email you used to contact us
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={userInfo.phone || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {jobInfo && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm text-gray-600">
                            This exam is relevant to <strong>{jobInfo.title}</strong> positions you're exploring.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={onBack}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back to Pricing
                      </button>
                      <button
                        onClick={() => {
                          if (!userInfo.fullName || !userInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
                            alert('Please fill in your name and a valid email to continue.');
                            return;
                          }
                          setInfoConfirmed(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                ) : (
                  // Step 2: Show collected info + exam instructions
                  <>
                    {/* Candidate Information Display */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Information</h2>
                      <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Name:</span> {userInfo.fullName}</p>
                        <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                        {userInfo.phone && <p><span className="font-medium">Phone:</span> {userInfo.phone}</p>}
                      </div>
                      {jobInfo && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm text-gray-600">
                            This exam is relevant to <strong>{jobInfo.title}</strong> positions you're exploring.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                      <h3 className="font-semibold text-gray-900 mb-2">Important Instructions:</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Once you start, the 30-minute timer begins immediately</li>
                        <li>• You can navigate between questions using Next/Previous buttons</li>
                        <li>• All questions must be answered before submitting</li>
                        <li>• The exam will auto-submit when time expires</li>
                        <li>• Payment is processed only after passing the exam</li>
                      </ul>
                    </div>

                    {/* Warning */}
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-8">
                      <h3 className="font-bold text-red-900 mb-3 flex items-center text-lg">
                        <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        CRITICAL WARNING
                      </h3>
                      <div className="space-y-2 text-red-900">
                        <p className="font-semibold">
                          DO NOT refresh, reload, or close this page once the exam starts!
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                          <li>• All progress and answers will be permanently lost</li>
                          <li>• Ensure stable internet connection before starting</li>
                          <li>• Do not use browser back/forward buttons</li>
                          <li>• Complete the exam in one session</li>
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setInfoConfirmed(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={startExam}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Start Exam
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Exam in progress
  if (examState === 'in-progress') {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;
    const allAnswered = selectedQuestions.every(q => answers[q.id] !== undefined);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Left Sidebar - Job & Exam Info */}
            <div className="md:col-span-1 space-y-4">
              {/* Job Role Info */}
              {jobInfo && (
                <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                  <p className="text-xs text-gray-600 mb-1">Preparing for</p>
                  <h2 className="text-base font-bold text-gray-900 mb-3">{jobInfo.title}</h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-semibold text-gray-900">{jobInfo.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Work Location</p>
                      <p className="font-semibold text-gray-900">Remote</p>
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                    <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                      ⏱ {formatTime(timeRemaining)}
                    </div>
                  </div>

                  {/* Exam Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Exam Info</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>• 20 Questions</p>
                      <p>• 60% to Pass (12/20)</p>
                      <p>• Unlimited Retakes</p>
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs text-red-800 font-medium">
                          Do not refresh or close this page - Progress will be lost!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Context Note */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      This exam is relevant to <strong>{jobInfo.title}</strong> positions you're exploring.
                    </p>
                  </div>

                  {/* Certificate Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Certificate</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>• Digital certificate with unique ID</p>
                      <p><strong>Verification: Employers, recruiters, or other reviewers may independently verify the certificate online</strong></p>
                    </div>
                  </div>

                  {/* DEV MODE: Quick test buttons */}
                  {isDev && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-orange-600 font-bold mb-2">🛠 DEV MODE</p>
                      <div className="space-y-2">
                        <button
                          onClick={devAutoPass}
                          className="w-full px-3 py-2 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                        >
                          Auto-Pass (20/20)
                        </button>
                        <button
                          onClick={devAutoFail}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                        >
                          Auto-Fail (0/20)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Content - Exam Questions */}
            <div className="md:col-span-3">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Question {currentQuestionIndex + 1} of {selectedQuestions.length}</span>
                  <span className="text-gray-600 text-sm">{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {currentQuestion.question}
                </h2>

                {/* Show locked message if already answered and locked */}
                {lockedQuestions.has(currentQuestion.id) && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ✓ Answer locked. This question cannot be changed.
                  </div>
                )}

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    const isLocked = lockedQuestions.has(currentQuestion.id);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !isLocked && handleAnswerSelect(currentQuestion.id, index)}
                        disabled={isLocked}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? isLocked 
                              ? 'border-green-600 bg-green-50'
                              : 'border-blue-600 bg-blue-50'
                            : isLocked
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : 'border-gray-300 hover:border-blue-300 cursor-pointer'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        {isSelected && isLocked && <span className="ml-2 text-green-600">✓ Locked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {currentQuestionIndex < selectedQuestions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={answers[currentQuestion.id] === undefined}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {answers[currentQuestion.id] !== undefined ? 'Next →' : 'Select an answer to continue'}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    disabled={!allAnswered}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {allAnswered ? 'Submit Exam' : `Answer All Questions (${selectedQuestions.filter(q => answers[q.id] !== undefined).length}/${selectedQuestions.length})`}
                  </button>
                )}
              </div>

              {/* Question Navigator */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Navigator</h3>
                <div className="grid grid-cols-10 gap-2">
                  {selectedQuestions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : answers[q.id] !== undefined
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded mr-2"></div>
                    Answered
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
                    Not Answered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Exam completed - show loading while redirecting to result page
  if (examState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            Saving your results...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
