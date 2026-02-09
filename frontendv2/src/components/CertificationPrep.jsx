import { useState, useEffect } from 'react';
import JobDetailsSidebar from './JobDetailsSidebar';
import Header from './Header';
import Footer from './Footer';
import { questionBank } from '../data/examQuestions.js';

// Using shared question bank from examQuestions.js - shows all 50 questions for study

export default function CertificationPrep() {
  const [jobInfo, setJobInfo] = useState(null);

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
        type: type || 'Entry Level'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Certification Exam Study Guide
          </h1>
          <p className="text-xl text-blue-100">
            Review all {questionBank.length} questions with correct answers and explanations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Job Details */}
          {jobInfo && (
            <div className="lg:col-span-4">
              <JobDetailsSidebar jobInfo={jobInfo} assessmentType="certification" />
            </div>
          )}

          {/* Main Content Area */}
          <div className={jobInfo ? "lg:col-span-8" : "lg:col-span-12"}>
            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="text-4xl mr-4">📚</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Study All Questions</h2>
                  <p className="text-gray-700 mb-3">
                    The actual exam will randomly select 20 questions from this bank of {questionBank.length} questions. 
                    Review all questions below to maximize your chances of passing.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-1">✓</span>
                      <span>Correct answers highlighted</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-1">•</span>
                      <span>Passing score: 60% (12/20)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-1">•</span>
                      <span>30-minute time limit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {questionBank.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {question.question}
                    </h3>
                  </div>

                  <div className="ml-14 space-y-3 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === question.correctAnswer;
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className={isCorrect ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                              {option}
                            </span>
                            {isCorrect && (
                              <span className="ml-auto text-green-600 font-bold">✓ Correct</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-14 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Explanation:</p>
                    <p className="text-sm text-gray-700">{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Take the Exam?
              </h3>
              <p className="text-gray-700 mb-6">
                Review these questions until you feel confident, then take the certification exam.
              </p>
              <a
                href={`/certification${jobInfo ? `?job=${encodeURIComponent(jobInfo.title)}&company=${encodeURIComponent(jobInfo.company)}&pay=${encodeURIComponent(jobInfo.pay)}&location=${encodeURIComponent(jobInfo.location)}&type=${encodeURIComponent(jobInfo.type)}` : ''}`}
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Take the Certification Exam →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
