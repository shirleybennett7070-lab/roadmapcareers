import { readUnreadEmails, sendEmail, markAsRead } from '../config/gmail.js';
import { getLead, upsertLead, LEAD_STAGES, getInitialStage, getNextStage, moveToStage } from './leadsService.js';
import { getTemplateForStage } from './templates.js';

/**
 * Simplified email processor for Customer Service training funnel
 * No job ID needed - all leads get the same CS training offer
 */

// Throttle delay between sending emails (in ms) to avoid Gmail rate limits
const THROTTLE_DELAY_MS = 1500; // 1.5 seconds between each send

/**
 * Sleep helper for throttling
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process all unread emails with throttling for high volume
 */
export async function processInbox() {
  try {
    console.log('📧 Checking inbox for new emails...');
    
    const emails = await readUnreadEmails();
    
    if (emails.length === 0) {
      console.log('✓ No new emails');
      return { processed: 0, responded: 0 };
    }
    
    console.log(`Found ${emails.length} new email(s)`);
    if (emails.length > 10) {
      console.log(`⏱️  Throttling enabled - ${THROTTLE_DELAY_MS}ms delay between sends`);
    }
    
    let responded = 0;
    let failed = 0;
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      try {
        console.log(`\n[${i + 1}/${emails.length}] Processing...`);
        
        const result = await processEmail(email);
        if (result.responded) {
          responded++;
          
          // Throttle: wait before sending next email to avoid rate limits
          if (i < emails.length - 1) {
            await sleep(THROTTLE_DELAY_MS);
          }
        }
        
        // Mark as read after processing
        await markAsRead(email.id);
      } catch (error) {
        console.error(`Error processing email from ${email.email}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n✅ Batch complete: ${responded} sent, ${failed} failed, ${emails.length - responded - failed} skipped`);
    
    return {
      processed: emails.length,
      responded,
      failed
    };
  } catch (error) {
    console.error('Error processing inbox:', error.message);
    throw error;
  }
}

/**
 * Check if email is a job inquiry
 */
function isJobInquiry(emailBody, subject) {
  const text = `${subject} ${emailBody}`.toLowerCase();
  
  const inquiryKeywords = [
    'job',
    'position',
    'role',
    'opening',
    'hiring',
    'application',
    'apply',
    'interested',
    'opportunity',
    'career',
    'customer service',
    'remote',
    'work from home'
  ];
  
  let keywordCount = 0;
  for (const keyword of inquiryKeywords) {
    if (text.includes(keyword)) keywordCount++;
  }
  
  // If email contains 1+ job-related keywords, likely a job inquiry
  return keywordCount >= 1;
}

/**
 * Process a single email - simplified for CS training
 */
export async function processEmail(email) {
  console.log(`\n📨 Processing email from: ${email.email}`);
  
  // Check if job inquiry
  if (!isJobInquiry(email.body, email.subject)) {
    console.log('  ℹ️  Not a job inquiry, skipping');
    return { responded: false };
  }
  
  console.log('  ✓ Job inquiry detected');
  
  // Get or create lead
  let lead = await getLead(email.email);
  let isNewLead = !lead;
  let stage;
  
  // Validate existing lead stage
  if (lead && !Object.values(LEAD_STAGES).includes(lead.stage)) {
    console.log('  ⚠️  Invalid stage detected, resetting lead');
    isNewLead = true; // Treat as new
    lead = null;
  }
  
  if (isNewLead) {
    // New lead - send initial jobs list
    stage = getInitialStage();
    console.log('  ✓ New lead - sending jobs list');
  } else {
    console.log(`  ✓ Existing lead (Stage: ${lead.stage})`);
    
    // Stages that advance on reply:
    // - Stage 1 (jobs list) → Stage 2 (assessment offer)
    // - Stage 4 (soft pitch) → Stage 5 (training/certification offer)
    const advanceOnReplyStages = [
      LEAD_STAGES.STAGE_1_JOBS_LIST_SENT,
      LEAD_STAGES.STAGE_4_SOFT_PITCH_SENT
    ];
    
    if (advanceOnReplyStages.includes(lead.stage)) {
      stage = getNextStage(lead.stage);
      console.log(`  → Advancing to: ${stage}`);
    } else {
      // For Stage 2, 3 - don't auto-advance - website triggers next email
      console.log('  ℹ️  Reply received - no auto-advance (complete assessment on website)');
      
      // Mark email as read but don't send another email
      return { 
        email: email.email, 
        responded: false, 
        stage: lead.stage,
        note: 'Reply acknowledged - complete assessment on website to proceed'
      };
    }
  }
  
  // Get appropriate template
  const responseTemplate = await getTemplateForStage(stage, {
    name: email.name || lead?.name,
    quizScore: lead?.quizScore
  });
  
  if (!responseTemplate) {
    console.log('  ⚠️  No template for stage:', stage);
    return { responded: false, stage };
  }
  
  try {
    // Send auto-reply FIRST
    await sendEmail(
      email.email,
      responseTemplate.subject,
      responseTemplate.body,
      email.threadId
    );
    
    console.log(`  ✉️  Auto-reply sent: ${responseTemplate.subject}`);
    
    // ONLY update lead AFTER successful send
    await upsertLead({
      email: email.email,
      name: email.name || lead?.name || '',
      stage,
      quizScore: lead?.quizScore,
      paymentStatus: lead?.paymentStatus,
      notes: lead?.notes || `First contact: ${new Date().toISOString()}`
    });
    
    console.log(`  ✓ Lead updated to stage: ${stage}`);
    
    return { responded: true, stage };
  } catch (error) {
    console.error(`  ❌ Failed to send email:`, error.message);
    return { responded: false, stage: lead?.stage }; // Don't update stage if send failed
  }
}
