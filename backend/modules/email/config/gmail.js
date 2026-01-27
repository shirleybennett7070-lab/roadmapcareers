import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

let oauth2Client;

const TOKEN_PATH = join(__dirname, '../../../gmail-token.json');
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

/**
 * Get OAuth2 client for Gmail
 */
export async function getGmailClient() {
  if (oauth2Client) {
    return { auth: oauth2Client, gmail: google.gmail({ version: 'v1', auth: oauth2Client }) };
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth/callback';

  console.log('🔍 Gmail config check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasTokenBase64: !!process.env.GMAIL_TOKEN_BASE64,
    hasTokenJson: !!process.env.GMAIL_TOKEN_JSON,
    hasTokenFile: existsSync(TOKEN_PATH)
  });

  if (!clientId || !clientSecret) {
    throw new Error('GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env file');
  }

  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Check if we have a token from environment variable (Railway) or file (local)
  let token;
  if (process.env.GMAIL_TOKEN_BASE64) {
    // Railway: token from base64 environment variable
    try {
      const tokenJson = Buffer.from(process.env.GMAIL_TOKEN_BASE64, 'base64').toString('utf8');
      token = JSON.parse(tokenJson);
      console.log('✅ Gmail token loaded from base64 environment variable');
    } catch (error) {
      console.error('❌ Error parsing GMAIL_TOKEN_BASE64:', error.message);
      throw new Error('Invalid GMAIL_TOKEN_BASE64 environment variable');
    }
  } else if (process.env.GMAIL_TOKEN_JSON) {
    // Railway: token from JSON environment variable (fallback)
    try {
      token = JSON.parse(process.env.GMAIL_TOKEN_JSON);
      console.log('✅ Gmail token loaded from JSON environment variable');
    } catch (error) {
      console.error('❌ Error parsing GMAIL_TOKEN_JSON:', error.message);
      throw new Error('Invalid GMAIL_TOKEN_JSON environment variable');
    }
  } else if (existsSync(TOKEN_PATH)) {
    // Local: token from file
    token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
    console.log('✅ Gmail token loaded from file');
  } else {
    throw new Error('Not authenticated. Run "npm run auth-gmail" first to authorize Gmail access.');
  }

  if (!token || !token.refresh_token) {
    console.error('❌ Invalid token structure:', JSON.stringify(token).substring(0, 100));
    throw new Error('Invalid token: missing refresh_token');
  }

  oauth2Client.setCredentials(token);
  
  // Check if token is expired and refresh if needed
  if (token.expiry_date && token.expiry_date < Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      
      // Save refreshed token
      if (process.env.GMAIL_TOKEN_JSON) {
        // Railway: can't update env var, but refresh token is valid
        console.log('Token refreshed (Railway environment)');
      } else {
        // Local: save to file
        writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
      }
    } catch (error) {
      console.error('Error refreshing token:', error.message);
      throw new Error('Token expired. Run "npm run auth-gmail" to re-authenticate');
    }
  }
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  return { auth: oauth2Client, gmail };
}

/**
 * Generate auth URL for user to authorize
 */
export function getAuthUrl() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth/callback';

  if (!clientId || !clientSecret) {
    throw new Error('GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env file');
  }

  const oauth2ClientTemp = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  
  return oauth2ClientTemp.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth/callback';

  const oauth2ClientTemp = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  
  const { tokens } = await oauth2ClientTemp.getToken(code);
  
  // Save tokens
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  
  return tokens;
}

/**
 * Read unread emails from inbox
 */
export async function readUnreadEmails() {
  const { gmail } = await getGmailClient();
  
  try {
    // Get list of unread messages (increased for batch processing)
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread in:inbox',
      maxResults: 100
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      return [];
    }

    // Get full message details
    const emails = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        return parseEmail(msg.data);
      })
    );

    return emails;
  } catch (error) {
    console.error('Error reading emails:', error.message);
    throw error;
  }
}

/**
 * Parse email data
 */
function parseEmail(message) {
  const headers = message.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value || '';
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  
  // Extract email address
  const emailMatch = from.match(/<(.+)>/) || from.match(/([^\s]+@[^\s]+)/);
  const email = emailMatch ? emailMatch[1] : from;
  
  // Extract name
  const nameMatch = from.match(/^([^<]+)</);
  const name = nameMatch ? nameMatch[1].trim() : email.split('@')[0];
  
  // Get email body
  let body = '';
  if (message.payload.parts) {
    const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  } else if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    id: message.id,
    threadId: message.threadId,
    email,
    name,
    subject,
    body,
    date,
    snippet: message.snippet
  };
}

/**
 * Send email reply
 */
export async function sendEmail(to, subject, body, threadId = null) {
  const { gmail } = await getGmailClient();
  
  try {
    // Create HTML email with clickable links
    const htmlBody = body.replace(/\n/g, '<br>');
    
    const email = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      `Subject: ${subject}`,
      threadId ? `In-Reply-To: ${threadId}` : '',
      threadId ? `References: ${threadId}` : '',
      '',
      htmlBody
    ].join('\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId: threadId || undefined
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}

/**
 * Mark email as read
 */
export async function markAsRead(messageId) {
  const { gmail } = await getGmailClient();
  
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  } catch (error) {
    console.error('Error marking email as read:', error.message);
  }
}
