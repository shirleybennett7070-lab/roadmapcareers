import express from 'express';
import { processInbox } from './services/emailProcessor.js';
import { getAllLeads, getLead, upsertLead, initializeLeadsSheet, moveToStage } from './services/leadsService.js';
import { sendEmail, getAuthUrl, exchangeCodeForTokens, getTokenBase64 } from './config/gmail.js';
import { getAssessmentReviewTemplate, getAssessmentOfferTemplate, getInitialResponseTemplate, getTrainingOfferTemplate, getSkillAssessmentOfferTemplate, getIntakeRequestTemplate } from './services/templates.js';

const router = express.Router();

/**
 * GET /api/email/auth-url
 * Get Gmail OAuth URL for re-authentication
 */
router.get('/auth-url', (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/email/oauth/callback
 * Handle Gmail OAuth callback, save new token
 */
router.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  try {
    await exchangeCodeForTokens(code);
    // Redirect to admin page with success flag
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/admin?gmail_auth=success`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/admin?gmail_auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/email/token-base64
 * Get current token as base64 for env var update
 */
router.get('/token-base64', (req, res) => {
  try {
    const base64 = getTokenBase64();
    if (!base64) {
      return res.status(404).json({ error: 'No token file found' });
    }
    res.json({ base64 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/email/process
 * Process inbox and send auto-replies
 */
router.post('/process', async (req, res) => {
  try {
    const result = await processInbox();
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leads
 * Get all leads
 */
router.get('/leads', async (req, res) => {
  try {
    const leads = await getAllLeads();
    
    res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leads/:email
 * Get specific lead
 */
router.get('/leads/:email', async (req, res) => {
  try {
    const lead = await getLead(req.params.email);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/leads/:email
 * Update lead
 */
router.put('/leads/:email', async (req, res) => {
  try {
    const lead = await getLead(req.params.email);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    
    const updated = await upsertLead({
      ...lead,
      ...req.body,
      email: req.params.email // Keep email same
    });
    
    res.json({
      success: true,
      lead: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/setup
 * Initialize leads sheet
 */
router.post('/setup', async (req, res) => {
  try {
    await initializeLeadsSheet();
    
    res.json({
      success: true,
      message: 'Leads sheet initialized'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-initial-response
 * Send initial response email with jobs list to a specific address
 */
router.post('/send-initial-response', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get initial response template
    const template = await getInitialResponseTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.jobsListSent(),
      lastContactDate: new Date().toISOString(),
      notes: 'Initial response sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Initial response email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending initial response:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-soft-pitch
 * Send soft pitch email to a specific address
 */
router.post('/send-soft-pitch', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get soft pitch template (assessment review)
    const template = await getAssessmentReviewTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.softPitchSent(),
      lastContactDate: new Date().toISOString(),
      notes: 'Soft pitch sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Soft pitch email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending soft pitch:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-assessment-offer
 * Send assessment offer email to a specific address
 */
router.post('/send-assessment-offer', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get assessment offer template
    const template = await getAssessmentOfferTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.assessmentOffered(),
      lastContactDate: new Date().toISOString(),
      notes: 'Assessment offer sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Assessment offer email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending assessment offer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-training-offer
 * Send training/certification offer email to a specific address
 */
router.post('/send-training-offer', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get training offer template
    const template = await getTrainingOfferTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.trainingOffered(),
      lastContactDate: new Date().toISOString(),
      notes: 'Training offer sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Training offer email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending training offer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-skill-assessment
 * Send skill assessment offer email to a specific address
 */
router.post('/send-skill-assessment', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get skill assessment offer template
    const template = await getSkillAssessmentOfferTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.assessmentOffered(),
      lastContactDate: new Date().toISOString(),
      notes: 'Skill assessment offer sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Skill assessment email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending skill assessment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-intake-request
 * Send intake request email to a specific address
 */
router.post('/send-intake-request', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Get intake request template
    const template = await getIntakeRequestTemplate(name || email.split('@')[0]);
    
    // Send email
    await sendEmail(email, template.subject, template.body);
    
    // Create or update lead
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.intakeRequested(),
      lastContactDate: new Date().toISOString(),
      notes: 'Intake request sent manually'
    };
    
    await upsertLead(leadData);
    
    res.json({
      success: true,
      message: `Intake request email sent to ${email}`,
      email,
      subject: template.subject
    });
  } catch (error) {
    console.error('Error sending intake request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/intake/submit
 * Handle candidate intake form submission
 */
router.post('/intake/submit', async (req, res) => {
  try {
    const { email, fullName, dob, phone, cityState, linkedin, education, experience, skills, salaryExpectation, availability, workAuthorization, whyInterested, referral, consentToRepresent } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    if (!consentToRepresent) {
      return res.status(400).json({ success: false, error: 'Consent to represent is required' });
    }
    
    console.log(`📋 Intake form submitted by: ${email}`);
    
    // Get existing lead
    let lead = await getLead(email);
    
    if (!lead) {
      lead = {
        email,
        name: fullName || email.split('@')[0],
        stage: moveToStage.intakeRequested(),
        notes: ''
      };
    }
    
    // Build intake info for notes
    const intakeInfo = [
      `\nIntake completed: ${new Date().toISOString()}`,
      fullName ? `Full Name: ${fullName}` : '',
      dob ? `Date of Birth: ${dob}` : '',
      phone ? `Phone: ${phone}` : '',
      cityState ? `Location: ${cityState}` : '',
      linkedin ? `LinkedIn: ${linkedin}` : '',

      education ? `Education: ${education}` : '',
      experience ? `Experience: ${experience}` : '',
      skills ? `Skills: ${skills}` : '',
      salaryExpectation ? `Salary Expectation: ${salaryExpectation}` : '',
      availability ? `Availability: ${availability}` : '',
      workAuthorization ? `Work Authorization: ${workAuthorization}` : '',
      whyInterested ? `Why Interested: ${whyInterested}` : '',
      referral ? `Referral Source: ${referral}` : '',
      `Consent to Represent: YES`
    ].filter(Boolean).join('\n');
    
    // Update lead to intake completed and schedule assessment offer email
    const sendTime = new Date(Date.now() + 60 * 1000); // Send in 1 minute
    await upsertLead({
      ...lead,
      name: fullName || lead.name,
      stage: moveToStage.intakeCompleted(),
      notes: `${lead.notes || ''}${intakeInfo}`,
      pendingEmailType: 'assessment_offer',
      pendingEmailTime: sendTime.toISOString(),
    });
    
    console.log(`  ✓ Lead updated to INTAKE_COMPLETED, assessment offer email scheduled`);
    
    res.json({
      success: true,
      message: 'Intake form submitted successfully. We will be in touch with next steps!'
    });
  } catch (error) {
    console.error('Error processing intake submission:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
