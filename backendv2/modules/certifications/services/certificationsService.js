import { getSheetsClient, SHEET_ID, CERTIFICATIONS_SHEET_NAME } from '../config/sheets.js';
import crypto from 'crypto';

// Generate a unique token for secure access
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate certificate ID
export function generateCertificateId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RC-${timestamp}-${random}`;
}

// Save exam result to Google Sheet
export async function saveExamResult(examData) {
  try {
    const sheets = await getSheetsClient();
    const token = generateToken();
    const timestamp = new Date().toISOString();
    
    // Use provided certificate ID for passed exams, or generate one
    const certificateId = examData.passed 
      ? (examData.certificateId || generateCertificateId())
      : '';

    const row = [
      timestamp,
      examData.email,
      examData.fullName,
      examData.phone || '',
      examData.jobTitle || '',
      examData.jobCompany || '',
      examData.score,
      examData.totalQuestions,
      examData.passed ? 'TRUE' : 'FALSE',
      'pending', // payment status
      token,
      certificateId, // certificate ID (now generated immediately for passed exams)
      examData.jobPay || '',
      examData.jobLocation || '',
      examData.jobType || '',
      examData.jobOriginalUrl || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A:P`,
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    return {
      success: true,
      token,
      certificateId,
      message: 'Exam result saved successfully'
    };
  } catch (error) {
    console.error('Error saving exam result:', error);
    throw error;
  }
}

// Get exam result by token
export async function getExamResultByToken(token) {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A:P`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return null;
    }

    // Find the row with matching token (column K = index 10)
    const dataRows = rows.slice(1); // Skip header
    const resultRow = dataRows.find(row => row[10] === token);

    if (!resultRow) {
      return null;
    }

    return {
      timestamp: resultRow[0],
      email: resultRow[1],
      fullName: resultRow[2],
      phone: resultRow[3],
      jobTitle: resultRow[4],
      jobCompany: resultRow[5],
      score: parseInt(resultRow[6]),
      totalQuestions: parseInt(resultRow[7]),
      passed: resultRow[8] === 'TRUE',
      paymentStatus: resultRow[9],
      token: resultRow[10],
      certificateId: resultRow[11],
      jobPay: resultRow[12],
      jobLocation: resultRow[13],
      jobType: resultRow[14],
      jobOriginalUrl: resultRow[15] || ''
    };
  } catch (error) {
    console.error('Error fetching exam result:', error);
    throw error;
  }
}

// Update payment status and generate certificate ID
export async function updatePaymentStatus(token, paymentStatus = 'completed') {
  try {
    const sheets = await getSheetsClient();
    
    // First, find the row with this token
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A:O`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      throw new Error('Result not found');
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex(row => row[10] === token);

    if (rowIndex === -1) {
      throw new Error('Result not found');
    }

    const actualRowNumber = rowIndex + 2; // +1 for header, +1 for 0-index
    const certificateId = generateCertificateId();

    // Update payment status (column J) and certificate ID (column L)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!J${actualRowNumber}:L${actualRowNumber}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[paymentStatus, token, certificateId]],
      },
    });

    return {
      success: true,
      certificateId,
      message: 'Payment status updated successfully'
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Check if email has already passed (to prevent duplicates)
export async function hasEmailPassed(email) {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A:O`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return false;
    }

    const dataRows = rows.slice(1);
    const passedResult = dataRows.find(row => 
      row[1] === email && 
      row[8] === 'TRUE' && 
      row[9] === 'completed'
    );

    return !!passedResult;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}

// Verify certificate by certificate ID
export async function verifyCertificate(certificateId) {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A:O`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return null;
    }

    // Find the row with matching certificate ID (column L = index 11)
    const dataRows = rows.slice(1); // Skip header
    const resultRow = dataRows.find(row => row[11] === certificateId);

    if (!resultRow) {
      return null;
    }

    // Only return valid certificates that are paid and passed
    if (resultRow[8] !== 'TRUE' || resultRow[9] !== 'completed') {
      return null;
    }

    return {
      certificateId: resultRow[11],
      fullName: resultRow[2],
      email: resultRow[1],
      issuedDate: resultRow[0],
      certification: 'Remote Work Professional Certification',
      issuer: 'RoadmapCareers',
      score: parseInt(resultRow[6]),
      totalQuestions: parseInt(resultRow[7]),
      status: 'Active'
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
}
