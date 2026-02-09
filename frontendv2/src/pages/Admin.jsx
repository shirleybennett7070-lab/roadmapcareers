import React, { useState, useEffect } from 'react';
import './Admin.css';

const API_URL = 'http://localhost:3000/api/admin';

const SCRIPTS = [
  {
    id: 'fetch-jobs',
    name: 'Step 1: Fetch Jobs',
    description: 'Get remote jobs from all API sources',
    icon: '📥'
  },
  {
    id: 'enrich-domains',
    name: 'Step 2: Guess Domains',
    description: 'Auto-generate company domains from names',
    icon: '🔤'
  },
  {
    id: 'verify-domains',
    name: 'Step 3: Verify Domains',
    description: 'Check if guessed domains exist (DNS/HTTP)',
    icon: '✅'
  },
  {
    id: 'find-domains',
    name: 'Step 4: Scrape Company Websites',
    description: 'Searches the web for real company domains when guessed ones fail',
    icon: '🌐'
  },
  {
    id: 'scrape-emails',
    name: 'Step 5: Scrape HR Emails',
    description: 'Extract contact emails from verified websites',
    icon: '📧'
  }
];

function Admin() {
  const [scriptStatuses, setScriptStatuses] = useState({});
  const [selectedScript, setSelectedScript] = useState(null);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  // Poll for status updates
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        setScriptStatuses(data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch output for selected script
  useEffect(() => {
    if (!selectedScript) return;

    const fetchOutput = async () => {
      try {
        const response = await fetch(`${API_URL}/status/${selectedScript}`);
        const data = await response.json();
        setOutput(data.output || []);
      } catch (error) {
        console.error('Failed to fetch output:', error);
      }
    };

    fetchOutput();
    const interval = setInterval(fetchOutput, 1000);

    return () => clearInterval(interval);
  }, [selectedScript]);

  const runScript = async (scriptId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${scriptId}`, {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message);
      setSelectedScript(scriptId);
    } catch (error) {
      alert('Failed to start script: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const stopScript = async (scriptId) => {
    try {
      const response = await fetch(`${API_URL}/stop/${scriptId}`, {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to stop script: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'failed': return '#f44336';
      case 'stopped': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    if (!status || status === 'idle') return 'Idle';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Job Scraper Admin</h1>
        <p>Control and monitor all data collection scripts</p>
      </div>

      <div className="admin-content">
        {/* Scripts Grid */}
        <div className="scripts-grid">
          {SCRIPTS.map(script => {
            const status = scriptStatuses[script.id]?.status || 'idle';
            const isRunning = status === 'running';

            return (
              <div key={script.id} className="script-card">
                <div className="script-icon">{script.icon}</div>
                <h3>{script.name}</h3>
                <p>{script.description}</p>
                
                <div className="script-status" style={{ backgroundColor: getStatusColor(status) }}>
                  {getStatusText(status)}
                </div>

                <div className="script-actions">
                  <button
                    onClick={() => runScript(script.id)}
                    disabled={isRunning || loading}
                    className="btn-primary"
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                  
                  {isRunning && (
                    <button
                      onClick={() => stopScript(script.id)}
                      className="btn-danger"
                    >
                      Stop
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedScript(script.id)}
                    className="btn-secondary"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Console */}
        {selectedScript && (
          <div className="output-console">
            <div className="console-header">
              <h3>📜 Output: {SCRIPTS.find(s => s.id === selectedScript)?.name}</h3>
              <button onClick={() => setSelectedScript(null)} className="btn-close">
                ✕
              </button>
            </div>
            <div className="console-output">
              {output.length === 0 ? (
                <div className="console-empty">No output yet...</div>
              ) : (
                output.map((line, index) => (
                  <div
                    key={index}
                    className={`console-line ${line.type}`}
                  >
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workflow Guide */}
      <div className="workflow-guide">
        <h2>📋 Workflow Steps (Run in Order)</h2>
        <ol>
          <li><strong>Step 1: Fetch Jobs</strong> → Download jobs from APIs (RemoteOK, Remotive, Adzuna, Jooble)</li>
          <li><strong>Step 2: Guess Domains</strong> → Auto-generate domains like "apexfocusgroup.com" from company names</li>
          <li><strong>Step 3: Verify Domains</strong> → Check which guessed domains actually exist (FREE DNS/HTTP check)</li>
          <li><strong>Step 4: Scrape Company Websites</strong> → DuckDuckGo search for real company domains when guessed ones fail verification</li>
          <li><strong>Step 5: Scrape HR Emails</strong> → Visit company websites and extract HR contact emails (jobs@, careers@, hr@)</li>
        </ol>
        <div style={{ marginTop: '20px', padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
          <strong>💡 Pro Tip:</strong> Steps 3 & 4 can be run together, but Step 4 is slow (~48 min for 283 companies)
        </div>
      </div>
    </div>
  );
}

export default Admin;
