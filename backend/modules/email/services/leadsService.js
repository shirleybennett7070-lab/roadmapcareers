import { getSheetsClient } from '../../jobs/config/sheets.js';
import dotenv from 'dotenv';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const LEADS_SHEET_NAME = 'Leads';

export const LEAD_STAGES = {
  STAGE_1_JOBS_LIST_SENT: '1_JOBS_LIST_SENT',
  STAGE_1B_INTAKE_REQUESTED: '1B_INTAKE_REQUESTED',
  STAGE_2_INTAKE_COMPLETED: '2_INTAKE_COMPLETED',
  STAGE_3_ASSESSMENT_OFFERED: '3_ASSESSMENT_OFFERED',
  STAGE_4_SKILL_ASSESSMENT_COMPLETED: '4_SKILL_ASSESSMENT_COMPLETED',
  STAGE_5_SOFT_PITCH_SENT: '5_SOFT_PITCH_SENT',
  STAGE_6_TRAINING_OFFERED: '6_TRAINING_OFFERED',
  STAGE_7_PAID: '7_PAID',
  STAGE_8_FOLLOW_UP: '8_FOLLOW_UP',
  STAGE_9_DROPPED: '9_DROPPED'
};

// Stage progression map - defines what happens when lead replies at each stage
const STAGE_PROGRESSION = {
  [LEAD_STAGES.STAGE_1_JOBS_LIST_SENT]: LEAD_STAGES.STAGE_1B_INTAKE_REQUESTED, // Reply to jobs list → send intake form
  [LEAD_STAGES.STAGE_1B_INTAKE_REQUESTED]: LEAD_STAGES.STAGE_1B_INTAKE_REQUESTED, // Stays until intake form submitted
  [LEAD_STAGES.STAGE_2_INTAKE_COMPLETED]: LEAD_STAGES.STAGE_3_ASSESSMENT_OFFERED, // Intake done → send assessment offer
  [LEAD_STAGES.STAGE_3_ASSESSMENT_OFFERED]: LEAD_STAGES.STAGE_4_SKILL_ASSESSMENT_COMPLETED, // Reply → send skill assessment
  [LEAD_STAGES.STAGE_4_SKILL_ASSESSMENT_COMPLETED]: LEAD_STAGES.STAGE_5_SOFT_PITCH_SENT,
  [LEAD_STAGES.STAGE_5_SOFT_PITCH_SENT]: LEAD_STAGES.STAGE_6_TRAINING_OFFERED,
  [LEAD_STAGES.STAGE_6_TRAINING_OFFERED]: LEAD_STAGES.STAGE_6_TRAINING_OFFERED, // Stays until paid
  [LEAD_STAGES.STAGE_7_PAID]: LEAD_STAGES.STAGE_7_PAID, // Final stage
  [LEAD_STAGES.STAGE_8_FOLLOW_UP]: LEAD_STAGES.STAGE_1_JOBS_LIST_SENT, // Re-engage → back to jobs
  [LEAD_STAGES.STAGE_9_DROPPED]: LEAD_STAGES.STAGE_9_DROPPED
};

/**
 * Get the initial stage for new leads
 */
export function getInitialStage() {
  return LEAD_STAGES.STAGE_1_JOBS_LIST_SENT;
}

/**
 * Get the next stage based on current stage
 */
export function getNextStage(currentStage) {
  return STAGE_PROGRESSION[currentStage] || currentStage;
}

/**
 * Move lead to specific stage (for manual transitions)
 */
export const moveToStage = {
  jobsListSent: () => LEAD_STAGES.STAGE_1_JOBS_LIST_SENT,
  intakeRequested: () => LEAD_STAGES.STAGE_1B_INTAKE_REQUESTED,
  intakeCompleted: () => LEAD_STAGES.STAGE_2_INTAKE_COMPLETED,
  assessmentOffered: () => LEAD_STAGES.STAGE_3_ASSESSMENT_OFFERED,
  skillAssessmentCompleted: () => LEAD_STAGES.STAGE_4_SKILL_ASSESSMENT_COMPLETED,
  softPitchSent: () => LEAD_STAGES.STAGE_5_SOFT_PITCH_SENT,
  trainingOffered: () => LEAD_STAGES.STAGE_6_TRAINING_OFFERED,
  paid: () => LEAD_STAGES.STAGE_7_PAID,
  followUp: () => LEAD_STAGES.STAGE_8_FOLLOW_UP,
  dropped: () => LEAD_STAGES.STAGE_9_DROPPED
};

