# RoadmapCareers Backend

Node.js backend for job lead generation, email automation, and user onboarding.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google Sheets API

#### Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "Remote Jobs Database"
3. Copy the Sheet ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

#### Create Google Cloud Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Sheets API" (APIs & Services > Library)
4. Create Service Account (Credentials > Create Credentials > Service Account)
5. Download JSON key and save as `credentials.json` in the `backend/` folder
6. Share your Google Sheet with the service account email (from credentials.json)

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
- Add your `GOOGLE_SHEET_ID`
- Add your `YOUR_CONTACT_EMAIL`

### 4. Initialize & Run
```bash
npm run setup-sheets     # Create sheet headers
npm run fetch-jobs       # Populate with jobs
npm run dev              # Start API server
```

## 📦 Commands

- `npm run dev` - Start Express API server
- `npm run fetch-jobs` - Fetch jobs from APIs
- `npm run setup-sheets` - Initialize Google Sheet
- `npm run test-connection` - Test Google Sheets connection

## 🏗️ Module Structure

```
modules/
├── jobs/           # Job fetching & storage
│   ├── config/     # Google Sheets config
│   ├── services/   # Business logic
│   └── scripts/    # CLI scripts
├── email/          # Email automation (next)
└── quiz/           # User onboarding (planned)
```

## 🔧 Job APIs

**Free (No API key required):**
- RemoteOK
- Remotive

**Optional (Freemium):**
- Adzuna (1,000 calls/month free)
  - Sign up at [developer.adzuna.com](https://developer.adzuna.com/)
  - Add keys to `.env`

## 📝 Environment Variables

See `.env.example` for all options.

## 🗺️ Next Steps

- [ ] Build email auto-reply system
- [ ] Create frontend UI
- [ ] Add quiz/onboarding module
