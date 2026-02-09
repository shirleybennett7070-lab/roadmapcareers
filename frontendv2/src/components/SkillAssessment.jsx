import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import JobDetailsSidebar from './JobDetailsSidebar';
import { API_URL } from '../config/api';

const questions = [
  {
    id: 1,
    text: 'You\'re working remotely and realize your task management tool has been down for 2 hours. Your team hasn\'t noticed yet, and you have 5 critical deadlines today. What\'s your best approach?',
    options: [
      'Continue working on what you remember from your task list and sync later when the tool is back',
      'Immediately notify the team, document your tasks offline, communicate priorities via email/Slack, and continue working with offline backup',
      'Take this as an opportunity to work on lower priority tasks that don\'t require the tool',
      'Contact IT support first, then wait for their response before deciding next steps'
    ]
  },
  {
    id: 2,
    text: 'You\'ve been working remotely for 3 months. Your metrics show you complete fewer tasks per day than in-office colleagues, but your work quality scores are higher. Your manager hasn\'t mentioned it. What should you do?',
    options: [
      'Continue your current approach since quality is more important than quantity',
      'Analyze your workflow to find efficiency gains without sacrificing quality, then share insights with manager',
      'Proactively schedule a meeting to discuss metrics, explain your process focus, and propose solutions',
      'Start tracking extra context that metrics don\'t capture (complexity, research time) to explain the difference'
    ]
  },
  {
    id: 3,
    text: 'During a critical video presentation to a client, your internet becomes unstable and video keeps freezing. You\'re 10 minutes into a 30-minute presentation. What\'s the most professional action?',
    options: [
      'Switch to phone audio immediately, apologize briefly, continue presenting while sharing screen if possible',
      'Ask client to wait 2 minutes while you switch to mobile hotspot and try to restore video quality',
      'Continue with unstable connection and offer to resend the presentation materials afterward',
      'Pause briefly, explain the situation, offer to reschedule or switch to phone audio, let client decide'
    ]
  },
  {
    id: 4,
    text: 'Your remote team is across 4 time zones (US East, West, UK, India). You need quick decisions from all team members on an urgent project issue. It\'s 9 AM your time (PST). How do you handle this?',
    options: [
      'Schedule a meeting at a compromise time (early morning PST / evening UK)',
      'Send a detailed async message with context, clear questions, deadline, and offer to have 1-on-1 calls if needed',
      'Contact people currently online for quick decisions, then update others after',
      'Create a shared doc with the issue, tag everyone, and ask them to add input when available'
    ]
  },
  {
    id: 5,
    text: 'You notice a colleague in another department is consistently missing remote meetings and deadlines, affecting your project. You\'ve never met them in person. What\'s your approach?',
    options: [
      'Document the instances and share with your manager to handle appropriately',
      'Send them a direct message to understand their challenges and offer help',
      'Adjust your project timeline to account for their delays without confrontation',
      'Cc their manager in an email outlining the impact on the project timeline'
    ]
  },
  {
    id: 6,
    text: 'Your home office setup is in your bedroom (limited space). During a video call, a colleague makes a comment about your "unprofessional" background. How do you respond?',
    options: [
      'Explain that not everyone has dedicated office space and you\'re doing your best',
      'Thank them for feedback, mention you\'ll use virtual background going forward',
      'Acknowledge feedback professionally, explain space constraints, offer to improve lighting/framing, refocus on work',
      'Politely point out that many remote workers face similar space constraints'
    ]
  },
  {
    id: 7,
    text: 'You\'re asked to train a new remote hire who is struggling with company tools and processes. They\'re in a different time zone and seem overwhelmed. What\'s the best approach?',
    options: [
      'Set up weekly check-in calls during overlapping hours and be available via Slack',
      'Create detailed documentation and async video tutorials they can reference anytime',
      'Pair them with a teammate in their timezone who can provide real-time support',
      'Combine async video tutorials, scheduled check-ins, screen-recorded workflows, and buddy system'
    ]
  },
  {
    id: 8,
    text: 'You accidentally sent a message complaining about a project to the entire company Slack instead of a private DM to your friend. The message is mildly critical but not offensive. What do you do?',
    options: [
      'Immediately post a follow-up acknowledging the mistake and clarifying your intent professionally',
      'Delete it quickly and send a brief apology to the channel',
      'Message your manager privately to explain the situation before others see it',
      'Acknowledge the mistake, apologize for the confusion, and take the conversation offline'
    ]
  },
  {
    id: 9,
    text: 'Working remotely, you consistently finish your 8 hours of work in 5-6 hours due to high efficiency and no commute. Your quality is excellent. What\'s the most professional approach?',
    options: [
      'Use the extra time for professional development and learning new skills',
      'Proactively ask for additional projects or offer to help colleagues',
      'Document your efficiency gains and propose a flexible schedule to your manager',
      'Continue current pace and use extra time for personal tasks since output is strong'
    ]
  },
  {
    id: 10,
    text: 'Your company uses 6 different communication tools (Slack, Teams, Email, Asana, Zoom, Google Docs). You\'re missing important messages. How do you solve this systematically?',
    options: [
      'Consolidate notifications into one app and check the others 2-3 times daily on schedule',
      'Propose to team that they standardize on fewer tools for better efficiency',
      'Set up specific check times for each tool, enable smart notifications, document where info lives, propose team guidelines',
      'Use browser tabs for all tools and cycle through them every 30 minutes'
    ]
  },
  {
    id: 11,
    type: 'text',
    text: 'You\'re working remotely and your manager just messaged you at 8 PM (outside work hours) with an "urgent" request that will take 3 hours. You have personal commitments tonight. Write your response (minimum 10 characters):',
    placeholder: 'Type your response here...',
    minChars: 10
  },
  {
    id: 12,
    type: 'text',
    text: 'Describe your ideal remote work routine that maximizes productivity. Include how you manage your time, workspace, communication, and work-life boundaries (minimum 10 characters):',
    placeholder: 'Describe your routine here...',
    minChars: 10
  }
];

