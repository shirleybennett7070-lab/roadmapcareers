import express from 'express';
import { 
  saveExamResult, 
  getExamResultByToken, 
  updatePaymentStatus,
  hasEmailPassed,
  verifyCertificate
} from './services/certificationsService.js';
import { getSheetsClient, SHEET_ID, CERTIFICATIONS_SHEET_NAME } from './config/sheets.js';

const router = express.Router();

/**
 * POST /api/certifications/setup
 * Initialize the Certifications sheet with headers
 */
router.post('/setup', async (req, res) => {
  try {
    const sheets = await getSheetsClient();

    // Check if the "Certifications" tab exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const certTab = spreadsheet.data.sheets.find(
      sheet => sheet.properties.title === CERTIFICATIONS_SHEET_NAME
    );

    if (!certTab) {
      // Create the new tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: CERTIFICATIONS_SHEET_NAME,
              }
            }
          }]
        }
      });
    }

    // Create header row
    const headers = [
      'Timestamp', 'Email', 'Full Name', 'Phone', 'Job Title', 'Job Company',
      'Score', 'Total Questions', 'Passed', 'Payment Status', 'Token',
      'Certificate ID', 'Job Pay', 'Job Location', 'Job Type'
    ];

    // Check if sheet already has headers
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A1:O1`,
    });

    if (!existingData.data.values || existingData.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${CERTIFICATIONS_SHEET_NAME}!A1:O1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] },
      });
    }

    res.json({
      success: true,
      message: 'Certifications sheet initialized'
    });
  } catch (error) {
    console.error('Error setting up certifications sheet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save exam result
router.post('/exam-result', async (req, res) => {
  try {
    const examData = req.body;
    
    // Validate required fields
    if (!examData.email || !examData.fullName || examData.score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, fullName, score' 
      });
    }

    const result = await saveExamResult(examData);
    res.json(result);
  } catch (error) {
    console.error('Error saving exam result:', error);
    res.status(500).json({ error: 'Failed to save exam result' });
  }
});

// Get exam result by token
router.get('/exam-result/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await getExamResultByToken(token);
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({ error: 'Failed to fetch exam result' });
  }
});

// Update payment status
router.post('/payment/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { paymentStatus } = req.body;
    
    const result = await updatePaymentStatus(token, paymentStatus);
    res.json(result);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Check if email has already completed certification
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const hasPassed = await hasEmailPassed(email);
    res.json({ hasPassed });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

// Verify certificate by ID
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await verifyCertificate(certificateId);
    
    if (!certificate) {
      return res.status(404).json({ 
        valid: false,
        message: 'Certificate not found' 
      });
    }

    res.json({
      valid: true,
      message: 'Certificate is valid and authentic',
      certificate
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

export default router;
