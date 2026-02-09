# Domain Enrichment Guide - V2

## Overview
The domain enrichment script finds company domains for jobs that don't have them yet.

## How It Works

### Multiple Strategies (in order):

1. **Email Extraction** ⭐ Most Reliable
   - Finds `contact@company.com` in job descriptions
   - Filters out Gmail, Yahoo, etc.
   - **Success Rate:** ~2-5%

2. **Website URL Extraction** ⭐⭐ Very Reliable
   - Looks for "visit us at company.com"
   - Finds URLs in descriptions
   - **Success Rate:** ~10-20%

3. **Job URL Parsing** ⭐⭐⭐ Highly Reliable
   - Extracts domain from application URL
   - Filters out job boards
   - **Success Rate:** ~5-10%

4. **Hunter.io API** ⭐⭐⭐ (Optional, requires API key)
   - Searches company name → domain
   - Free tier: 50 requests/month
   - **Success Rate:** ~40-60%

5. **Company Name Guessing** 
   - "Acme Corp" → acme.com
   - Marked as "(guessed)" 
   - **Success Rate:** 100% but needs verification

## Usage

### Run Domain Enrichment:
```bash
cd backendv2
npm run enrich-domains
```

### What It Does:
1. Loads all jobs from Google Sheet
2. Finds jobs without domains
3. Processes each job through 5 strategies
4. Updates Google Sheet in batches (50 at a time)
5. Shows results summary

### Expected Output:
```
🔍 Domain Enrichment Script - V2

============================================================
📊 Loading jobs from Google Sheet...

Found 1026 total jobs
1024 jobs need domain enrichment

============================================================

[1/1024] Acme Corp
Processing: Acme Corp...
  ✓ Found website in text: acme.com

[2/1024] Tech Startup Inc
Processing: Tech Startup Inc...
  ~ Guessed domain: techstartup.com (guessed)

...

📝 Updating batch of 50 jobs...
📝 Updating batch of 50 jobs...

============================================================
✅ Domain Enrichment Complete!

📊 Results:
   - Found (verified): 150
   - Guessed: 800
   - Not found: 74
   - Total processed: 1024

📈 Success rate: 15%
============================================================
```

## Google Sheets Rate Limits

**Quota:** 60 write requests per minute per user

**Solution:** Batch updates
- Updates 50 jobs at once
- Waits 50ms between processing
- Avoids hitting rate limits

## Adding Hunter.io API (Optional)

**Why:** Dramatically increases verified domains (40-60% success rate)

**Setup:**
1. Go to https://hunter.io
2. Sign up for free account
3. Get API key (50 requests/month free)
4. Add to `.env`:
```env
HUNTER_API_KEY=your_api_key_here
```

**Cost:**
- Free: 50 requests/month
- Paid: $49/month for 1,000 requests

**Worth it?**
- Free tier: Good for testing (~50 jobs enriched per month)
- Paid: Worth it if you need high accuracy

## Expected Results

### Without Hunter.io:
- **Verified domains:** 10-20% of jobs
- **Guessed domains:** 70-80% of jobs
- **No domain:** 5-10% of jobs

### With Hunter.io:
- **Verified domains:** 50-70% of jobs
- **Guessed domains:** 20-30% of jobs
- **No domain:** 5-10% of jobs

## Domain Quality

### Verified Domains:
- ✅ Can be used for direct outreach
- ✅ High confidence
- ✅ Email format: contact@domain.com, jobs@domain.com

### Guessed Domains:
- ⚠️ Need verification before use
- ⚠️ Marked with "(guessed)" suffix
- ⚠️ About 60-70% accuracy

### Removing "(guessed)" Suffix:
You can verify guessed domains by:
1. Visiting the domain
2. Checking if it's the right company
3. Removing "(guessed)" suffix manually
4. Or running a verification script later

## Performance

### Processing Time:
- **1,000 jobs:** ~2-3 minutes
- **5,000 jobs:** ~10-15 minutes

### Rate Limiting:
- 50ms delay between jobs
- Batch updates every 50 jobs
- No API quota issues

## Verification Script (Future Enhancement)

```javascript
// Verify guessed domains by checking if they're real
async function verifyDomain(domain) {
  try {
    const response = await axios.get(`https://${domain}`, {
      timeout: 3000,
      maxRedirects: 0
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
```

## Use Cases

### 1. Direct Outreach
```
Domain: acme.com
Possible emails:
- jobs@acme.com
- careers@acme.com
- recruiting@acme.com
- hr@acme.com
```

### 2. Company Research
- Visit company website
- Check LinkedIn company page
- Research company culture

### 3. Lead Generation
- Build list of hiring companies
- Contact for B2B services
- Sell recruiting tools

### 4. Data Enrichment
- Add to CRM
- Enrich with Clearbit
- Add company size, industry, etc.

## Tips

1. **Run after fetching new jobs:**
   ```bash
   npm run fetch-jobs
   npm run enrich-domains
   ```

2. **Re-run periodically:**
   - APIs improve over time
   - New strategies added
   - Better success rates

3. **Manual verification:**
   - Spot-check guessed domains
   - Update incorrect ones
   - Remove invalid ones

4. **Export for use:**
   - Download Google Sheet as CSV
   - Filter rows with verified domains
   - Use for outreach campaigns

## Troubleshooting

### Error: "Quota exceeded"
**Solution:** Script now uses batching, should not happen

### Low success rate
**Solution:** Add Hunter.io API key for better results

### Guessed domains are wrong
**Solution:** Run verification script or manually check

### Script takes too long
**Solution:** Reduce batch size or process fewer jobs at a time

## Next Steps

1. ✅ Run domain enrichment
2. ⏭️ Verify guessed domains
3. ⏭️ Build email finder tool
4. ⏭️ Create outreach system
5. ⏭️ Add more domain sources (Clearbit, etc.)
