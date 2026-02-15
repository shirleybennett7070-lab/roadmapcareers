import express from 'express';
import { getLead, upsertLead, moveToStage } from '../email/services/leadsService.js';

const router = express.Router();

// 5 days delay for rejection email (5 days in prod, 2 min in dev for testing)
const REJECTION_DELAY_MS = process.env.NODE_ENV === 'production'
  ? 5 * 24 * 60 * 60 * 1000  // 5 days
  : 2 * 60 * 1000;            // 2 minutes

/**
 * POST /api/technical-assessment/complete
 * Handle technical assessment completion - saves score and schedules rejection email
 */
router.post('/complete', async (req, res) => {
  try {
    const { email, name, score, totalQuestions, jobTitle, jobCompany } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    console.log(`\n🔧 Technical Assessment completed by: ${email}`);
    console.log(`   Name: ${name || 'Unknown'}`);
    console.log(`   Score: ${score}/${totalQuestions} (${percentage}%)`);
    if (jobTitle) console.log(`   Job: ${jobTitle} at ${jobCompany}`);

    // Get or create lead
    let lead = await getLead(email);

    if (!lead) {
      console.log(`  ℹ️  Creating new lead for: ${email}`);
      lead = {
        email,
        name: name || 'Technical Assessment User',
        stage: moveToStage.paid(),
        notes: 'Lead created from technical assessment completion'
      };
    }

    // Schedule rejection email for 5 days later
    const rejectionEmailTime = new Date(Date.now() + REJECTION_DELAY_MS).toISOString();
    const delayDays = REJECTION_DELAY_MS / (24 * 60 * 60 * 1000);

    // Update lead notes with technical assessment result + schedule rejection
    const techNote = `\nTechnical Assessment: ${score}/${totalQuestions} (${percentage}%) - ${new Date().toISOString()}`;

    await upsertLead({
      ...lead,
      name: name || lead.name,
      notes: (lead.notes || '') + techNote,
      pendingEmailTime: rejectionEmailTime,
      pendingEmailType: 'rejection'
    });

    console.log(`  ✓ Lead updated with technical assessment results`);
    console.log(`  ⏱️  Rejection email scheduled for: ${rejectionEmailTime} (in ${delayDays >= 1 ? delayDays + ' days' : Math.round(REJECTION_DELAY_MS / 60000) + ' min'})`);

    res.json({
      success: true,
      message: 'Technical assessment results saved',
      score,
      totalQuestions
    });

  } catch (error) {
    console.error('Error processing technical assessment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
