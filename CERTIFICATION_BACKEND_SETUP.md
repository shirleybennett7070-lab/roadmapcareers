# Certification Backend Setup Guide

## ✅ What I Created

Backend module for handling certification exam results, payments, and certificate generation.

## 🚀 Quick Setup

### Step 1: Add a New Tab to Your Existing Google Sheet

1. Open your existing Google Sheet (the one with GOOGLE_SHEET_ID)
2. Click the **+** button at the bottom to add a new tab
3. Name it **"Certifications"** (exactly as written)

That's it! You're already set up since you have:
- ✅ Existing Google Sheet with credentials
- ✅ Service account with access
- ✅ GOOGLE_SHEET_ID in your .env

### Step 2: Run Setup Script

```bash
cd backend
npm run setup-certifications
```

This will create the header row and format the new "Certifications" tab.

## 📊 What Gets Created

A new tab called "Certifications" with these columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | When exam was completed |
| B | Email | User's email |
| C | Full Name | User's full name |
| D | Phone | Phone (optional) |
| E | Job Title | Role interested in |
| F | Job Company | Company name |
| G | Score | Exam score (0-20) |
| H | Total Questions | Always 20 |
| I | Passed | TRUE/FALSE |
| J | Payment Status | pending/completed |
| K | Token | Unique 64-char token |
| L | Certificate ID | Generated after payment |
| M | Job Pay | Salary range |
| N | Job Location | Remote/location |
| O | Job Type | Full-time/etc |

## 🔌 API Endpoints Available

After setup, your backend will have:

```bash
POST /api/certifications/exam-result
GET  /api/certifications/exam-result/:token
POST /api/certifications/payment/:token
GET  /api/certifications/check-email/:email
```

## ✨ Next Steps

1. Run `npm run setup-certifications` to create the tab
2. Integrate frontend to save exam results
3. Create result page route
4. Add payment integration

See `backend/modules/certifications/README.md` for full API documentation.
