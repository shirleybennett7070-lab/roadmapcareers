import { getSheetsClient, SHEET_ID, SHEET_NAME } from '../config/sheets.js';

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function generateGenericPosition(title) {
  if (!title) return 'Remote Position';
  const titleLower = title.toLowerCase();
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
  for (const [keyword, position] of Object.entries(positionMap)) {
    if (titleLower.includes(keyword)) return position;
  }
  let cleanTitle = title
    .replace(/\s*[-–—]\s*.*/g, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s*\bat\b.*/gi, '')
    .replace(/\s*\bfor\b.*/gi, '')
    .trim();
  return cleanTitle || 'Remote Position';
}

// =====================================================
// COLUMN LAYOUT (must match Google Sheet exactly)
// =====================================================
// A: Job ID          | Step 1
// B: Title           | Step 1
// C: Position        | Step 1
// D: Company         | Step 1
// E: Company Email Domain | Step 2
// F: Domain Source   | Step 2 / Step 3
// G: Scraped Domain  | Step 4
// H: HR Email 1      | Step 5
// I: HR Email 2      | Step 5
// J: HR Email 3      | Step 5
// K: Email Confidence| Step 5
// L: Description     | Step 1
// M: Requirements    | Step 1
// N: Salary Range    | Step 1
// O: Location        | Step 1
// P: Original URL    | Step 1
// Q: Your Contact Email | Step 1
// R: Date Posted     | Step 1
// S: Date Scraped    | Step 1
// T: Status          | Step 1
// U: Source          | Step 1
// V: Category        | Step 1
// =====================================================

export const HEADERS = [
  'Job ID',              // A
  'Title',               // B
  'Position',            // C
  'Company',             // D
  'Company Email Domain',// E
  'Domain Source',       // F
  'Scraped Domain',      // G
  'HR Email 1',          // H
  'HR Email 2',          // I
  'HR Email 3',          // J
  'Email Confidence',    // K
  'Description',         // L
  'Requirements',        // M
  'Salary Range',        // N
  'Location',            // O
  'Original URL',        // P
  'Your Contact Email',  // Q
  'Date Posted',         // R
  'Date Scraped',        // S
  'Status',              // T
  'Source',              // U
  'Category'             // V
];

export async function initializeSheet() {
  const sheets = await getSheetsClient();
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] }
    });
    console.log(`✓ Created new sheet tab: ${SHEET_NAME}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✓ Sheet tab "${SHEET_NAME}" already exists`);
    } else {
      throw error;
    }
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    resource: { values: [HEADERS] }
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [{
        repeatCell: {
          range: { sheetId: await getSheetId(), startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 } } },
          fields: 'userEnteredFormat(textFormat,backgroundColor)'
        }
      }]
    }
  });
  console.log('✓ Headers initialized');
}

async function getSheetId() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = response.data.sheets.find(s => s.properties.title === SHEET_NAME);
  return sheet?.properties?.sheetId || 0;
}

/**
 * Step 1: Add fetched jobs
 * Writes: A-D (job info), L-V (details). Leaves E-K empty.
 */
export async function addJobs(jobs) {
  const sheets = await getSheetsClient();
  const existingIds = await getExistingJobIds();
  const newJobs = jobs.filter(job => !existingIds.has(job.jobId));

  if (newJobs.length === 0) {
    console.log('No new jobs to add (all duplicates)');
    return 0;
  }

  const rows = newJobs.map(job => [
    job.jobId,                                             // A
    truncateText(job.title, 500),                          // B
    truncateText(generateGenericPosition(job.title), 200), // C
    truncateText(job.company, 200),                        // D
    '',                                                    // E (empty)
    '',                                                    // F (empty)
    '',                                                    // G (empty)
    '',                                                    // H (empty)
    '',                                                    // I (empty)
    '',                                                    // J (empty)
    '',                                                    // K (empty)
    truncateText(job.description, 5000),                   // L
    truncateText(job.requirements || 'N/A', 2000),         // M
    truncateText(job.salaryRange || 'N/A', 200),           // N
    truncateText(job.location || 'Remote', 200),           // O
    job.originalUrl,                                       // P
    process.env.YOUR_CONTACT_EMAIL,                        // Q
    job.datePosted,                                        // R
    new Date().toISOString(),                              // S
    'active',                                              // T
    job.source,                                            // U
    truncateText(job.category || 'General', 100)           // V
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: 'RAW',
    resource: { values: rows }
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
    return new Set();
  }
}

export async function getAllJobs() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:V`
  });
  if (!response.data.values) return [];

  return response.data.values.map(row => ({
    jobId: row[0],              // A
    title: row[1],              // B
    position: row[2],           // C
    company: row[3],            // D
    companyEmailDomain: row[4], // E
    domainSource: row[5],       // F
    scrapedDomain: row[6],      // G
    hrEmail1: row[7],           // H
    hrEmail2: row[8],           // I
    hrEmail3: row[9],           // J
    emailConfidence: row[10],   // K
    description: row[11],       // L
    requirements: row[12],      // M
    salaryRange: row[13],       // N
    location: row[14],          // O
    originalUrl: row[15],       // P
    contactEmail: row[16],      // Q
    datePosted: row[17],        // R
    dateScraped: row[18],       // S
    status: row[19],            // T
    source: row[20],            // U
    category: row[21]           // V
  }));
}
