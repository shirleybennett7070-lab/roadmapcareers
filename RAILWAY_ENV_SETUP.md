# Railway Environment Variables Setup

Add these to Railway's **Shared Variables**:

## Required - Google Sheets
```
GOOGLE_SHEET_ID=1QP1KwgqKVCIt2t7FA45YvVXbAtVcwJ-ADifksUNC-FM

GOOGLE_CREDENTIALS_JSON=<paste the entire contents of backend/credentials.json as a single line>
```

**To get the credentials JSON:**
1. Open `backend/credentials.json` locally
2. Copy the entire file content (it should start with `{"type":"service_account"...`)
3. Paste it as a single line in Railway

## Required - Server
```
NODE_ENV=production
PORT=8080
```

## Required - Business Info
```
YOUR_CONTACT_EMAIL=shirley.bennett7070@gmail.com
YOUR_BUSINESS_NAME=RoadmapCareers
```

## Required - Stripe (Get from https://dashboard.stripe.com/apikeys)
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://your-frontend-url.com/certification/result
STRIPE_CANCEL_URL=https://your-frontend-url.com/certification
```

## Optional - Gmail (if using email automation)
```
GMAIL_CLIENT_ID=...apps.googleusercontent.com
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=https://your-backend-url/oauth/callback
```

## Optional - Job APIs
```
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
```

---

## IMPORTANT: Share Google Sheet with Service Account

You must share your Google Sheet with this email address:
**roadmapcareers-sheets@roadmapcareers-1769485146.iam.gserviceaccount.com**

Steps:
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1QP1KwgqKVCIt2t7FA45YvVXbAtVcwJ-ADifksUNC-FM/edit
2. Click "Share" button
3. Add: roadmapcareers-sheets@roadmapcareers-1769485146.iam.gserviceaccount.com
4. Give "Editor" permission
5. Click "Send"
