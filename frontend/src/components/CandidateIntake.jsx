import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import JobDetailsSidebar from './JobDetailsSidebar';
import { API_URL } from '../config/api';

export default function CandidateIntake() {
  const [jobInfo, setJobInfo] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    dob: '',
    phone: '',
    cityState: '',
    linkedin: '',

    education: '',
    experience: '',
    skills: '',
    salaryExpectation: '',
    availability: '',
    workAuthorization: '',
    whyInterested: '',
    referral: '',
    consentToRepresent: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setJobInfo({
      title: params.get('job') || '',
      company: params.get('company') || '',
      pay: params.get('pay') || '',
      location: params.get('location') || '',
      type: params.get('type') || 'Customer Service',
      url: params.get('url') || '',
      description: params.get('description') || '',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.consentToRepresent) {
      setError('You must agree to the consent to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/email/intake/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Unable to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
            <div className="text-5xl mb-4">&#10003;</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
            <p className="text-gray-600 mb-2">
              Thank you, <span className="font-semibold">{form.fullName}</span>. We've received your information.
            </p>
            <p className="text-gray-500 text-sm">
              We'll follow up with the next steps shortly. Keep an eye on your inbox.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Job Details */}
          <div className="lg:col-span-4">
            <JobDetailsSidebar jobInfo={jobInfo} assessmentType="intake" />
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidate Application</h1>
              <p className="text-gray-500 mb-8">
                Please fill out the form below so we can represent you for this role. This takes about 2 minutes.
              </p>


              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use the same email you've been communicating with.</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* City / State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City, State
                  </label>
                  <input
                    type="text"
                    name="cityState"
                    value={form.cityState}
                    onChange={handleChange}
                    placeholder="Austin, TX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Highest Education */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Highest Education Level
                  </label>
                  <select
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="High School / GED">High School / GED</option>
                    <option value="Some College">Some College</option>
                    <option value="Associate's Degree">Associate's Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Trade / Vocational">Trade / Vocational</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Work Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Brief Work Experience
                  </label>
                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. 2 years retail, 1 year call center, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* Key Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Key Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="e.g. Typing 60 WPM, Bilingual (English/Spanish), Microsoft Office, CRM software"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Typing speed, languages, software, certifications, etc.</p>
                </div>

                {/* Salary Expectation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Salary / Pay Expectation
                  </label>
                  <input
                    type="text"
                    name="salaryExpectation"
                    value={form.salaryExpectation}
                    onChange={handleChange}
                    placeholder="e.g. $15-20/hr, $40k/year, flexible"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Availability / Earliest Start Date
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    placeholder="e.g. Available immediately, or Starting March 1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Work Authorization */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Work Authorization
                  </label>
                  <select
                    name="workAuthorization"
                    value={form.workAuthorization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="US Citizen">US Citizen</option>
                    <option value="Permanent Resident (Green Card)">Permanent Resident (Green Card)</option>
                    <option value="Work Visa (H-1B, L-1, etc.)">Work Visa (H-1B, L-1, etc.)</option>
                    <option value="DACA / EAD">DACA / EAD</option>
                    <option value="OPT / CPT">OPT / CPT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Why Interested */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Why are you interested in this role?
                  </label>
                  <textarea
                    name="whyInterested"
                    value={form.whyInterested}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us briefly why this role is a good fit for you..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* How did you hear about us */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="Email">Email</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Friend / Referral">Friend / Referral</option>
                    <option value="Job Board">Job Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Consent */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentToRepresent"
                      checked={form.consentToRepresent}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Authorization</span> <span className="text-red-500">*</span>
                      <br />
                      I confirm the information provided is accurate and I authorize RoadmapCareers to submit my application for the role listed above.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
