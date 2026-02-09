# V2 API Setup Guide - Get Your Keys (10 mins)

## Overview
V2 needs just 2 API keys to get 300+ jobs per fetch (both FREE!)

## Required Keys (FREE)

### 1. Adzuna API (5 minutes)

**What it gives you:** 50+ high-quality jobs from Indeed, Monster, etc.

**Steps:**
1. Go to: https://developer.adzuna.com
2. Click "Register" (top right)
3. Fill in basic info:
   - Email
   - Company name (can be "Personal")
   - Use case: "Job aggregation"
4. You'll instantly receive:
   - App ID (numbers)
   - App Key (long string)
5. Add to your `.env`:
```env
ADZUNA_APP_ID=12345678
ADZUNA_APP_KEY=abc123def456...
```

**Limits:** 1,000 calls/month (plenty - V2 uses 1 per fetch)

---

### 2. Jooble API (5 minutes)

**What it gives you:** 100+ jobs from multiple job boards

**Steps:**
1. Go to: https://jooble.org/api/about
2. Fill out the API request form:
   - Name
   - Email
   - Website (can be "Testing")
3. You'll receive API key via email within a few minutes
4. Add to your `.env`:
```env
JOOBLE_API_KEY=your-api-key-here
```

**Limits:** 500 requests/day (plenty - V2 uses ~15 per fetch)

---

## Optional Keys (Still FREE)

### 3. RemoteOK, Remotive, etc.
These work **without API keys**! V2 will use them automatically.

---

## Complete .env Setup

```env
# Copy from .env.example
cp .env.example .env

# Edit .env and add:
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
JOOBLE_API_KEY=your_jooble_key

# Also update these:
GOOGLE_SHEET_ID=your_google_sheet_id
PORT=3001
FRONTEND_URL=http://localhost:5174
```

---

## Test It Works

```bash
cd backendv2
npm install
npm run fetch-jobs
```

**Expected output:**
```
V2: Total remote jobs fetched: 350+
- RemoteOK: 50
- Remotive: 50  
- Adzuna: 50
- Jooble: 100
- WellFound: 40
- WeWorkRemotely: 30
- Remote.co: 30

📧 Jobs with company email domain: 120 (34%)
✅ Success! Added 350 new jobs
```

---

## Troubleshooting

### "Skipping Adzuna (no API keys configured)"
- You didn't add `ADZUNA_APP_ID` or `ADZUNA_APP_KEY` to `.env`
- Make sure there are no quotes around the values
- Make sure `.env` is in `/backendv2/` directory

### "Skipping Jooble (no API key configured)"
- You didn't add `JOOBLE_API_KEY` to `.env`
- Check your email for the API key (might take a few minutes)
- Try requesting again if you didn't receive it

### "Only getting jobs from RemoteOK and Remotive"
- That's okay! Those work without API keys
- You'll still get ~100 jobs per fetch
- But with API keys, you get 350+ jobs

### "Rate limit exceeded"
- You're fetching too often
- Adzuna: 1,000 calls/month = ~33 per day
- Jooble: 500 calls/day
- Solution: Don't fetch more than once per hour

---

## What Each Source Gives You

| Source | API Key? | Jobs/Fetch | Best For |
|--------|----------|------------|----------|
| RemoteOK | ❌ No | 50 | Tech startup jobs |
| Remotive | ❌ No | 50 | Curated remote jobs |
| Adzuna | ✅ Yes | 50 | Indeed/Monster jobs |
| Jooble | ✅ Yes | 100 | Aggregated jobs |
| WellFound | ❌ No | 40 | Startup/tech jobs |
| WeWorkRemotely | ❌ No | 30 | Curated remote |
| Remote.co | ❌ No | 30 | Remote-first companies |

---

## Cost Summary

| Item | Cost |
|------|------|
| Adzuna API | FREE (1,000/month) |
| Jooble API | FREE (500/day) |
| All other sources | FREE (no key needed) |
| **Total** | **$0/month** |

---

## Upgrade Options (Optional)

### JSearch (RapidAPI) - $30/month
If you need even MORE volume:
- 1,000 requests/month
- 50+ jobs per request
- Real Indeed/ZipRecruiter data
- Sign up: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch

**Worth it if:**
- You're monetizing the jobs
- You need 500+ jobs per fetch
- You want premium job sources

---

## Next Steps

1. ✅ Get Adzuna API key (5 min)
2. ✅ Get Jooble API key (5 min)
3. ✅ Add both to `.env`
4. ✅ Run `npm run fetch-jobs`
5. 🎉 You now have 300+ jobs!

**Questions?** Check the main V2_CHANGES.md or QUICK_SUMMARY.md