export default function SkillAssessment() {
  const [stage, setStage] = useState('contact'); // contact, assessment, success
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);
  const [error, setError] = useState('');

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
    
    if (Object.values(jobData).some(val => val)) {
      setJobInfo(jobData);
    }
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setStage('assessment');
  };

  const validateTextAnswer = () => {
    const currentQ = questions[currentQuestion];
    if (currentQ.type === 'text') {
      const charCount = textAnswer.trim().length;
      if (charCount < currentQ.minChars) {
        setError(`Please write at least ${currentQ.minChars} characters. Current: ${charCount} characters.`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestion];
    
    // Validate based on question type
    if (currentQ.type === 'text') {
      if (!textAnswer.trim()) {
        setError('Please provide an answer before continuing.');
        return;
      }
      if (!validateTextAnswer()) {
        return;
      }
      setAnswers({ ...answers, [currentQuestion]: textAnswer });
      setTextAnswer('');
    } else {
      if (selectedAnswer === null) {
        setError('Please select an answer before continuing.');
        return;
      }
      setAnswers({ ...answers, [currentQuestion]: selectedAnswer });
      setSelectedAnswer(null);
    }

    setError('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/skill-assessment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: contactInfo.email,
          answers: answers
        })
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
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Content with Two-Column Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Job Details (visible when jobInfo exists) */}
          {jobInfo && (
            <div className="lg:col-span-4">
              <JobDetailsSidebar jobInfo={jobInfo} assessmentType="skill" />
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
                  Skills Assessment
                </h2>
                <p className="text-gray-600 mb-8">
                  This assessment helps us understand your skills for these roles.
                  Please provide your information below to begin.
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
                    Start Skills Assessment
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQ.text}
                  </h3>

                  {/* Multiple Choice Questions */}
                  {!currentQ.type && (
                    <div className="space-y-3">
                      {currentQ.options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedAnswer(index);
                            setError('');
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAnswer === index
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="radio"
                              name="answer"
                              checked={selectedAnswer === index}
                              onChange={() => {
                                setSelectedAnswer(index);
                                setError('');
                              }}
                              className="mr-3 mt-1 w-5 h-5 flex-shrink-0"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Input Questions */}
                  {currentQ.type === 'text' && (
                    <div>
                      <textarea
                        value={textAnswer}
                        onChange={(e) => {
                          setTextAnswer(e.target.value);
                          setError('');
                        }}
                        placeholder={currentQ.placeholder}
                        rows={8}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Character count: {textAnswer.trim().length} / {currentQ.minChars} minimum
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

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
                  Skills Assessment Complete!
                </h2>
                <p className="text-gray-600 mb-4">
                  Thank you for completing the skills assessment.
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
