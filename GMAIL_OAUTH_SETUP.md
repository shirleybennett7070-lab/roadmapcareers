# 🔐 Gmail OAuth Setup (Updated Approach)

## Why OAuth Instead of Service Account?

Since your Google Cloud project is in your **personal Gmail account**, but you want to use **shirley@roapmapcareers.com** (different workspace), we need OAuth instead of domain-wide delegation.

---

## 📋 Setup Steps

### Step 1: Create OAuth Credentials (5 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials?project=roadmap-careers
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **RoadmapCareers Email Bot**
   - User support email: Your personal Gmail
   - Developer contact: Your personal Gmail
   - Click **Save and Continue** through the scopes (no changes needed)
   - Add test user: **shirley@roapmapcareers.com**
   - Click **Save and Continue**
4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **RoadmapCareers Gmail Access**
   - Authorized redirect URIs: `http://localhost:3000/oauth/callback`
   - Click **Create**
5. **Copy the Client ID and Client Secret** (you'll need these!)

### Step 2: Enable Gmail API

1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=roadmap-careers
2. Click **"Enable"**

### Step 3: Add Credentials to .env

Open `/backend/.env` and add:

```bash
GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/oauth/callback
```

### Step 4: Initialize System

```bash
cd backend
npm run setup-email
```

### Step 5: Authorize Gmail Access

```bash
npm run auth-gmail
```

This will:
1. Give you a URL to open
2. Ask you to sign in with **shirley@roapmapcareers.com**
3. Grant Gmail permissions
4. Give you a code to paste back

### Step 6: Test It!

```bash
npm run process-emails
```

---

## 🎯 Complete Flow

```
1. Create OAuth credentials in Google Cloud Console
   ↓
2. Add credentials to .env file
   ↓
3. Run: npm run auth-gmail
   ↓
4. Sign in as shirley@roapmapcareers.com
   ↓
5. Authorize Gmail access
   ↓
6. Run: npm run process-emails
   ↓
7. ✅ Emails processed automatically!
```

---

## 🔧 Commands

```bash
npm run setup-email      # Initialize leads sheet (run once)
npm run auth-gmail       # Authorize Gmail (run once, or when token expires)
npm run process-emails   # Process inbox & send auto-replies
```

---

## 📊 What Happens After Authorization

- Token saved to `gmail-token.json` (automatically refreshes)
- System can read emails from shirley@roapmapcareers.com
- System can send emails as shirley@roapmapcareers.com
- No need to re-authorize unless token is revoked

---

## ⚠️ Important Notes

### OAuth Consent Screen
- App will be in "Testing" mode
- Only test users (shirley@roapmapcareers.com) can use it
- Perfect for your use case!

### Token Expiry
- Access tokens expire after 1 hour
- Refresh token automatically gets new access tokens
- Only need to re-authorize if refresh token is revoked

### Security
- `gmail-token.json` contains sensitive tokens
- Already added to `.gitignore` (won't be committed)
- Keep it secure!

---

## 🧪 Testing

After setup, send a test email to shirley@roapmapcareers.com:

**Subject:** Interested in Customer Service job

**Body:**
```
Hi, I saw your Customer Service posting (Job ID: adzuna_12345) 
and would love to learn more!
```

Then run:
```bash
npm run process-emails
```

You should see:
- ✅ Email read
- ✅ Job ID extracted
- ✅ Lead created in Google Sheets
- ✅ Auto-reply sent
- ✅ Email marked as read

---

## 🚀 Ready?

1. Create OAuth credentials (Step 1)
2. Copy Client ID and Secret
3. Add to `.env` file
4. Run `npm run auth-gmail`
5. Authorize as shirley@roapmapcareers.com
6. Test with `npm run process-emails`

**This approach works perfectly across different Google accounts!**
