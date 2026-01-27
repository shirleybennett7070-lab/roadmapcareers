import express from 'express';
import { getLead, upsertLead, moveToStage } from '../email/services/leadsService.js';
import { sendEmail } from '../email/config/gmail.js';
import { getAssessmentReviewTemplate } from '../email/services/templates.js';

const router = express.Router();

// Delay before sending follow-up email (1 hour in prod, 1 min in local)
const EMAIL_DELAY_MS = process.env.NODE_ENV === 'production' 
  ? 60 * 60 * 1000  // 1 hour
  : 60 * 1000;      // 1 minute

/**
 * POST /api/skill-assessment/complete
 * Handle skill assessment completion
 */
router.post('/complete', async (req, res) => {
  try {
    const { email, answers } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`📝 Skill assessment completed by: ${email}`);

    // Get or create lead
    let lead = await getLead(email);

    if (!lead) {
      console.log(`  ℹ️  Creating new lead for: ${email}`);
      // Create a new lead if they don't exist
      lead = {
        email: email,
        name: 'Skill Assessment User',
        stage: moveToStage.assessmentCompleted(),
        firstContact: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        notes: 'Lead created from skill assessment completion'
      };
    }

    // Store answers in notes (you can expand this to store in a separate sheet if needed)
    const answersNote = answers ? `\nSkill Assessment Answers: ${JSON.stringify(answers)}` : '';

    // Update lead stage to SKILL_ASSESSMENT_COMPLETED and mark as done
    await upsertLead({
      ...lead,
      stage: moveToStage.skillAssessmentCompleted(),
      skillAssessmentCompleted: true,
      notes: `${lead.notes || ''}\nSkill assessment completed: ${new Date().toISOString()}${answersNote}`
    });

    console.log(`  ✓ Lead updated to SKILL_ASSESSMENT_COMPLETED`);

    // Schedule assessment review email (soft pitch) with delay
    const delayMinutes = EMAIL_DELAY_MS / 60000;
    console.log(`  ⏱️  Scheduling assessment review in ${delayMinutes} minute(s)...`);
    
    // Send email after delay (non-blocking)
    setTimeout(async () => {
      try {
        const template = await getAssessmentReviewTemplate(lead.name);
        
        if (template) {
          await sendEmail(
            email,
            template.subject,
            template.body
          );

          console.log(`  ✉️  Assessment review (soft pitch) sent to: ${email} (after ${delayMinutes} min delay)`);
          
          // Update stage to SOFT_PITCH_SENT after email sent
          await upsertLead({
            ...lead,
            stage: moveToStage.softPitchSent(),
            lastContact: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`  ❌ Failed to send delayed email to ${email}:`, err.message);
      }
    }, EMAIL_DELAY_MS);

    res.json({
      success: true,
      message: `Skill assessment completed! Follow-up email scheduled in ${delayMinutes} minute(s).`
    });

  } catch (error) {
    console.error('Error processing skill assessment completion:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
