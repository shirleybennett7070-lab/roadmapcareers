# Gmail API Setup for Workspace Email

## ✅ Updated System

The system is now configured to use **your workspace email** with service account domain-wide delegation.

## 🔧 Setup Steps

### Step 1: Add Your Workspace Email

Add this to your `.env` file:

```bash
WORKSPACE_EMAIL=your-actual-email@yourdomain.com
```

### Step 2: Enable Gmail API

1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Select your **roadmap-careers** project
3. Click **"Enable"**

### Step 3: Set Up Domain-Wide Delegation

This allows your service account to act as your workspace email.

#### Get Your Client ID:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('./credentials.json')).client_id)"
```

Copy the output (it's a long number like `123456789012345678901`)

#### Configure in Workspace Admin Console:

1. Go to: https://admin.google.com
2. Navigate to: **Security** → **API Controls** → **Domain-wide delegation**
3. Click **"Add new"**
4. Paste your Client ID
5. Add these OAuth scopes (all on one line, comma-separated):
   ```
   https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.modify
   ```
6. Click **"Authorize"**

### Step 4: Test the Setup

```bash
# Add your workspace email to .env first!
echo "WORKSPACE_EMAIL=you@yourdomain.com" >> .env

# Initialize leads sheet
npm run setup-email

# Process emails
npm run process-emails
```

## 🎯 How It Works

Your service account (`sheets-automation@roadmap-careers.iam.gserviceaccount.com`) will:
- Read emails from your workspace inbox
- Send replies as your workspace email
- Mark emails as read in your workspace account

Everything happens through your workspace email - leads see responses from you, not the service account!

## ⚠️ Important Notes

- You must be a **Google Workspace admin** to set up domain-wide delegation
- If you're not admin, ask your IT admin to do Step 3
- The workspace email must be in the same organization as the service account

## 🔍 Troubleshooting

### "WORKSPACE_EMAIL not set"
- Add `WORKSPACE_EMAIL=your@domain.com` to `.env`

### "Delegation denied" or "unauthorized_client"
- Make sure domain-wide delegation is set up correctly
- Wait 5-10 minutes after setting it up
- Verify the Client ID matches your service account

### "Gmail API not enabled"
- Enable it in Google Cloud Console
- Wait a few minutes for changes to propagate

---

**What's your workspace email? I'll help you add it to the config.**
