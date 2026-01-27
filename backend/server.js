import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import fs from 'fs';

// Load environment-specific .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.join(__dirname, envFile);

// Try environment-specific file first, fall back to .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`📁 Loaded environment: ${envFile}`);
} else {
  dotenv.config(); // Falls back to .env
  console.log(`📁 Loaded environment: .env (default)`);
}

// Import module routers
import jobsRouter from './modules/jobs/routes.js';
import emailRouter from './modules/email/routes.js';
import assessmentRouter from './modules/assessment/routes.js';
import skillAssessmentRouter from './modules/skillAssessment/routes.js';
import certificationsRouter from './modules/certifications/routes.js';
import paymentsRouter from './modules/payments/routes.js';

// Import email processor for cron job
import { processInbox, processPendingEmails } from './modules/email/services/emailProcessor.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RoadmapCareers API is running' });
});

// Module routes
app.use('/api/jobs', jobsRouter);
app.use('/api/email', emailRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/skill-assessment', skillAssessmentRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/payments', paymentsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 RoadmapCareers API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Assessment: http://localhost:${PORT}/assessment.html`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`  GET  /api/jobs             - Get all jobs`);
  console.log(`  POST /api/jobs/fetch       - Fetch new jobs from APIs`);
  console.log(`  POST /api/jobs             - Add a job manually`);
  console.log(`  POST /api/email/process    - Process inbox & auto-reply`);
  console.log(`  GET  /api/email/leads      - Get all leads`);
  console.log(`  POST /api/email/setup      - Initialize leads sheet`);
  console.log(`  POST /api/assessment/complete - Complete assessment`);
  console.log(`  POST /api/skill-assessment/complete - Complete skill assessment`);
  console.log(`  POST /api/certifications/exam-result - Save exam result`);
  console.log(`  GET  /api/certifications/exam-result/:token - Get result by token`);
  console.log(`  POST /api/certifications/payment/:token - Update payment status`);
  console.log(`  POST /api/payments/create-checkout-session - Create Stripe checkout`);
  console.log(`  POST /api/payments/verify - Verify payment`);
  console.log(`  GET  /api/payments/config - Get Stripe config`);
  
  // Start email processing cron job
  startEmailCron();
});

/**
 * Email Processing Cron Job
 * - Production ONLY: Every 1 minute (TESTING)
 * - Development: DISABLED (to avoid duplicate emails with prod)
 */
function startEmailCron() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Only run email cron in production to avoid duplicates
  if (!isProduction) {
    console.log('\n⏰ Email cron job DISABLED in development (production only)');
    return;
  }
  
  const cronSchedule = '* * * * *'; // Every minute for testing
  const intervalText = 'every minute';
  
  console.log(`\n⏰ Email cron job scheduled: ${intervalText} (${cronSchedule})`);
  
  cron.schedule(cronSchedule, async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🔄 Cron: Processing emails...`);
    
    try {
      // Process incoming emails
      const inboxResult = await processInbox();
      console.log(`[${timestamp}] ✅ Inbox: ${inboxResult.processed} processed, ${inboxResult.responded} responded`);
      
      // Process scheduled/pending emails
      const pendingResult = await processPendingEmails();
      if (pendingResult.sent > 0) {
        console.log(`[${timestamp}] ✅ Pending: ${pendingResult.sent} scheduled email(s) sent`);
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Cron error:`, error.message);
    }
  });
}
