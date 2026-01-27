# Email Auto-Reply System - Complete Guide

## 🎯 What It Does

Automatically reads your inbox, identifies job inquiries, tracks leads through your sales funnel, and sends personalized auto-replies based on their stage.

## 📊 Lead Stages

```
1. INQUIRY → Just emailed about a job
2. JOB_ID_REQUESTED → We asked them for job ID
3. JOB_ID_CONFIRMED → They provided job ID
4. QUIZ_SENT → Sent onboarding quiz link
5. QUIZ_COMPLETED → They finished the quiz
6. TRAINING_OFFERED → Sent training offer
7. PAID → Purchased training
8. DROPPED → Lost interest
```

## 🚀 Setup Instructions

### Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "RoadmapCareers" project
3. Go to "APIs & Services" → "Library"
4. Search for "Gmail API"
5. Click "Enable"

### Step 2: Add Gmail Permissions to Service Account

Your service account needs Gmail permissions. Two options:

#### Option A: Domain-Wide Delegation (For G Suite/Workspace)
- Go to your service account
- Enable "Domain-wide Delegation"
- Add scopes in workspace admin

#### Option B: OAuth (Easier for Personal Gmail)
Since service accounts can't directly access personal Gmail, you need to:
1. Create OAuth credentials
2. Authorize your app
3. Use refresh tokens

**For now, let's test with OAuth setup:**

```bash
# We'll need to add OAuth support
# Alternative: Use a dedicated email for your business
```

### Step 3: Initialize Leads Sheet

```bash
npm run setup-email
```

This creates a "Leads" sheet in your Google Sheets with columns for tracking.

### Step 4: Process Emails

```bash
npm run process-emails
```

This will:
- Read unread emails from your inbox
- Identify job inquiries
- Extract job IDs (if mentioned)
- Create/update leads in database
- Send appropriate auto-replies
- Mark emails as read

## 📧 How It Works

### Email Flow:

```
Unread Email Arrives
       ↓
Is it a job inquiry?
       ↓ Yes
Extract job ID (if present)
       ↓
Check if lead exists
       ↓
Determine stage
       ↓
Send appropriate auto-reply
       ↓
Update lead in database
       ↓
Mark email as read
```

### Job ID Detection:

The system looks for:
- Explicit mentions: "Job ID: xxx", "Ref: xxx", "Position ID: xxx"
- Fuzzy matching: Job title + company name in email
- Previous conversations: Checks lead history

### Auto-Reply Examples:

**Stage 1 - No Job ID:**
```
Thanks for reaching out! Could you provide the Job ID 
from the posting so I can help you prepare?
```

**Stage 2 - Job ID Confirmed:**
```
Great! I've pulled up the Customer Service Rep position 
at Amazon. Before you apply, complete this 5-minute 
assessment: [link]
```

**Stage 3 - Quiz Completed:**
```
Excellent! Based on your results, here's your custom 
training plan... Investment: $97
```

## 🔧 API Endpoints

### Process Inbox
```bash
POST /api/email/process
```

Response:
```json
{
  "success": true,
  "processed": 3,
  "responded": 2
}
```

### Get All Leads
```bash
GET /api/email/leads
```

Response:
```json
{
  "success": true,
  "count": 15,
  "leads": [
    {
      "email": "john@example.com",
      "name": "John Doe",
      "jobId": "adzuna_12345",
      "jobTitle": "Customer Service Rep",
      "stage": "JOB_ID_CONFIRMED",
      "firstContact": "2026-01-24T10:00:00Z",
      "lastContact": "2026-01-24T14:30:00Z"
    }
  ]
}
```

### Get Specific Lead
```bash
GET /api/email/leads/john@example.com
```

### Update Lead
```bash
PUT /api/email/leads/john@example.com
Content-Type: application/json

{
  "stage": "QUIZ_COMPLETED",
  "quizScore": "85",
  "notes": "Strong candidate"
}
```

## 💡 Usage Examples

### Manual Processing (CLI)
```bash
# Process inbox once
npm run process-emails

# Set up a cron job to run every hour
0 * * * * cd /path/to/backend && npm run process-emails
```

### Via API (for automation)
```bash
# Process inbox via API
curl -X POST http://localhost:3000/api/email/process

# Get leads
curl http://localhost:3000/api/email/leads

# Update a lead
curl -X PUT http://localhost:3000/api/email/leads/john@example.com \
  -H "Content-Type: application/json" \
  -d '{"stage": "PAID", "paymentStatus": "Paid"}'
```

## 📊 Viewing Your Leads

All leads are stored in Google Sheets:
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit

Sheet "Leads" has columns:
- Email
- Name  
- Job ID
- Job Title
- Stage
- First Contact
- Last Contact
- Quiz Score
- Payment Status
- Notes

You can manually edit, filter, and manage leads there!

## 🔐 Important Notes

### Gmail API Limitations

**Service Accounts can't access personal Gmail directly.** You have two options:

1. **Use OAuth (Recommended for personal Gmail)**
   - Requires user consent
   - More setup but works with personal accounts

2. **Use G Suite/Workspace with Domain-Wide Delegation**
   - Service account can act as users
   - Requires admin access

3. **Use a dedicated business Gmail**
   - Create a new Gmail for your business
   - Easier to manage permissions

### For Testing

For now, you can use the API endpoints to manually:
- Add leads: `POST /api/email/leads`
- Process leads: Update stages manually
- Test templates: See `/modules/email/services/templates.js`

We'll set up proper Gmail integration once you choose your email approach!

## 🎯 Next Steps

1. **Choose email approach** (OAuth vs business Gmail)
2. **Set up Gmail API permissions**
3. **Test with a few emails**
4. **Set up automated processing** (cron job)
5. **Build quiz/assessment** (for lead qualification)
6. **Add payment integration** (Stripe for training purchase)

## 🔍 Troubleshooting

### "Gmail API not enabled"
- Enable Gmail API in Google Cloud Console
- Wait 5 minutes for changes to propagate

### "Permission denied"
- Check service account has Gmail scopes
- For personal Gmail, use OAuth instead

### "No emails processed"
- Check inbox has unread emails
- Verify credentials.json is correct
- Test with `npm run test-connection`

## 📝 Customization

### Edit Email Templates
File: `/backend/modules/email/services/templates.js`

### Change Lead Stages
File: `/backend/modules/email/services/leadsService.js`

### Adjust Job ID Detection
File: `/backend/modules/email/services/emailParser.js`

---

**System is ready! Just need to set up Gmail API access.**
