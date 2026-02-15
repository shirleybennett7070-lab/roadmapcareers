import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';

const EMAIL_STAGES = [
  { key: 'initial-response', label: 'Stage 1: Jobs List', endpoint: '/api/email/send-initial-response', color: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30' },
  { key: 'intake-request', label: 'Stage 1B: Candidate Application', endpoint: '/api/email/send-intake-request', color: 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30' },
  { key: 'assessment-offer', label: 'Stage 3: Assessment Offer', endpoint: '/api/email/send-assessment-offer', color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30' },
  { key: 'skill-assessment', label: 'Stage 4: Skill Assessment', endpoint: '/api/email/send-skill-assessment', color: 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30' },
  { key: 'soft-pitch', label: 'Stage 5: Soft Pitch', endpoint: '/api/email/send-soft-pitch', color: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/30' },
  { key: 'training-offer', label: 'Stage 6: Training Offer', endpoint: '/api/email/send-training-offer', color: 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/30' },
  { key: 'payment-confirmation', label: 'Stage 7: Payment Confirm + Tech Assessment', endpoint: '/api/email/send-payment-confirmation', color: 'bg-green-600 hover:bg-green-500 shadow-green-900/30' },
  { key: 'rejection', label: 'Rejection Email', endpoint: '/api/email/send-rejection', color: 'bg-red-600 hover:bg-red-500 shadow-red-900/30' },
];

function Admin() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [results, setResults] = useState([]);
  const [gmailStatus, setGmailStatus] = useState(null); // 'success' | 'error' | null

  // Check for Gmail auth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('gmail_auth');
    if (authStatus === 'success') {
      setGmailStatus('success');
      window.history.replaceState({}, '', '/admin');
    } else if (authStatus === 'error') {
      setGmailStatus('error');
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  const handleGmailAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/email/auth-url`);
      const data = await res.json();
      if (data.success) {
        window.location.href = data.url;
      }
    } catch (err) {
      addResult('Gmail Auth', err.message, false);
    }
  };

  const addResult = useCallback((type, message, success = true) => {
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      message,
      success,
    };
    setResults(prev => [entry, ...prev].slice(0, 50));
  }, []);

  const handleFetchJobs = async () => {
    setFetchingJobs(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/fetch`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const added = data.added || 0;
        const dupes = data.duplicates || 0;
        const msg = added > 0
          ? `${added} new jobs added${dupes ? `, ${dupes} duplicates skipped` : ''}`
          : dupes > 0
            ? `No new jobs (${dupes} duplicates skipped)`
            : data.message || 'No new jobs found from APIs';
        addResult('Fetch Jobs', msg);
      } else {
        addResult('Fetch Jobs', data.error, false);
      }
    } catch (err) {
      addResult('Fetch Jobs', err.message, false);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleProcessEmails = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/email/process`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addResult('Process Inbox', `${data.processed || 0} processed, ${data.responded || 0} responded`);
      } else {
        addResult('Process Inbox', data.error, false);
      }
    } catch (err) {
      addResult('Process Inbox', err.message, false);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendStage = async (stage) => {
    if (!email.trim()) return;
    setSending(stage.key);
    try {
      const res = await fetch(`${API_URL}${stage.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        addResult(stage.label, `Sent to ${email.trim()}`);
      } else {
        addResult(stage.label, data.error, false);
      }
    } catch (err) {
      addResult(stage.label, err.message, false);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">RoadmapCareers Email Management</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Gmail Auth Status */}
        {gmailStatus && (
          <div className={`rounded-xl border p-4 flex items-center justify-between ${
            gmailStatus === 'success'
              ? 'bg-green-950/30 border-green-800 text-green-300'
              : 'bg-red-950/30 border-red-800 text-red-300'
          }`}>
            <span className="text-sm">
              {gmailStatus === 'success'
                ? 'Gmail re-authenticated successfully. Emails should work now.'
                : 'Gmail authentication failed. Try again.'}
            </span>
            <button onClick={() => setGmailStatus(null)} className="text-xs opacity-60 hover:opacity-100 ml-4">Dismiss</button>
          </div>
        )}

        {/* Gmail Auth */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Gmail Connection</h2>
          <p className="text-sm text-gray-400 mb-4">
            If emails fail with "invalid_grant", re-authenticate here. Tokens expire every 7 days in testing mode.
          </p>
          <button
            onClick={handleGmailAuth}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-900/30"
          >
            Re-authenticate Gmail
          </button>
        </div>

        {/* Process Inbox & Fetch Jobs */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Actions</h2>
          <p className="text-sm text-gray-400 mb-4">
            Manually trigger email processing or fetch new job listings from APIs.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleProcessEmails}
              disabled={processing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {processing ? (
                <><Spinner /> Processing...</>
              ) : (
                <><span className="text-lg">&#9654;</span> Process Unread Emails</>
              )}
            </button>
            <button
              onClick={handleFetchJobs}
              disabled={fetchingJobs}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-900/30"
            >
              {fetchingJobs ? (
                <><Spinner /> Fetching...</>
              ) : (
                <><span className="text-lg">&#8635;</span> Fetch Jobs</>
              )}
            </button>
          </div>
        </div>

        {/* Send Stage Emails */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Send Stage Email</h2>
          <p className="text-sm text-gray-400 mb-4">
            Manually send a specific funnel stage email to a recipient.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="email"
              placeholder="Recipient email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="sm:w-48 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMAIL_STAGES.map(stage => (
              <button
                key={stage.key}
                onClick={() => handleSendStage(stage)}
                disabled={!email.trim() || sending !== null}
                className={`px-4 py-3 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg text-sm ${stage.color}`}
              >
                {sending === stage.key ? (
                  <><Spinner /> Sending...</>
                ) : (
                  stage.label
                )}
              </button>
            ))}
          </div>

          {!email.trim() && (
            <p className="text-xs text-gray-600 mt-3">Enter an email address to enable sending.</p>
          )}
        </div>

        {/* Activity Log */}
        {results.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Activity Log</h2>
              <button
                onClick={() => setResults([])}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map(r => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 text-sm px-3 py-2 rounded-lg ${
                    r.success ? 'bg-gray-800/50' : 'bg-red-950/30 border border-red-900/30'
                  }`}
                >
                  <span className="text-gray-500 font-mono text-xs mt-0.5 shrink-0">{r.time}</span>
                  <span className={`font-medium shrink-0 ${r.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.type}
                  </span>
                  <span className="text-gray-300">{r.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Admin;
