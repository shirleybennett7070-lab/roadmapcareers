import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Store running processes
const runningProcesses = new Map();

/**
 * Run a script and track its output
 */
function runScript(scriptName, scriptPath) {
  // Kill existing process if running
  if (runningProcesses.has(scriptName)) {
    const existing = runningProcesses.get(scriptName);
    if (!existing.killed) {
      existing.process.kill();
    }
  }

  // Use Cursor's bundled node
  const nodePath = '/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node';
  
  const process = spawn(nodePath, [scriptPath], {
    cwd: path.join(__dirname, '../../')
  });

  const processInfo = {
    process,
    output: [{ type: 'stdout', text: `Starting ${scriptName}...\n`, timestamp: Date.now() }],
    status: 'running',
    startTime: Date.now(),
    killed: false
  };

  process.stdout.on('data', (data) => {
    const output = data.toString();
    processInfo.output.push({ type: 'stdout', text: output, timestamp: Date.now() });
    // Keep only last 200 lines
    if (processInfo.output.length > 200) {
      processInfo.output = processInfo.output.slice(-200);
    }
  });

  process.stderr.on('data', (data) => {
    const output = data.toString();
    processInfo.output.push({ type: 'stderr', text: output, timestamp: Date.now() });
    // Keep only last 200 lines
    if (processInfo.output.length > 200) {
      processInfo.output = processInfo.output.slice(-200);
    }
  });

  process.on('error', (error) => {
    processInfo.output.push({ type: 'stderr', text: `Error: ${error.message}\n`, timestamp: Date.now() });
    processInfo.status = 'failed';
  });

  process.on('close', (code) => {
    processInfo.status = code === 0 ? 'completed' : 'failed';
    processInfo.exitCode = code;
    processInfo.endTime = Date.now();
  });

  runningProcesses.set(scriptName, processInfo);
  return processInfo;
}

/**
 * Get script status
 */
router.get('/status/:scriptName', (req, res) => {
  const { scriptName } = req.params;
  const info = runningProcesses.get(scriptName);

  if (!info) {
    return res.json({ status: 'idle', output: [] });
  }

  res.json({
    status: info.status,
    output: info.output.slice(-50), // Last 50 lines
    startTime: info.startTime,
    endTime: info.endTime,
    exitCode: info.exitCode
  });
});

/**
 * Fetch jobs
 */
router.post('/fetch-jobs', (req, res) => {
  const scriptPath = path.join(__dirname, '../jobs/scripts/fetchJobs.js');
  runScript('fetch-jobs', scriptPath);
  res.json({ message: 'Fetch jobs started', status: 'running' });
});

/**
 * Enrich domains (guess from company names)
 */
router.post('/enrich-domains', (req, res) => {
  const scriptPath = path.join(__dirname, '../jobs/scripts/enrichDomains.js');
  runScript('enrich-domains', scriptPath);
  res.json({ message: 'Domain enrichment started', status: 'running' });
});

/**
 * Find real domains (web search)
 */
router.post('/find-domains', (req, res) => {
  const scriptPath = path.join(__dirname, '../jobs/scripts/scrapeCompanyWebsites.js');
  runScript('find-domains', scriptPath);
  res.json({ message: 'Domain finder started', status: 'running' });
});

/**
 * Verify domains (free DNS/HTTP check)
 */
router.post('/verify-domains', (req, res) => {
  const scriptPath = path.join(__dirname, '../jobs/scripts/freeVerifyDomains.js');
  runScript('verify-domains', scriptPath);
  res.json({ message: 'Domain verification started', status: 'running' });
});

/**
 * Scrape company emails
 */
router.post('/scrape-emails', (req, res) => {
  const scriptPath = path.join(__dirname, '../jobs/scripts/scrapeCompanyEmails.js');
  runScript('scrape-emails', scriptPath);
  res.json({ message: 'Email scraper started', status: 'running' });
});

/**
 * Stop a running script
 */
router.post('/stop/:scriptName', (req, res) => {
  const { scriptName } = req.params;
  const info = runningProcesses.get(scriptName);

  if (!info || info.killed) {
    return res.json({ message: 'Script not running', status: 'idle' });
  }

  info.process.kill();
  info.killed = true;
  info.status = 'stopped';

  res.json({ message: 'Script stopped', status: 'stopped' });
});

/**
 * Get all scripts status
 */
router.get('/status', (req, res) => {
  const scripts = [
    'fetch-jobs',
    'enrich-domains',
    'find-domains',
    'verify-domains',
    'scrape-emails'
  ];

  const status = {};
  scripts.forEach(name => {
    const info = runningProcesses.get(name);
    status[name] = info ? {
      status: info.status,
      startTime: info.startTime,
      endTime: info.endTime
    } : { status: 'idle' };
  });

  res.json(status);
});

export default router;
