import { getSheetsClient, SHEET_ID, CERTIFICATIONS_SHEET_NAME } from '../config/sheets.js';

async function setupCertificationsSheet() {
  try {
    console.log('Setting up Certifications sheet...');
    console.log('Sheet ID:', SHEET_ID);

    if (!SHEET_ID) {
      console.error('\n❌ Error: GOOGLE_SHEET_ID not found in environment variables');
      console.log('\nPlease add to your .env file:');
      console.log('GOOGLE_SHEET_ID=your_sheet_id_here');
      process.exit(1);
    }

    const sheets = await getSheetsClient();

    // First, check if the "Certifications" tab exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const certTab = spreadsheet.data.sheets.find(
      sheet => sheet.properties.title === CERTIFICATIONS_SHEET_NAME
    );

    if (!certTab) {
      console.log(`Creating "${CERTIFICATIONS_SHEET_NAME}" tab...`);
      
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
      
      console.log(`✅ Created "${CERTIFICATIONS_SHEET_NAME}" tab`);
    } else {
      console.log(`✅ "${CERTIFICATIONS_SHEET_NAME}" tab already exists`);
    }

    // Create header row
    const headers = [
      'Timestamp',
      'Email',
      'Full Name',
      'Phone',
      'Job Title',
      'Job Company',
      'Score',
      'Total Questions',
      'Passed',
      'Payment Status',
      'Token',
      'Certificate ID',
      'Job Pay',
      'Job Location',
      'Job Type'
    ];

    // Check if sheet already has headers
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CERTIFICATIONS_SHEET_NAME}!A1:O1`,
    });

    if (existingData.data.values && existingData.data.values.length > 0) {
      console.log('✅ Headers already exist in the sheet');
    } else {
      // Write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${CERTIFICATIONS_SHEET_NAME}!A1:O1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers],
        },
      });
      console.log('✅ Headers created successfully');
    }

    // Get the sheet ID for the Certifications tab to format it
    const updatedSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    const certSheet = updatedSpreadsheet.data.sheets.find(
      sheet => sheet.properties.title === CERTIFICATIONS_SHEET_NAME
    );
    
    const sheetId = certSheet.properties.sheetId;

    // Format the header row (bold, background color)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    console.log('✅ Sheet formatting applied');
    console.log('\n✨ Certifications sheet is ready to use!');
    console.log('\nSheet structure:');
    headers.forEach((header, index) => {
      console.log(`  ${String.fromCharCode(65 + index)}. ${header}`);
    });

  } catch (error) {
    console.error('❌ Error setting up sheet:', error.message);
    
    if (error.message.includes('Unable to parse range')) {
      console.log('\n💡 Tip: The script will automatically create the "Certifications" tab');
    } else if (error.message.includes('The caller does not have permission')) {
      console.log('\n💡 Tip: Make sure you shared the spreadsheet with your service account email');
    }
    
    process.exit(1);
  }
}

setupCertificationsSheet();
