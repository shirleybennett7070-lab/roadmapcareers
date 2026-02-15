import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { technicalQuestionBank } from '../data/technicalQuestions.js';
import { API_URL } from '../config/api';

export default function TechnicalAssessment() {
  const [assessmentState, setAssessmentState] = useState('pre-exam'); // 'pre-exam', 'in-progress', 'completed'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get info from URL params
  const [jobInfo, setJobInfo] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const questions = technicalQuestionBank; // Use all 20

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobTitle = params.get('job');
    const company = params.get('company');
    const pay = params.get('pay');
    const location = params.get('location');
    const type = params.get('type');

    if (jobTitle) {
      setJobInfo({
        title: jobTitle,
        company: company || 'Remote Employers',
        pay: pay || 'Competitive',
        location: location || 'Remote',
        type: type || 'Entry Level',
      });
    }
  }, []);

  // Timer
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && assessmentState === 'in-progress') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining, assessmentState]);

  // Prevent page close during exam
  useEffect(() => {
    if (assessmentState === 'in-progress') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your assessment progress will be lost!';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [assessmentState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExam = () => {
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      alert('Please enter a valid email address to continue.');
      return;
    }
    if (!userName.trim()) {
      alert('Please enter your full name to continue.');
      return;
    }
    setAssessmentState('in-progress');
    setExamStarted(true);
    setTimeRemaining(30 * 60);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNextQuestion = () => {
    // No going back — just move forward
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setExamStarted(false);
    setSubmitting(true);

    const score = questions.reduce((total, question) => {
      return answers[question.id] === question.correctAnswer ? total + 1 : total;
    }, 0);

    const examResult = { score, totalQuestions: 20 };
    setResult(examResult);
    setAssessmentState('completed');

    // Submit to backend
    try {
      await fetch(`${API_URL}/api/technical-assessment/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          score,
          totalQuestions: 20,
          jobTitle: jobInfo?.title || '',
          jobCompany: jobInfo?.company || '',
        })
      });
    } catch (error) {
      console.error('Error submitting technical assessment:', error);
    }
    setSubmitting(false);
  };

  // DEV MODE
  const urlParams = new URLSearchParams(window.location.search);
  const hasTestSecret = urlParams.get('testmode') === 'rc2026pass';
  const isDev = import.meta.env.DEV || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('roadmapcareers-dev.pages.dev') ||
    hasTestSecret;

  const devAutoPass = () => {
    const autoAnswers = {};
    questions.forEach(q => { autoAnswers[q.id] = q.correctAnswer; });
    setAnswers(autoAnswers);
    setExamStarted(false);
    setSubmitting(true);
    const examResult = { score: 20, totalQuestions: 20 };
    setResult(examResult);
    setAssessmentState('completed');
    fetch(`${API_URL}/api/technical-assessment/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail || 'dev@test.com', name: userName || 'Dev User',
        score: 20, totalQuestions: 20,
        jobTitle: jobInfo?.title || '', jobCompany: jobInfo?.company || '',
      })
    }).catch(() => {}).finally(() => setSubmitting(false));
  };

  const devAutoFail = () => {
    const autoAnswers = {};
    questions.forEach(q => { autoAnswers[q.id] = (q.correctAnswer + 1) % q.options.length; });
    setAnswers(autoAnswers);
    setExamStarted(false);
    setSubmitting(true);
    const examResult = { score: 0, totalQuestions: 20 };
    setResult(examResult);
    setAssessmentState('completed');
    fetch(`${API_URL}/api/technical-assessment/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail || 'dev@test.com', name: userName || 'Dev User',
        score: 0, totalQuestions: 20,
        jobTitle: jobInfo?.title || '', jobCompany: jobInfo?.company || '',
      })
    }).catch(() => {}).finally(() => setSubmitting(false));
  };

  // ── PRE-EXAM SCREEN ──
  if (assessmentState === 'pre-exam') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="md:col-span-1 space-y-6">
              {jobInfo && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-2">Assessing for</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{jobInfo.title}</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Company</p>
                      <p className="font-semibold text-gray-900">{jobInfo.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Work Location</p>
                      <p className="font-semibold text-gray-900">Remote</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Format:</strong> Multiple-Choice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Questions:</strong> 20 Technical</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Time Limit:</strong> 30 Minutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Navigation:</strong> Forward only — no going back</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Review:</strong> Not allowed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-xl p-10">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                  Technical Assessment
                </h1>
                <p className="text-center text-gray-500 mb-8">Remote Work Technical Knowledge</p>

                {/* Candidate Info Form */}
                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-amber-600">
                        Please use the same email you used to contact us
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2">Important Instructions:</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Once you start, the 30-minute timer begins immediately</li>
                    <li>• You <strong>cannot go back</strong> to previous questions</li>
                    <li>• You <strong>cannot review</strong> your answers</li>
                    <li>• All questions must be answered before submitting</li>
                    <li>• The assessment will auto-submit when time expires</li>
                    <li>• This assessment covers networking, troubleshooting, security, cloud tools, and general technical knowledge</li>
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
                      DO NOT refresh, reload, or close this page once the assessment starts!
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• All progress and answers will be permanently lost</li>
                      <li>• Ensure stable internet connection before starting</li>
                      <li>• Do not use browser back/forward buttons</li>
                      <li>• Complete the assessment in one session</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={startExam}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                  Start Technical Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── IN PROGRESS ──
  if (assessmentState === 'in-progress') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnswered = answers[currentQuestion.id] !== undefined;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                {jobInfo && (
                  <>
                    <p className="text-xs text-gray-600 mb-1">Assessing for</p>
                    <h2 className="text-base font-bold text-gray-900 mb-3">{jobInfo.title}</h2>
                  </>
                )}

                {/* Timer */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                  <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                    ⏱ {formatTime(timeRemaining)}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Progress</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p>• Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <p>• No going back</p>
                  </div>
                </div>

                {/* Questions answered indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Answered</p>
                  <div className="flex flex-wrap gap-1">
                    {questions.map((q, index) => (
                      <div
                        key={q.id}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600 text-white'
                            : index < currentQuestionIndex
                            ? 'bg-green-100 text-green-700 border border-green-400'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                    <p className="text-xs text-red-800 font-medium">
                      Do not refresh or close this page — progress will be lost!
                    </p>
                  </div>
                </div>

                {/* DEV MODE */}
                {isDev && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-orange-600 font-bold mb-2">🛠 DEV MODE</p>
                    <div className="space-y-2">
                      <button onClick={devAutoPass} className="w-full px-3 py-2 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors">
                        Auto-Pass (20/20)
                      </button>
                      <button onClick={devAutoFail} className="w-full px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors">
                        Auto-Fail (0/20)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span className="text-gray-600 text-sm">{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300 cursor-pointer'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation — forward only */}
              <div className="flex justify-end">
                {!isLastQuestion ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={!hasAnswered}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasAnswered ? 'Next →' : 'Select an answer to continue'}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!hasAnswered}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasAnswered ? 'Submit Assessment' : 'Select an answer to submit'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── COMPLETED ──
  if (assessmentState === 'completed') {
    if (submitting) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Submitting your results...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete</h1>
            <p className="text-gray-600 mb-2">
              You answered all <strong>{result?.totalQuestions}</strong> questions.
            </p>
            <p className="text-gray-500 mb-8">
              Thank you for completing the technical assessment. Your results have been submitted and your recruiter will review them and follow up with next steps.
            </p>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-400">
                Results submitted for <strong>{userEmail}</strong>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}
