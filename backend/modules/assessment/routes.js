import express from 'express';
import { getLead, upsertLead, moveToStage } from '../email/services/leadsService.js';
import { sendEmail } from '../email/config/gmail.js';
import { getSkillAssessmentOfferTemplate } from '../email/services/templates.js';

const router = express.Router();

// Delay before sending follow-up email (1 hour in prod, 1 min in local)
const EMAIL_DELAY_MS = process.env.NODE_ENV === 'production' 
  ? 60 * 60 * 1000  // 1 hour
  : 60 * 1000;      // 1 minute

/**
 * POST /api/assessment/complete
 * Handle assessment completion
 */
router.post('/complete', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`📝 Assessment completed by: ${email}`);

    // Get or create lead
    let lead = await getLead(email);

    if (!lead) {
      console.log(`  ℹ️  Creating new lead for: ${email}`);
      // Create a new lead if they don't exist
      lead = {
        email: email,
        name: 'Assessment User',
        stage: moveToStage.jobsListSent(),
        firstContact: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        notes: 'Lead created from assessment completion'
      };
    }

    // Update lead stage to ASSESSMENT_COMPLETED and mark assessment as done
    await upsertLead({
      ...lead,
      stage: moveToStage.assessmentCompleted(),
      assessmentCompleted: true,
      notes: `${lead.notes || ''}\nCandidate assessment completed: ${new Date().toISOString()}`
    });

    console.log(`  ✓ Lead updated to ASSESSMENT_COMPLETED`);

    // Schedule skill assessment offer email with delay
    const delayMinutes = EMAIL_DELAY_MS / 60000;
    console.log(`  ⏱️  Scheduling skill assessment offer in ${delayMinutes} minute(s)...`);
    
    // Send email after delay (non-blocking)
    setTimeout(async () => {
      try {
        const template = await getSkillAssessmentOfferTemplate(lead.name);
        
        if (template) {
          await sendEmail(
            email,
            template.subject,
            template.body
          );
          console.log(`  ✉️  Skill assessment offer sent to: ${email} (after ${delayMinutes} min delay)`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to send delayed email to ${email}:`, err.message);
      }
    }, EMAIL_DELAY_MS);

    res.json({
      success: true,
      message: `Assessment completed! Follow-up email scheduled in ${delayMinutes} minute(s).`
    });

  } catch (error) {
    console.error('Error processing assessment completion:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
