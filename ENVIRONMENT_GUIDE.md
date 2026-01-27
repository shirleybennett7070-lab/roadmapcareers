# Environment Configuration Guide

## 📁 Environment Files

This project uses different environment files for different deployment scenarios:

### Local Development Files
- **`.env`** - Default environment (used if no specific env file exists)
- **`.env.development`** - Development configuration (email processing every 1 minute)
- **`.env.production`** - Production configuration (email processing every 1 hour)

### Railway Environments
- **Development** - `roadmapcareers-development.up.railway.app`
- **Production** - `roadmapcareers-production.up.railway.app`

---

## 🔄 How to Use

### Running Locally

#### Development Mode (default)
```bash
cd backend
npm start
```
This will load `.env` or `.env.development` automatically.

#### Production Mode Locally
```bash
cd backend
NODE_ENV=production npm start
```
This will load `.env.production`.

#### Test Email Processing Locally
```bash
cd backend

# Development mode (uses .env or .env.development)
npm run process-emails

# Production mode (uses .env.production)
NODE_ENV=production npm run process-emails
```

---

## 📊 Environment Differences

| Configuration | Development | Production |
|---------------|-------------|------------|
| **Email Processing** | Every 1 minute | Every 1 hour |
| **Port** | 3000 | 8080 |
| **NODE_ENV** | development | production |
| **Stripe Keys** | Test keys (sk_test_*) | Live keys (sk_live_*) |
| **Stripe URLs** | localhost:5173 | railway.app production URL |
| **Gmail Redirect** | localhost:3000 | railway.app production URL |
| **Contact Email** | katherine@roadmapcareers.com | katherine@roadmapcareers.com |

---

## 🚀 Railway Deployment

The `server.js` automatically loads the correct environment:

```javascript
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

// Tries: .env.development or .env.production
// Falls back to: .env
```

### Deploy to Development
```bash
railway environment development
railway up
```

### Deploy to Production
```bash
railway environment production
railway up
```

---

## ⏰ Email Cron Schedule

The email service automatically adjusts based on `NODE_ENV`:

```javascript
// In server.js
const isProduction = process.env.NODE_ENV === 'production';
const cronSchedule = isProduction ? '0 * * * *' : '* * * * *';
```

- **Development:** `* * * * *` (every minute) - for testing
- **Production:** `0 * * * *` (every hour at minute 0) - for production use

---

## 🔐 Security Notes

⚠️ **IMPORTANT:** Environment files contain sensitive credentials

1. **Never commit these files to git** - They're already in `.gitignore`
2. **Keep Gmail tokens secure** - They grant full email access
3. **Use test Stripe keys for dev** - Avoid accidental real charges
4. **Rotate credentials periodically** - For security best practices

### What's Protected by .gitignore:
```
.env
.env.*
gmail-token.json
```

---

## 🔑 Setting Up New Environment

If you need to set up a new environment or regenerate tokens:

### 1. Gmail Authorization
```bash
cd backend
npm run auth-gmail
```
This creates `gmail-token.json` which is then base64 encoded into `GMAIL_TOKEN_BASE64`.

### 2. Update Environment File
The token will be automatically added to your active `.env` file.

### 3. Base64 Encode for Railway
```bash
cat gmail-token.json | base64
```
Copy the output and set as `GMAIL_TOKEN_BASE64` in Railway.

---

## 📧 Email Service Configuration

Both environments send emails from: **katherine@roadmapcareers.com**

### Gmail OAuth Credentials
- **Client ID:** `1059328956780-2sdofu9r8vhoi3vuokk6vij4pdpplf6m.apps.googleusercontent.com`
- **Client Secret:** `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`

### Redirect URIs
- Development: `http://localhost:3000/oauth/callback`
- Production: `https://roadmapcareers-production.up.railway.app/oauth/callback`

---

## 🧪 Testing

### Test Email Processing
```bash
# Development
npm run process-emails

# Production (locally)
NODE_ENV=production npm run process-emails

# Railway Development
curl -X POST "https://roadmapcareers-development.up.railway.app/api/email/process"

# Railway Production
curl -X POST "https://roadmapcareers-production.up.railway.app/api/email/process"
```

### Check Railway Logs
```bash
# Development logs
railway environment development
railway logs --follow

# Production logs
railway environment production
railway logs --follow
```

---

## 🔄 Environment Variables Priority

1. Railway environment variables (when deployed)
2. `.env.{NODE_ENV}` file (e.g., `.env.production`)
3. `.env` file (fallback)

---

## ✅ Quick Checklist

- [ ] `.env.development` exists and is configured
- [ ] `.env.production` exists and is configured
- [ ] Gmail OAuth credentials are set in both files
- [ ] Gmail token (base64) is set in both files
- [ ] Stripe test keys in development
- [ ] Stripe live keys in production (when ready)
- [ ] Environment files are in `.gitignore`
- [ ] Railway environment variables match the files

---

## 📝 Example: Switching Environments

```bash
# Run in development mode
cd backend
npm start
# Email processing: every 1 minute

# Run in production mode locally
NODE_ENV=production npm start
# Email processing: every 1 hour

# Deploy to Railway production
railway environment production
railway up
# Uses Railway's production environment variables
```

---

For more details, see:
- `EMAIL_SERVICE_STATUS.md` - Current email service status
- `GMAIL_SETUP_INSTRUCTIONS.md` - Gmail OAuth setup guide
- `RAILWAY_API_TEST_RESULTS.md` - API testing results
