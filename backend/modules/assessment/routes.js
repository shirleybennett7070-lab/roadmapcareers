import express from 'express';
import { getLead, upsertLead, moveToStage } from '../email/services/leadsService.js';

const router = express.Router();

// Delay before sending follow-up email (3 hours in prod, 1 min in dev)
const EMAIL_DELAY_MS = process.env.NODE_ENV === 'production' 
  ? 3 * 60 * 60 * 1000  // 3 hours
  : 60 * 1000;          // 1 minute

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
      lead = {
        email: email,
        name: 'Assessment User',
        stage: moveToStage.jobsListSent(),
        firstContact: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        notes: 'Lead created from assessment completion'
      };
    }

    // Calculate when to send the follow-up email
    const pendingEmailTime = new Date(Date.now() + EMAIL_DELAY_MS).toISOString();
    const delayMinutes = EMAIL_DELAY_MS / 60000;

    // Update lead with scheduled email (cron job will send it)
    await upsertLead({
      ...lead,
      stage: moveToStage.assessmentCompleted(),
      assessmentCompleted: true,
      pendingEmailTime: pendingEmailTime,
      pendingEmailType: 'skill_assessment_offer',
      notes: `${lead.notes || ''}\nCandidate assessment completed: ${new Date().toISOString()}`
    });

    console.log(`  ✓ Lead updated to ASSESSMENT_COMPLETED`);
    console.log(`  ⏱️  Follow-up email scheduled for: ${pendingEmailTime} (in ${delayMinutes} min)`);

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
