# Email Service Setup Status

**Date:** January 27, 2026  
**Email:** katherine@roadmapcareers.com

---

## ✅ Completed

### 1. Gmail API
- ✅ **Gmail API enabled** in GCP project `roadmapcareers-1769485146`
- ✅ Verified with `gcloud services list`

### 2. Railway Environment Variables
- ✅ `YOUR_CONTACT_EMAIL=katherine@roadmapcareers.com` (dev & prod)
- ✅ `YOUR_BUSINESS_NAME=RoadmapCareers` (dev & prod)
- ✅ `NODE_ENV=development` (dev)
- ✅ `NODE_ENV=production` (prod)

### 3. Email Cron Configuration
- ✅ Development: Process emails every 1 minute (`* * * * *`)
- ✅ Production: Process emails every 1 hour (`0 * * * *`)
- ✅ Configured in `backend/server.js`

### 4. Setup Scripts
- ✅ Created `/backend/scripts/setup-gmail-oauth.sh` (automated setup)
- ✅ Created `GMAIL_SETUP_INSTRUCTIONS.md` (quick guide)

---

## ⏳ Pending (Manual Steps Required)

### 1. Create OAuth Credentials
**Browser opened to:** https://console.cloud.google.com/apis/credentials/oauthclient?project=roadmapcareers-1769485146

**Steps:**
1. Configure OAuth consent screen (if needed)
2. Create Web application OAuth client
3. Add redirect URIs:
   - `http://localhost:3000/oauth/callback`
   - `https://roadmapcareers-development.up.railway.app/oauth/callback`
   - `https://roadmapcareers-production.up.railway.app/oauth/callback`
4. Copy Client ID and Secret

### 2. Run Setup Script
```bash
cd /Users/alisonzhao/RoadmapCareers/backend
./scripts/setup-gmail-oauth.sh
```

### 3. Authorize Gmail
```bash
cd /Users/alisonzhao/RoadmapCareers/backend
npm run auth-gmail
```
(Sign in as katherine@roadmapcareers.com)

### 4. Test Email Service
```bash
# Local test
npm run process-emails

# Railway test (dev)
curl -X POST "https://roadmapcareers-development.up.railway.app/api/email/process"

# Railway test (prod)
curl -X POST "https://roadmapcareers-production.up.railway.app/api/email/process"
```

---

## 📋 Railway Environment URLs

- **Development:** https://roadmapcareers-development.up.railway.app
- **Production:** https://roadmapcareers-production.up.railway.app

---

## 🔍 How to Verify Email Service is Working

### Check Logs
```bash
# Development
railway environment development && railway logs --follow

# Production  
railway environment production && railway logs --follow
```

### Look for:
```
⏰ Email cron job scheduled: every minute (* * * * *)
[2026-01-27T...] 🔄 Cron: Processing emails...
[2026-01-27T...] ✅ Cron complete: 2 processed, 2 responded
```

---

## 📧 Email Service Features

### Auto-Reply System
- Automatically reads inbox
- Identifies job inquiries
- Extracts job IDs
- Tracks leads in Google Sheets
- Sends personalized auto-replies

### Lead Stages
1. INQUIRY → Initial contact
2. JOB_ID_REQUESTED → Asking for job details
3. JOB_ID_CONFIRMED → Job identified
4. QUIZ_SENT → Assessment sent
5. QUIZ_COMPLETED → Assessment done
6. TRAINING_OFFERED → Certification offered
7. PAID → Purchase complete
8. DROPPED → No longer interested

### Templates
All emails sent from katherine@roadmapcareers.com with templates in:
`/backend/modules/email/services/templates.js`

---

## ⚡ Quick Commands

```bash
# Setup OAuth (after creating credentials)
./backend/scripts/setup-gmail-oauth.sh

# Authorize Gmail
cd backend && npm run auth-gmail

# Test locally
cd backend && npm run process-emails

# Initialize leads sheet
cd backend && npm run setup-email

# Check Railway logs
railway logs --follow

# Test endpoints
curl -X POST "https://roadmapcareers-development.up.railway.app/api/email/process"
curl -X GET "https://roadmapcareers-development.up.railway.app/api/email/leads"
```

---

## 🎯 Next Action

**Complete OAuth setup:**
1. Create OAuth credentials in the opened browser tab
2. Run `./backend/scripts/setup-gmail-oauth.sh`
3. Run `npm run auth-gmail`
4. Test with `npm run process-emails`

**Then the email service will be fully operational!** 🚀
