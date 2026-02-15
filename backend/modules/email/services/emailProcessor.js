import { readUnreadEmails, sendEmail, markAsRead } from '../config/gmail.js';
import { getLead, upsertLead, LEAD_STAGES, getInitialStage, getNextStage, moveToStage, getLeadsWithPendingEmails } from './leadsService.js';
import { getTemplateForStage, getSkillAssessmentOfferTemplate, getAssessmentReviewTemplate, getAssessmentOfferTemplate, getRejectionTemplate } from './templates.js';

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
 * Group emails by sender address to avoid sending multiple responses
 * to the same person in a single batch
 */
function groupEmailsBySender(emails) {
  const grouped = new Map();
  
  for (const email of emails) {
    const senderEmail = email.email.toLowerCase();
    
    if (!grouped.has(senderEmail)) {
      grouped.set(senderEmail, []);
    }
    grouped.get(senderEmail).push(email);
  }
  
  return grouped;
}

/**
 * Process all unread emails with throttling for high volume
 * Deduplicates by sender - only sends one response per unique sender
 */
export async function processInbox() {
  try {
    console.log('📧 Checking inbox for new emails...');
    
    const emails = await readUnreadEmails();
    
    if (emails.length === 0) {
      console.log('✓ No new emails');
      return { processed: 0, responded: 0 };
    }
    
    // Group emails by sender to avoid duplicate responses
    const emailsBySender = groupEmailsBySender(emails);
    const uniqueSenders = emailsBySender.size;
    
    console.log(`Found ${emails.length} new email(s) from ${uniqueSenders} unique sender(s)`);
    
    if (uniqueSenders !== emails.length) {
      console.log(`📋 Deduplication: processing 1 email per sender (${emails.length - uniqueSenders} duplicate(s) will be marked read only)`);
    }
    
    if (uniqueSenders > 10) {
      console.log(`⏱️  Throttling enabled - ${THROTTLE_DELAY_MS}ms delay between sends`);
    }
    
    let responded = 0;
    let failed = 0;
    let senderIndex = 0;
    
    for (const [senderEmail, senderEmails] of emailsBySender) {
      senderIndex++;
      
      // Sort by date descending to process the most recent email first
      senderEmails.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const primaryEmail = senderEmails[0];
      const duplicateEmails = senderEmails.slice(1);
      
      try {
        console.log(`\n[${senderIndex}/${uniqueSenders}] Processing from: ${senderEmail}`);
        
        if (duplicateEmails.length > 0) {
          console.log(`  ℹ️  ${duplicateEmails.length} additional email(s) from same sender will be marked read`);
        }
        
        const result = await processEmail(primaryEmail);
        if (result.responded) {
          responded++;
          
          // Throttle: wait before sending next email to avoid rate limits
          if (senderIndex < uniqueSenders) {
            await sleep(THROTTLE_DELAY_MS);
          }
        }
        
        // Mark the primary email as read
        await markAsRead(primaryEmail.id);
        
        // Mark all duplicate emails from same sender as read (without processing)
        for (const dupEmail of duplicateEmails) {
          await markAsRead(dupEmail.id);
        }
      } catch (error) {
        console.error(`Error processing email from ${senderEmail}:`, error.message);
        failed++;
        
        // Still try to mark all emails from this sender as read
        for (const email of senderEmails) {
          try {
            await markAsRead(email.id);
          } catch (markError) {
            // Ignore errors when marking as read
          }
        }
      }
    }
    
    console.log(`\n✅ Batch complete: ${responded} sent, ${failed} failed, ${uniqueSenders - responded - failed} skipped`);
    console.log(`   (${emails.length} total emails processed, ${emails.length - uniqueSenders} duplicates auto-marked read)`);
    
    return {
      processed: emails.length,
      uniqueSenders,
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
    
    // Paid customers - ignore all emails (they've completed the funnel)
    if (lead.stage === LEAD_STAGES.STAGE_7_PAID || lead.paymentStatus === 'completed') {
      console.log('  ✓ Paid customer - ignoring (funnel completed)');
      return { 
        email: email.email, 
        responded: false, 
        stage: lead.stage,
        note: 'Paid customer - no auto-reply'
      };
    }
    
    // Dropped leads - ignore
    if (lead.stage === LEAD_STAGES.STAGE_9_DROPPED) {
      console.log('  ✓ Dropped lead - ignoring');
      return { 
        email: email.email, 
        responded: false, 
        stage: lead.stage,
        note: 'Dropped lead - no auto-reply'
      };
    }
    
    // Stages that advance on reply:
    // - Stage 1 (jobs list) → Stage 1B (intake request)
    // - Stage 5 (soft pitch) → Stage 6 (training/certification offer)
    const advanceOnReplyStages = [
      LEAD_STAGES.STAGE_1_JOBS_LIST_SENT,
      LEAD_STAGES.STAGE_5_SOFT_PITCH_SENT
    ];
    
    if (advanceOnReplyStages.includes(lead.stage)) {
      stage = getNextStage(lead.stage);
      console.log(`  → Advancing to: ${stage}`);
    } else {
      // For Stage 2, 3, 5 - don't auto-advance - website triggers next email
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

/**
 * Process scheduled/pending emails
 * Called by cron job to send emails that were scheduled for later
 */
export async function processPendingEmails() {
  try {
    const pendingLeads = await getLeadsWithPendingEmails();
    
    if (pendingLeads.length === 0) {
      return { sent: 0 };
    }
    
    console.log(`\n📬 Found ${pendingLeads.length} pending email(s) to send`);
    
    let sent = 0;
    
    for (const lead of pendingLeads) {
      try {
        console.log(`  → Sending ${lead.pendingEmailType} to ${lead.email}`);
        
        let template = null;
        let newStage = lead.stage;
        
        // Get the appropriate template based on pending email type
        if (lead.pendingEmailType === 'assessment_offer') {
          template = await getAssessmentOfferTemplate(lead.name);
          newStage = moveToStage.assessmentOffered();
        } else if (lead.pendingEmailType === 'skill_assessment_offer') {
          template = await getSkillAssessmentOfferTemplate(lead.name);
        } else if (lead.pendingEmailType === 'assessment_review') {
          template = await getAssessmentReviewTemplate(lead.name);
          newStage = moveToStage.softPitchSent(); // Update stage after sending soft pitch
        } else if (lead.pendingEmailType === 'rejection') {
          template = await getRejectionTemplate(lead.name);
          newStage = moveToStage.dropped(); // Move to dropped after rejection
        }
        
        if (template) {
          await sendEmail(lead.email, template.subject, template.body);
          console.log(`    ✉️  Sent: ${template.subject}`);
          
          // Clear the pending email and update stage if needed
          await upsertLead({
            ...lead,
            stage: newStage,
            pendingEmailTime: null,
            pendingEmailType: null
          });
          
          sent++;
          
          // Throttle between sends
          if (sent < pendingLeads.length) {
            await sleep(THROTTLE_DELAY_MS);
          }
        }
      } catch (error) {
        console.error(`    ❌ Failed to send to ${lead.email}:`, error.message);
      }
    }
    
    console.log(`  ✅ Sent ${sent}/${pendingLeads.length} pending email(s)`);
    return { sent };
  } catch (error) {
    console.error('Error processing pending emails:', error.message);
    return { sent: 0, error: error.message };
  }
}
