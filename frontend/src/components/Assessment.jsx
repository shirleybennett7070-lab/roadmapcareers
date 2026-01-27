import { useState, useEffect } from 'react';
import brandmark from '../assets/brandmark.png';
import Header from './Header';
import Footer from './Footer';
import JobDetailsSidebar from './JobDetailsSidebar';
import { API_URL } from '../config/api';

const questions = [
  {
    id: 1,
    text: 'How would you describe your professional work experience?',
    options: [
      'No experience, but eager to learn',
      'Some experience (less than 1 year)',
      '1-3 years of experience',
      '3+ years of experience'
    ]
  },
  {
    id: 2,
    text: 'What is your availability for remote work?',
    options: [
      'Full-time (40+ hours/week)',
      'Part-time (20-30 hours/week)',
      'Flexible hours',
      'Evenings/weekends only'
    ]
  },
  {
    id: 3,
    text: 'How comfortable are you with technology and computer tools?',
    options: [
      'Very comfortable - I use multiple tools daily',
      'Comfortable - Basic computer skills',
      'Learning - Need some guidance',
      'Beginner - Willing to learn'
    ]
  },
  {
    id: 4,
    text: 'What is your highest level of education?',
    options: [
      'High school diploma or equivalent',
      'Some college',
      'Associate or Bachelor\'s degree',
      'Graduate degree or higher'
    ]
  },
  {
    id: 5,
    text: 'How would you describe your communication skills?',
    options: [
      'Excellent - I communicate clearly and confidently',
      'Good - I can express myself well',
      'Average - I get my point across',
      'Developing - I\'m working on improving'
    ]
  },
  {
    id: 6,
    text: 'What type of work environment do you prefer?',
    options: [
      'Independent - I work best alone',
      'Collaborative - I enjoy working with others',
      'Mixed - I like a balance of both',
      'Flexible - I can adapt to any environment'
    ]
  },
  {
    id: 7,
    text: 'How do you handle learning new skills?',
    options: [
      'I pick things up very quickly',
      'I learn at a steady pace with practice',
      'I need clear instructions and guidance',
      'I prefer hands-on training and examples'
    ]
  },
  {
    id: 8,
    text: 'What is your primary motivation for finding remote work?',
    options: [
      'Flexibility and work-life balance',
      'Better pay and career growth',
      'Start a new career path',
      'Avoid commuting and work from home'
    ]
  },
  {
    id: 9,
    text: 'How organized are you with managing tasks and deadlines?',
    options: [
      'Very organized - I plan everything ahead',
      'Organized - I keep track of important tasks',
      'Somewhat organized - I manage most things',
      'Working on it - I need help staying organized'
    ]
  },
  {
    id: 10,
    text: 'What is your experience with problem-solving?',
    options: [
      'I enjoy challenges and find solutions quickly',
      'I can solve most problems with some time',
      'I prefer step-by-step guidance',
      'I\'m learning to approach problems systematically'
    ]
  },
  {
    id: 11,
    text: 'How do you handle stressful situations or pressure?',
    options: [
      'I stay calm and focused under pressure',
      'I manage stress well most of the time',
      'I sometimes feel overwhelmed but push through',
      'I\'m learning better stress management techniques'
    ]
  },
  {
    id: 12,
    text: 'Do you currently have any professional certifications or completed training programs?',
    options: [
      'Yes, I have relevant certifications',
      'Yes, but in a different field',
      'No, but I\'ve completed some training courses',
      'No certifications or formal training yet'
    ]
  },
  {
    id: 13,
    text: 'What are you hoping to achieve in the next 6-12 months?',
    options: [
      'Land a stable remote job',
      'Develop new professional skills',
      'Increase my income significantly',
      'Build a long-term career path'
    ]
  }
];

export default function Assessment() {
  const [stage, setStage] = useState('contact'); // contact, assessment, success
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);

  // Prevent page refresh/close during assessment
  useEffect(() => {
    if (stage === 'assessment') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your assessment progress will be lost!';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [stage]);

  // Parse job info from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobData = {
      title: params.get('title') || params.get('job'),
      company: params.get('company'),
      pay: params.get('pay') || params.get('salary'),
      location: params.get('location'),
      type: params.get('type'),
      originalUrl: params.get('url') || ''
    };
    
    console.log('URL Search:', window.location.search);
    console.log('Parsed Job Data:', jobData);
    
    // Only set if at least one parameter exists
    if (Object.values(jobData).some(val => val)) {
      setJobInfo(jobData);
      console.log('Job info set!');
    } else {
      console.log('No job info found in URL');
    }
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setStage('assessment');
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer before continuing.');
      return;
    }

    setAnswers({ ...answers, [currentQuestion]: selectedAnswer });
    setSelectedAnswer(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/assessment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: contactInfo.email })
      });

      const result = await response.json();

      if (result.success) {
        setStage('success');
      } else {
        alert('Something went wrong. Please try again or contact support.');
      }
    } catch (error) {
      alert('Connection error. Please check your internet and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Content with Two-Column Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Job Details (visible when jobInfo exists) */}
          {jobInfo && (
            <div className="lg:col-span-4">
              <JobDetailsSidebar jobInfo={jobInfo} />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`${jobInfo ? 'lg:col-span-8' : 'lg:col-span-12 max-w-3xl mx-auto w-full'}`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8 md:p-12">
            {/* Contact Info Stage */}
            {stage === 'contact' && (
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  Candidate Assessment
                </h2>
                <p className="text-gray-600 mb-8">
                  Thank you for your interest. 
                  Please provide your information below to begin the assessment.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-6 text-left">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactInfo.fullName}
                      onChange={(e) => setContactInfo({ ...contactInfo, fullName: e.target.value })}
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
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
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
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start Assessment
                  </button>
                </form>

                {/* Warning Message */}
                <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-left">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-900 mb-1">Important Notice</p>
                      <p className="text-yellow-800">
                        Once you begin the assessment, do not refresh or close this page. All progress will be lost if you do.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Stage */}
            {stage === 'assessment' && (
              <div>
                {/* Warning Banner */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 italic">
                    Do not refresh this page - Your progress will be lost.
                  </p>
                </div>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div
                      className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div>
                  <span className="text-sm text-gray-500 block mb-3">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    {questions[currentQuestion].text}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAnswer === index
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="answer"
                            checked={selectedAnswer === index}
                            onChange={() => setSelectedAnswer(index)}
                            className="mr-3 w-5 h-5"
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full mt-8 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : currentQuestion < questions.length - 1 ? 'Next' : 'Complete Assessment'}
                  </button>
                </div>
              </div>
            )}

            {/* Success Stage */}
            {stage === 'success' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                  Assessment Complete!
                </h2>
                <p className="text-gray-600 mb-4">
                  Thank you for completing the assessment.
                </p>
                <p className="text-gray-600">
                  Someone will reach out about next steps.
                </p>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer minimal />
    </div>
  );
}