const HEADERS = [
  'Email',
  'Name',
  'Stage',
  'First Contact',
  'Last Contact',
  'Quiz Score',
  'Payment Status',
  'Notes',
  'Assessment Completed',
  'Skill Assessment Completed',
  'Pending Email Time',
  'Pending Email Type'
];

/**
 * Initialize Leads sheet
 */
export async function initializeLeadsSheet() {
  const sheets = await getSheetsClient();
  
  try {
    // Try to create the sheet tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: LEADS_SHEET_NAME
            }
          }
        }]
      }
    });
    console.log(`✓ Created ${LEADS_SHEET_NAME} sheet`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✓ ${LEADS_SHEET_NAME} sheet already exists`);
    } else {
      throw error;
    }
  }

  // Add headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${LEADS_SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: [HEADERS]
    }
  });

  console.log('✓ Leads sheet headers initialized');
}

/**
 * Get lead by email
 */
export async function getLead(email) {
  const sheets = await getSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${LEADS_SHEET_NAME}!A2:L`
    });

    const rows = response.data.values || [];
    const lead = rows.find(row => row[0]?.toLowerCase() === email.toLowerCase());
    
    if (!lead) return null;
    
    return {
      email: lead[0],
      name: lead[1],
      stage: lead[2],
      firstContact: lead[3],
      lastContact: lead[4],
      quizScore: lead[5],
      paymentStatus: lead[6],
      notes: lead[7],
      assessmentCompleted: lead[8] === 'true' || lead[8] === true,
      skillAssessmentCompleted: lead[9] === 'true' || lead[9] === true,
      pendingEmailTime: lead[10] || null,
      pendingEmailType: lead[11] || null
    };
  } catch (error) {
    console.error('Error getting lead:', error.message);
    return null;
  }
}

/**
 * Add or update lead
 */
export async function upsertLead(leadData) {
  const sheets = await getSheetsClient();
  const existingLead = await getLead(leadData.email);
  
  const now = new Date().toISOString();
  
  const row = [
    leadData.email,
    leadData.name || '',
    leadData.stage || getInitialStage(),
    existingLead?.firstContact || now,
    now, // lastContact
    leadData.quizScore || '',
    leadData.paymentStatus || 'Unpaid',
    leadData.notes || '',
    leadData.assessmentCompleted ? 'true' : (existingLead?.assessmentCompleted ? 'true' : 'false'),
    leadData.skillAssessmentCompleted ? 'true' : (existingLead?.skillAssessmentCompleted ? 'true' : 'false'),
    leadData.pendingEmailTime !== undefined ? (leadData.pendingEmailTime || '') : (existingLead?.pendingEmailTime || ''),
    leadData.pendingEmailType !== undefined ? (leadData.pendingEmailType || '') : (existingLead?.pendingEmailType || '')
  ];

  if (existingLead) {
    // Update existing lead
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${LEADS_SHEET_NAME}!A2:A`
    });
    
    const emails = response.data.values?.map(r => r[0]) || [];
    const rowIndex = emails.findIndex(e => e?.toLowerCase() === leadData.email.toLowerCase());
    
    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${LEADS_SHEET_NAME}!A${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });
    }
  } else {
    // Add new lead
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${LEADS_SHEET_NAME}!A2`,
      valueInputOption: 'RAW',
      resource: {
        values: [row]
      }
    });
  }
  
  return row;
}

/**
 * Get all leads
 */
export async function getAllLeads() {
  const sheets = await getSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${LEADS_SHEET_NAME}!A2:L`
    });

    const rows = response.data.values || [];
    
    return rows.map(row => ({
      email: row[0],
      name: row[1],
      stage: row[2],
      firstContact: row[3],
      lastContact: row[4],
      quizScore: row[5],
      paymentStatus: row[6],
      notes: row[7],
      assessmentCompleted: row[8] === 'true' || row[8] === true,
      skillAssessmentCompleted: row[9] === 'true' || row[9] === true,
      pendingEmailTime: row[10] || null,
      pendingEmailType: row[11] || null
    }));
  } catch (error) {
    console.error('Error getting leads:', error.message);
    return [];
  }
}

/**
 * Get leads with pending emails that are ready to send
 */
export async function getLeadsWithPendingEmails() {
  const allLeads = await getAllLeads();
  const now = new Date();
  
  return allLeads.filter(lead => {
    if (!lead.pendingEmailTime || !lead.pendingEmailType) return false;
    const scheduledTime = new Date(lead.pendingEmailTime);
    return scheduledTime <= now;
  });
}
