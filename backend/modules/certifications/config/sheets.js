import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

let auth;

export async function getAuthClient() {
  if (auth) return auth;

  try {
    const credPath = join(__dirname, '../../../credentials.json');
    const credentials = JSON.parse(readFileSync(credPath, 'utf8'));
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
  } catch (error) {
    console.error('Error loading credentials.json:', error.message);
    throw error;
  }
}

export async function getSheetsClient() {
  const authClient = await getAuthClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Use the same sheet ID as jobs module
export const SHEET_ID = process.env.GOOGLE_SHEET_ID;
export const CERTIFICATIONS_SHEET_NAME = 'Certifications';
