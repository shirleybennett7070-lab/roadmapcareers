import express from 'express';
import { processInbox } from './services/emailProcessor.js';
import { getAllLeads, getLead, upsertLead, initializeLeadsSheet, moveToStage } from './services/leadsService.js';
import { sendEmail } from './config/gmail.js';
import { getAssessmentReviewTemplate, getAssessmentOfferTemplate, getInitialResponseTemplate, getTrainingOfferTemplate, getSkillAssessmentOfferTemplate } from './services/templates.js';

const router = express.Router();

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
    
    // Create or update lead - set to jobs list sent stage
    const leadData = {
      email,
      name: name || email.split('@')[0],
      stage: moveToStage.jobsListSent(),
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
      stage: moveToStage.assessmentCompleted(),
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

export default router;
