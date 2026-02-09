# Backend V2 - Changes for Pivot Strategy

## Overview
Backend V2 is designed to fetch **significantly more jobs** across **all experience levels** (not just entry-level) while maintaining focus on **remote positions**.

## Key Changes from V1

### 1. ✅ Removed Entry-Level Filters
**V1:** Only fetched non-technical entry-level jobs
**V2:** Fetches ALL remote jobs regardless of experience level or field

- Removed `isNonTechnicalEntryLevel()` filter
- Replaced with `isRemoteJob()` filter
- Now includes: senior roles, technical jobs, management positions, etc.

### 2. 📧 Company Email Domain Extraction
**New Feature:** Automatically extracts company email domains from job descriptions

- Parses job descriptions for email addresses
- Filters out generic providers (gmail, yahoo, etc.)
- Stores company domain in new `companyEmailDomain` field
- **Use case:** Direct outreach to hiring managers

Example:
```javascript
// Job description contains: "Apply to jobs@acmecorp.com"
// Extracted domain: "acmecorp.com"
```

### 3. 🚀 More API Sources
**V1:** 3 sources (RemoteOK, Remotive, Adzuna)
**V2:** 7+ sources including:
- ✅ RemoteOK (free)
- ✅ Remotive (free)
- ✅ Adzuna (free - 1,000/month)
- ✅ Jooble (free - 500/day)
- ✅ WellFound/AngelList (free - startup jobs)
- ✅ WeWorkRemotely (free - curated)
- ✅ Remote.co (free)

### 4. 📊 Higher Volume
**V1:** ~20 jobs per source = ~60 jobs/fetch
**V2:** ~50 jobs per source = ~350+ jobs/fetch

Expected results:
- **Daily fetches:** 300-400 new jobs/day
- **Weekly:** 2,000-3,000 jobs/week
- **Monthly:** 8,000-12,000 jobs/month

### 5. 🔧 Updated Configuration

#### New Port (avoid conflicts with V1)
```env
PORT=3001  # V2 (V1 uses 3000)
```

#### New Frontend URL
```env
FRONTEND_URL=http://localhost:5174  # V2 (V1 uses 5173)
```

#### New API Keys Required
```env
# Recommended for best results
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
JOOBLE_API_KEY=your_jooble_key

# Optional (premium)
JSEARCH_API_KEY=your_jsearch_key  # $30/month for even more volume
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backendv2
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Get API Keys (Free)

#### Adzuna (Recommended)
1. Visit: https://developer.adzuna.com
2. Sign up for free account
3. Get App ID and App Key
4. Free tier: 1,000 calls/month

#### Jooble (Recommended)
1. Visit: https://jooble.org/api/about
2. Request API key (instant approval)
3. Free tier: 500 requests/day

### 4. Run Job Fetch
```bash
# Fetch jobs from all sources
npm run fetch-jobs

# Expected output:
# V2: Total remote jobs fetched: 350+
# - RemoteOK: 50
# - Remotive: 50
# - Adzuna: 50
# - Jooble: 100
# - WellFound: 40
# - WeWorkRemotely: 30
# - Remote.co: 30
# 📧 Jobs with company email domain: 120 (34%)
```

### 5. Start Server
```bash
npm start
# Server runs on port 3001 (V1 uses 3000)
```

## API Changes

### New Field: `companyEmailDomain`
All job objects now include:
```javascript
{
  jobId: "remotive_12345",
  title: "Product Manager",
  company: "Acme Corp",
  companyEmailDomain: "acmecorp.com",  // NEW in V2
  description: "...",
  // ... other fields
}
```

### Updated Google Sheets Columns
New column added: **Company Email Domain** (column E)

| A | B | C | D | E | F | ... |
|---|---|---|---|---|---|-----|
| Job ID | Title | Position | Company | **Company Email Domain** | Description | ... |

## Comparison: V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| Target Jobs | Entry-level non-technical | All remote jobs |
| API Sources | 3 | 7+ |
| Jobs per Fetch | ~60 | ~350+ |
| Volume per Month | ~2,000 | ~10,000+ |
| Email Extraction | ❌ | ✅ |
| Technical Jobs | ❌ | ✅ |
| Senior Jobs | ❌ | ✅ |
| Startup Jobs | ❌ | ✅ |
| Port | 3000 | 3001 |
| Frontend Port | 5173 | 5174 |

## Use Cases for V2

### 1. Job Board / Marketplace
With 10K+ jobs/month, you can build a comprehensive remote job board

### 2. Recruiter Tool
Email domains allow direct outreach to hiring companies

### 3. Job Alerts / Matching
Higher volume = better matching for diverse candidates

### 4. Data Analytics
Large dataset for analyzing remote work trends

### 5. Lead Generation
More jobs = more companies to potentially sell services to

## Running V1 and V2 Together

Both can run simultaneously:

```bash
# Terminal 1 - V1 Backend
cd backend
npm start  # Runs on port 3000

# Terminal 2 - V2 Backend
cd backendv2
npm start  # Runs on port 3001

# Terminal 3 - V1 Frontend
cd frontend
npm run dev  # Runs on port 5173

# Terminal 4 - V2 Frontend
cd frontendv2
npm run dev  # Runs on port 5174
```

## Performance Tips

### 1. Rate Limiting
Some APIs have rate limits. V2 respects them:
- Jooble: 500 requests/day (V2 uses ~15/fetch)
- Adzuna: 1,000 requests/month (V2 uses ~1/fetch)

### 2. Caching
Consider caching results to avoid redundant API calls:
```javascript
// Fetch once per day instead of on every request
const jobs = await fetchAllJobs(50);
```

### 3. Error Handling
V2 gracefully handles API failures:
```javascript
// If one source fails, others continue
RemoteOK: ✅ 50 jobs
Remotive: ❌ Failed (network error)
Adzuna: ✅ 50 jobs
// Total: 100 jobs (still successful!)
```

## Troubleshooting

### Issue: No jobs fetched from Jooble
**Solution:** Make sure you have `JOOBLE_API_KEY` in your `.env`

### Issue: Low email domain extraction rate
**Solution:** Normal - only ~30-40% of job postings include email addresses

### Issue: Port 3001 already in use
**Solution:** Change `PORT` in `.env` to another port (e.g., 3002)

### Issue: Too many API calls
**Solution:** Reduce `limit` parameter in `fetchAllJobs(50)` to `fetchAllJobs(20)`

## Next Steps

1. ✅ Backend V2 is set up
2. ⏭️ Update Frontend V2 to display new jobs
3. ⏭️ Add filters for experience level, job type, etc.
4. ⏭️ Build email outreach feature using company domains
5. ⏭️ Add job matching/recommendation algorithm

## Questions?

Check the main README.md or the V1 documentation for general setup instructions.
