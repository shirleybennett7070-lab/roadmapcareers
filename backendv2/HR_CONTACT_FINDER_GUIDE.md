# HR Contact Finder - Complete Guide

## Overview
Uses Hunter.io to find HR/recruiting contacts at companies from your job postings.

## 🎯 End Goal
**Get direct email addresses of HR managers/recruiters** to:
1. Pitch your services (career coaching, training, etc.)
2. Build recruiter partnerships
3. Direct candidate placement
4. B2B sales

## 📋 Complete Workflow

### Step 1: Fetch Jobs
```bash
npm run fetch-jobs
```
**Result:** 1,000+ remote jobs

### Step 2: Enrich Domains
```bash
npm run enrich-domains
```
**Result:** Guess company domains from names (~70% accuracy)

### Step 3: Verify Domains
```bash
npm run verify-domains
```
**Result:** Verify guessed domains with Hunter.io (92% accuracy)
**Cost:** 1 API credit per company

### Step 4: Find HR Contacts ⭐ NEW
```bash
npm run find-hr-contacts
```
**Result:** Find HR/recruiter emails at verified companies
**Cost:** 1-2 API credits per domain

### Step 5: Verify Emails (Optional)
Uses Hunter.io Email Verifier to check deliverability
**Cost:** 1 API credit per email

---

## 🔑 Hunter.io Features We Use

### 1. Domain Search (Most Important)
**What it does:**
```
Input: acme.com

Output:
- jobs@acme.com (Generic HR)
- recruiting@acme.com (Generic)
- sarah.johnson@acme.com (Senior Recruiter)
- mike.chen@acme.com (HR Manager)
- talent@acme.com (Generic)
```

**How we use it:**
- Search each verified domain
- Filter for HR/recruiting keywords
- Save to `HR_Contacts` tab

**API Cost:** 1 credit per domain

---

### 2. Email Verifier
**What it does:**
```
Input: sarah.johnson@acme.com

Output:
- Status: valid
- Score: 95/100
- Result: deliverable
- SMTP check: passed
```

**How we use it:**
- Verify emails before sending
- Filter out bounced/invalid emails
- Prioritize high-confidence emails

**API Cost:** 1 credit per email

---

### 3. Email Finder (Future Enhancement)
**What it does:**
```
Input: 
- Domain: acme.com
- First name: Sarah
- Last name: Johnson

Output:
- Email: sarah.johnson@acme.com
- Confidence: 95%
```

**How we use it:**
- If you find HR manager names on LinkedIn
- Generate their email addresses
- Verify with Email Verifier

**API Cost:** 1 credit per search

---

### 4. Enrichment (Future Enhancement)
**What it does:**
```
Input: sarah.johnson@acme.com

Output:
- Full name: Sarah Johnson
- Position: Senior Recruiter
- Company: Acme Corp
- LinkedIn: linkedin.com/in/sarahjohnson
- Phone: +1-555-0123
- Location: New York, NY
```

**How we use it:**
- Get full context about HR contact
- Personalize outreach
- Build detailed CRM

**API Cost:** 1 credit per email

---

## 📊 Expected Results

### Your Current Situation:
- **Jobs:** 1,026
- **Verified domains:** 46
- **Guessed domains:** 976

### After Running find-hr-contacts:
**Free tier (50 requests/month):**
- Search ~25 domains (2 credits each: domain search + email verify)
- Find ~15-20 HR contacts (60-80% of domains have HR emails)

**Paid tier ($49/month = 1,000 requests):**
- Search all 46 verified domains
- Find ~30-35 HR contacts
- Plus verify all emails

---

## 💰 Cost Analysis

### Hunter.io Pricing:
- **Free:** 50 requests/month
- **Starter:** $49/month = 1,000 requests
- **Growth:** $99/month = 5,000 requests
- **Business:** $199/month = 20,000 requests

### What You Need:

**Current (1,026 jobs, 46 verified domains):**
- Domain searches: 46 requests
- Email verifications: ~50-100 requests
- **Total:** ~100-150 requests/month
- **Cost:** $49/month (Starter plan)

