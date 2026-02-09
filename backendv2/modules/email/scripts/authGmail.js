import { getAuthUrl, exchangeCodeForTokens } from '../config/gmail.js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('🔐 Gmail OAuth Authentication\n');
  console.log('This will authorize the app to access shirley@roapmapcareers.com\n');
  
  try {
    // Generate auth URL
    const authUrl = getAuthUrl();
    
    console.log('1. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n2. Sign in with: shirley@roapmapcareers.com');
    console.log('3. Authorize the app');
    console.log('4. Copy the authorization code from the redirect URL\n');
    
    rl.question('Paste the authorization code here: ', async (code) => {
      try {
        const tokens = await exchangeCodeForTokens(code.trim());
        console.log('\n✅ Authentication successful!');
        console.log('Token saved to gmail-token.json');
        console.log('\nYou can now run: npm run process-emails');
      } catch (error) {
        console.error('\n❌ Error:', error.message);
      }
      rl.close();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
  }
}

main();
