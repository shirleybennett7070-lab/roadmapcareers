# 🚀 Gmail Email Service Setup - Quick Guide

## Step 1: Create OAuth Credentials (OPEN IN BROWSER NOW)

✅ **Gmail API is already enabled!**

### Create OAuth Client ID:

1. **The browser should have opened to:**
   https://console.cloud.google.com/apis/credentials/oauthclient?project=roadmapcareers-1769485146

2. **If you need to configure OAuth consent screen first:**
   - Click "CONFIGURE CONSENT SCREEN"
   - User Type: **External**
   - App name: **RoadmapCareers Email Bot**
   - User support email: (your email)
   - Developer contact: (your email)
   - Click **Save and Continue** (skip scopes)
   - Add test user: **katherine@roadmapcareers.com**
   - Click **Save and Continue**

3. **Create OAuth Client:**
   - Application type: **Web application**
   - Name: **RoadmapCareers Gmail Access**
   - Authorized redirect URIs (add all 3):
     ```
     http://localhost:3000/oauth/callback
     https://roadmapcareers-development.up.railway.app/oauth/callback
     https://roadmapcareers-production.up.railway.app/oauth/callback
     ```
   - Click **CREATE**

4. **Copy the credentials:**
   - Client ID (ends with `.apps.googleusercontent.com`)
   - Client Secret

---

## Step 2: Run the Setup Script

Once you have the Client ID and Secret, run:

```bash
cd /Users/alisonzhao/RoadmapCareers/backend
./scripts/setup-gmail-oauth.sh
```

This will:
- ✅ Add credentials to Railway (dev & prod)
- ✅ Update your local .env file
- ✅ Prepare everything for email authorization

---

## Step 3: Authorize Gmail

```bash
cd /Users/alisonzhao/RoadmapCareers/backend
npm run auth-gmail
```

Follow the prompts and sign in as **katherine@roadmapcareers.com**

---

## Step 4: Test Email Service

### Test locally:
```bash
npm run process-emails
```

### Test on Railway:
```bash
# Development
curl -X POST "https://roadmapcareers-development.up.railway.app/api/email/process"

# Production  
curl -X POST "https://roadmapcareers-production.up.railway.app/api/email/process"
```

---

## 📊 Email Processing Schedule

- **Development:** Every 1 minute ⏰
- **Production:** Every 1 hour ⏰
- **Sending from:** katherine@roadmapcareers.com

---

## ✅ Quick Checklist

- [ ] Gmail API enabled (DONE ✅)
- [ ] OAuth credentials created
- [ ] Credentials added to Railway
- [ ] Gmail authorized locally
- [ ] Test email processing works

---

**Need help?** Check `/backend/scripts/setup-gmail-oauth.sh` for the automated setup.
