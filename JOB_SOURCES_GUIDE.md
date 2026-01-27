# Job Sources - Quality vs Quantity

## Current Situation

Most **free** job APIs focus on tech/developer roles. Non-technical entry-level jobs are harder to find via APIs.

## What's Working (Free)

### ✅ Remotive
- **Quality:** Good English descriptions
- **Quantity:** ~2-5 non-technical entry-level jobs per fetch
- **Best for:** Remote customer service, admin, writing

### ⚠️ RemoteOK
- **Quality:** Good when working
- **Quantity:** Low for non-technical
- **Issue:** Currently has date parsing errors

## What Doesn't Work Well (Free)

### ❌ Arbeitnow
- **Issue:** Mostly German/EU jobs in German language
- **Status:** Removed from rotation

### ❌ The Muse
- **Issue:** API blocked (403 error)
- **Status:** Needs authentication

## Solutions to Get Better Jobs

### Option 1: Add Paid APIs (Recommended)

**JSearch (RapidAPI)** - Best for US jobs
- Cost: $30/month for 1,000 requests
- Quality: Excellent, real Indeed/ZipRecruiter jobs
- English: Yes, US-focused
- **How to set up:**
  1. Go to [rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
  2. Subscribe to Basic plan ($30/month)
  3. Copy your RapidAPI key
  4. Add to `.env`: `JSEARCH_API_KEY=your_key_here`

**Adzuna** - Good for entry-level
- Cost: Free for 1,000 calls/month
- Quality: Good
- **How to set up:**
  1. Go to [developer.adzuna.com](https://developer.adzuna.com/)
  2. Create account
  3. Get App ID and App Key
  4. Add to `.env`:
```
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
```

### Option 2: Manual Curation (Best Quality)

Since you're building a lead gen business, **manual curation** gives you:
- ✅ Best quality jobs
- ✅ Full control over which jobs you promote
- ✅ Better conversion (you know the jobs are real)

**Use the API to add jobs manually:**

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Service Representative",
    "company": "Amazon",
    "originalUrl": "https://amazon.jobs/en/jobs/...",
    "description": "Full job description here...",
    "salaryRange": "$15-20/hour",
    "location": "Remote"
  }'
```

**Where to find jobs manually:**
- Indeed.com (search: "entry level remote customer service")
- LinkedIn Jobs (filter: Remote, Entry level)
- FlexJobs (curated remote jobs)
- Remote.co
- WeWorkRemotely

### Option 3: Combination Approach (Recommended)

1. **Run API fetch daily** to get ~5-10 jobs from Remotive (free)
2. **Add 10-20 jobs manually** per week from Indeed/LinkedIn
3. **Result:** 50-100 quality jobs per month

## Current Setup

Your system supports all three approaches:

### Automated (CLI):
```bash
npm run fetch-jobs   # Fetch from APIs
```

### Automated (API):
```bash
curl -X POST http://localhost:3000/api/jobs/fetch
```

### Manual (API):
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "...", "company": "...", "originalUrl": "..."}'
```

## Recommendation

For a **job lead generation business**, I recommend:

1. **Week 1-2:** Add paid JSearch API ($30/month) → get 100+ quality US jobs
2. **Ongoing:** Mix of automated (Remotive + JSearch) + manual curation
3. **Focus:** 20-30 QUALITY jobs over 100+ mediocre jobs

Quality > Quantity for lead conversion!
