import { processInbox } from '../services/emailProcessor.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('📧 Email Auto-Reply System\n');
  console.log('=' .repeat(50));
  
  try {
    const result = await processInbox();
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Processed ${result.processed} email(s)`);
    console.log(`📤 Sent ${result.responded} auto-reply(ies)`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
