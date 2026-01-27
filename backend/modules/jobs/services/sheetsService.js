import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';

// Helper function to truncate text to avoid Google Sheets cell limits
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate a generic position name from a specific job title
 * Example: "House Sitter Wanted - Customer Service Representatives" -> "Customer Service Representative"
 */
function generateGenericPosition(title) {
  if (!title) return 'Remote Position';
  
  const titleLower = title.toLowerCase();
  
  // Common position mappings
  const positionMap = {
    'customer service': 'Customer Service Representative',
    'customer support': 'Customer Support Specialist',
    'sales': 'Sales Representative',
    'virtual assistant': 'Virtual Assistant',
    'admin': 'Administrative Assistant',
    'data entry': 'Data Entry Specialist',
    'social media': 'Social Media Coordinator',
    'content writer': 'Content Writer',
    'copywriter': 'Copywriter',
    'marketing': 'Marketing Coordinator',
    'account manager': 'Account Manager',
    'project coordinator': 'Project Coordinator',
    'recruiter': 'Recruiter',
    'bookkeeper': 'Bookkeeper',
    'transcription': 'Transcriptionist',
    'community manager': 'Community Manager',
    'moderator': 'Content Moderator',
    'research': 'Researcher',
    'scheduler': 'Scheduler',
    'receptionist': 'Receptionist'
  };
  
  // Find matching position type
  for (const [keyword, position] of Object.entries(positionMap)) {
    if (titleLower.includes(keyword)) {
      return position;
    }
  }
  
  // If no match, try to extract a clean title
  // Remove company names, locations, and extra qualifiers
  let cleanTitle = title
    .replace(/\s*[-–—]\s*.*/g, '') // Remove everything after dash
    .replace(/\s*\(.*?\)/g, '') // Remove parentheses
    .replace(/\s*\bat\b.*/gi, '') // Remove "at Company"
    .replace(/\s*\bfor\b.*/gi, '') // Remove "for Company"
    .trim();
  
  return cleanTitle || 'Remote Position';
}

export const HEADERS = [
  'Job ID',
  'Title',
  'Position',
  'Company',
  'Description',
  'Requirements',
  'Salary Range',
  'Location',
  'Original URL',
  'Your Contact Email',
  'Date Posted',
  'Date Scraped',
  'Status',
  'Source',
  'Category'
];

export async function initializeSheet() {
  const sheets = await getSheetsClient();
  
  try {
    // Try to create the sheet tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: SHEET_NAME
            }
          }
        }]
      }
    });
    console.log(`✓ Created new sheet tab: ${SHEET_NAME}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✓ Sheet tab "${SHEET_NAME}" already exists`);
    } else {
      throw error;
    }
  }

  // Add headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: [HEADERS]
    }
  });

  // Format headers (bold)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [{
        repeatCell: {
          range: {
            sheetId: await getSheetId(),
            startRowIndex: 0,
            endRowIndex: 1
          },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true },
              backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
            }
          },
          fields: 'userEnteredFormat(textFormat,backgroundColor)'
        }
      }]
    }
  });

  console.log('✓ Headers initialized');
}

async function getSheetId() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID
  });
  
  const sheet = response.data.sheets.find(s => s.properties.title === SHEET_NAME);
  return sheet?.properties?.sheetId || 0;
}

export async function addJobs(jobs) {
  const sheets = await getSheetsClient();
  
  // Get existing job IDs to avoid duplicates
  const existingIds = await getExistingJobIds();
  
  // Filter out duplicates
  const newJobs = jobs.filter(job => !existingIds.has(job.jobId));
  
  if (newJobs.length === 0) {
    console.log('No new jobs to add (all duplicates)');
    return 0;
  }

  const rows = newJobs.map(job => [
    job.jobId,
    truncateText(job.title, 500),
    truncateText(generateGenericPosition(job.title), 200),
    truncateText(job.company, 200),
    truncateText(job.description, 5000), // Limit description to 5000 chars
    truncateText(job.requirements || 'N/A', 2000),
    truncateText(job.salaryRange || 'N/A', 200),
    truncateText(job.location || 'Remote', 200),
    job.originalUrl,
    process.env.YOUR_CONTACT_EMAIL,
    job.datePosted,
    new Date().toISOString(),
    'active',
    job.source,
    truncateText(job.category || 'General', 100)
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: 'RAW',
    resource: {
      values: rows
    }
  });

  console.log(`✓ Added ${newJobs.length} new jobs to sheet`);
  return newJobs.length;
}

export async function getExistingJobIds() {
  const sheets = await getSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`
    });

    const ids = response.data.values?.map(row => row[0]) || [];
    return new Set(ids);
  } catch (error) {
    // Sheet is empty or doesn't exist yet
    return new Set();
  }
}

export async function getAllJobs() {
  const sheets = await getSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:O`
  });

  if (!response.data.values) {
    return [];
  }

  return response.data.values.map(row => ({
    jobId: row[0],
    title: row[1],
    position: row[2],
    company: row[3],
    description: row[4],
    requirements: row[5],
    salaryRange: row[6],
    location: row[7],
    originalUrl: row[8],
    contactEmail: row[9],
    datePosted: row[10],
    dateScraped: row[11],
    status: row[12],
    source: row[13],
    category: row[14]
  }));
}