**Future (5,000+ jobs, 200+ verified domains):**
- Domain searches: 200 requests
- Email verifications: ~300-500 requests
- **Total:** ~500-700 requests/month
- **Cost:** $49/month (still Starter plan)

---

## 🎯 Use Cases

### Use Case 1: Career Coaching Sales
**Goal:** Sell career coaching services to companies

**Outreach:**
```
To: sarah.johnson@acme.com
Subject: Help Your Remote Team Find Top Talent

Hi Sarah,

I noticed Acme Corp is hiring for [Job Title]. 

We help companies like yours find qualified remote candidates 
through our career training program...
```

### Use Case 2: Recruiter Partnerships
**Goal:** Partner with recruiters to place candidates

**Outreach:**
```
To: recruiting@acme.com
Subject: Pre-Vetted Remote Candidates for [Job Title]

Hi Team,

I see you're hiring for [Job Title]. We have a pool of 
trained remote workers who...
```

### Use Case 3: B2B Lead Gen
**Goal:** Sell recruiting tools/services

**Value prop:**
- Assessment tools
- Training programs
- Candidate screening
- Remote work certification

---

## 📈 Scaling Strategy

### Month 1 (Free Tier - $0)
- Verify 50 domains
- Find 30-40 HR contacts
- Test outreach messaging
- Measure response rates

### Month 2-3 (Starter - $49/month)
- Verify 200+ domains  
- Find 150+ HR contacts
- Scale successful outreach
- Track conversions

### Month 4+ (Growth - $99/month)
- Process 1,000+ domains
- Find 700+ HR contacts
- Full-scale outreach campaigns
- Automated followups

---

## 🔥 Next Steps

1. ✅ Run `npm run find-hr-contacts` to find HR emails
2. ⏭️ Export HR_Contacts sheet
3. ⏭️ Craft outreach templates
4. ⏭️ Send initial emails (manual)
5. ⏭️ Build automation for followups

---

## 💡 Pro Tips

### 1. Prioritize Companies
Focus on:
- ✅ Verified domains (not guessed)
- ✅ Companies hiring for multiple positions
- ✅ Recent job postings (< 7 days)

### 2. Email Patterns
If you know: sarah.johnson@acme.com
You can guess: mike.chen@acme.com

Common patterns:
- first.last@domain.com
- first@domain.com
- flast@domain.com

### 3. Generic HR Emails Work
When personal emails unavailable:
- jobs@company.com
- careers@company.com
- recruiting@company.com
- hr@company.com

These get forwarded to the right person!

### 4. Verify Before Sending
Always verify emails to avoid:
- Bounces (damages sender reputation)
- Spam folders
- Wasted time

---

## 🚀 Advanced: Email Sequences

Hunter.io also supports **automated email campaigns**:

```javascript
// Create a lead
POST /leads

// Add to sequence
POST /sequences

// Track opens/clicks/replies
GET /sequences/:id/stats
```

**Future enhancement:** Build automated outreach system!

---

## 📊 Success Metrics

Track these to measure ROI:

1. **Emails found:** 30-40 per 50 requests
2. **Open rate:** 20-30% (industry average)
3. **Reply rate:** 3-5% (cold email average)
4. **Conversion rate:** 0.5-1% (meetings/sales)

**Example:**
- 100 HR contacts found
- 25 open your email
- 4 reply
- 1 converts to sale

**ROI:** If sale = $500, and Hunter.io = $49/month → 10x ROI!

---

## ⚠️ Important Notes

### Rate Limits:
- Free tier resets monthly (not daily)
- Save your 50 requests for verified domains only
- Don't waste on guessed domains

### Legal:
- Check CAN-SPAM compliance
- Add unsubscribe link
- Only B2B outreach (not consumers)

### Best Practices:
- Personalize each email
- Reference specific job posting
- Provide clear value proposition
- Keep it brief (< 100 words)

---

## 🎉 Summary

You're building a **complete lead generation system**:

1. ✅ Fetch 1,000+ jobs
2. ✅ Extract company domains
3. ✅ Verify domains with Hunter.io
4. ✅ Find HR contact emails
5. ⏭️ Send personalized outreach
6. ⏭️ Track responses
7. ⏭️ Close deals!

**This is the foundation for a scalable B2B sales engine!** 🚀
