import { google } from 'googleapis';
import { readFileSync } from 'fs';

// This script creates a new Google Sheet and shares it with the service account

async function createSheet() {
  try {
    // Load service account credentials
    const credentials = JSON.parse(readFileSync('./credentials.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'RoadmapCareers Database'
        },
        sheets: [
          { properties: { title: 'Jobs' } },
          { properties: { title: 'Certifications' } },
          { properties: { title: 'Leads' } }
        ]
      }
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    const spreadsheetUrl = createResponse.data.spreadsheetUrl;

    console.log('\n✅ Google Sheet created successfully!');
    console.log(`📊 Sheet URL: ${spreadsheetUrl}`);
    console.log(`🆔 Sheet ID: ${spreadsheetId}`);
    
    // Transfer ownership to workspace account
    console.log('\n⚠️  To transfer ownership to your workspace account:');
    console.log('1. Open the sheet in your browser');
    console.log('2. Click Share button');
    console.log('3. Add your workspace email (katherine@roadmapcareers.com)');
    console.log('4. Change their permission to "Editor" or "Owner"');
    console.log('5. Transfer ownership if needed');
    
    console.log(`\n📝 Update your .env file with:`);
    console.log(`GOOGLE_SHEET_ID=${spreadsheetId}`);

  } catch (error) {
    console.error('Error creating sheet:', error.message);
    
    if (error.message.includes('drive')) {
      console.log('\n⚠️  Service account cannot create sheets directly.');
      console.log('Please create the sheet manually and share it with the service account.');
      console.log('\nSteps:');
      console.log('1. Go to https://sheets.google.com');
      console.log('2. Create a new sheet named "RoadmapCareers Database"');
      console.log('3. Add tabs: Jobs, Certifications, Leads');
      console.log('4. Share with: roadmapcareers-sheets@roadmapcareers-1769485146.iam.gserviceaccount.com');
      console.log('5. Copy the sheet ID from the URL and add to .env');
    }
  }
}

createSheet();
