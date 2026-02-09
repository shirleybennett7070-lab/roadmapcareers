import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backendv2 root (where .env file is)
// config/sheets.js is at backendv2/modules/jobs/config/
// .env is at backendv2/
dotenv.config({ path: join(__dirname, '../../../.env') });

let auth;

export async function getAuthClient() {
  if (auth) return auth;

  try {
    let credentials;
    
    // Try to load from environment variable first (for Railway/production)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    } else {
      // Fall back to credentials.json file (for local development)
      // config/sheets.js is at backendv2/modules/jobs/config/
      // credentials.json is at backendv2/
      const credPath = join(__dirname, '../../../credentials.json');
      credentials = JSON.parse(readFileSync(credPath, 'utf8'));
    }
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
  } catch (error) {
    console.error('Error loading credentials:', error.message);
    console.log('\nMake sure you have either:');
    console.log('1. GOOGLE_CREDENTIALS_JSON environment variable set, OR');
    console.log('2. credentials.json file in the backendv2/ folder');
    throw error;
  }
}

export async function getSheetsClient() {
  const authClient = await getAuthClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;
export const SHEET_NAME = process.env.SHEET_NAME || 'Jobs_Dev'; // V2: Use dev tab by default
