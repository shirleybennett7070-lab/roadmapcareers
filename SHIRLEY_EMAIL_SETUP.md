# 🚀 Gmail Setup for shirley@roapmapcareers.com

## ✅ Configuration Complete!

Your workspace email has been added to the system.

**Email configured:** `shirley@roapmapcareers.com`
**Service Account:** `sheets-automation@roadmap-careers.iam.gserviceaccount.com`
**Client ID:** `101864296023658977553`

---

## 📋 Setup Checklist

### ☐ Step 1: Enable Gmail API (2 minutes)

1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=roadmap-careers
2. Click **"Enable"**
3. Wait for confirmation

### ☐ Step 2: Set Up Domain-Wide Delegation (5 minutes)

This allows the service account to act as shirley@roapmapcareers.com

1. Go to **Google Workspace Admin Console**: https://admin.google.com
2. Navigate to: **Security** → **Access and data control** → **API controls** → **Domain-wide delegation**
3. Click **"Add new"**
4. Enter these details:
   - **Client ID:** `101864296023658977553`
   - **OAuth Scopes:** (paste all on one line)
     ```
     https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.modify
     ```
5. Click **"Authorize"**
6. ✅ Done!

**Note:** You must be logged in as a Workspace admin to do this.

### ☐ Step 3: Test the Setup (1 minute)

```bash
# Initialize leads sheet
npm run setup-email

# Check if Gmail connection works
npm run process-emails
```

If you see "Gmail API configured for: shirley@roapmapcareers.com" ✅ - you're good!

---

## 🧪 Testing Your Email Auto-Reply

Once setup is complete:

### Send a Test Email:

From any email, send to: `shirley@roapmapcareers.com`

**Subject:** Interested in Customer Service job

**Body:**
```
Hi, I saw your Customer Service Representative posting (Job ID: adzuna_12345) 
and would love to learn more!
```

### Run the Processor:

```bash
npm run process-emails
```

### Expected Result:

- ✅ Email is read from Shirley's inbox
- ✅ Job ID extracted: `adzuna_12345`
- ✅ Lead created in Google Sheets "Leads" tab
- ✅ Auto-reply sent from shirley@roapmapcareers.com
- ✅ Original email marked as read

### Check Google Sheets:

https://docs.google.com/spreadsheets/d/1Z1QLJRUJ7rkRBnsrX3NiowSKGLgh7Mm3APhp0CIZUJ8/edit

You should see:
- **Jobs** tab: Your job postings
- **Leads** tab: New lead with stage "JOB_ID_CONFIRMED"

---

## 🔄 Automating Email Processing

### Option 1: Cron Job (Recommended)

Process emails every hour automatically:

```bash
# Edit crontab
crontab -e

# Add this line (runs every hour)
0 * * * * cd /Users/diwakar/RoadmapCareers/backend && npm run process-emails
```

### Option 2: Manual Processing

Run whenever you want to check for new emails:

```bash
npm run process-emails
```

### Option 3: API Call

Set up a webhook or scheduled task to hit:

```bash
curl -X POST http://localhost:3000/api/email/process
```

---

## 📊 What Happens Next

```
Someone emails shirley@roapmapcareers.com
              ↓
System reads email every hour
              ↓
Detects job inquiry + extracts Job ID
              ↓
Creates lead in Google Sheets
              ↓
Sends auto-reply from shirley@roapmapcareers.com
              ↓
Moves lead through stages based on responses
              ↓
Eventually: Training offer ($97)
```

---

## 🎯 Quick Commands

```bash
npm run setup-email       # Initialize system (run once)
npm run process-emails    # Process inbox & auto-reply
npm run dev               # Start API server
```

---

## ❓ Troubleshooting

### "WORKSPACE_EMAIL not set"
✅ Fixed! Already added to .env

### "Gmail API not enabled"
→ Complete Step 1 above

### "unauthorized_client" or "delegation denied"
→ Complete Step 2 above (domain-wide delegation)
→ Wait 5-10 minutes after setting it up

### "No emails processed"
→ Make sure there are unread emails in shirley@roapmapcareers.com inbox
→ Check they're job-related (contain keywords like "job", "position", etc.)

---

**Ready to test? Complete Steps 1-2 above, then run `npm run process-emails`!**
