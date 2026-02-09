# V1 vs V2 Comparison

## Quick Overview

| | V1 (Original) | V2 (Pivot) |
|---|---------------|------------|
| **Target Market** | Entry-level job seekers | All remote workers |
| **Job Types** | Non-technical only | All types (tech + non-tech) |
| **Experience Levels** | Entry-level only | Entry to Senior+ |
| **Jobs per Fetch** | ~60 | ~350+ |
| **Jobs per Month** | ~2,000 | ~10,000+ |
| **Email Extraction** | ❌ No | ✅ Yes (~30-40%) |
| **API Sources** | 3 | 7+ |
| **Backend Port** | 3000 | 3001 |
| **Frontend Port** | 5173 | 5174 |

## Use Cases

### V1 - Entry-Level Career Training
- Target: People new to remote work
- Focus: Non-technical roles (customer service, admin, etc.)
- Revenue: Training courses for entry-level jobs
- Volume: Lower, but highly targeted

### V2 - Broad Remote Job Marketplace
- Target: All remote workers
- Focus: Everything from junior to senior, tech to non-tech
- Revenue: Job board, recruiter tool, lead gen, data sales
- Volume: High volume for better matching/monetization

## File Structure

```
/backend/         (V1 - Keep for existing customers)
/backendv2/       (V2 - New pivot strategy)
/frontend/        (V1 - Keep for existing customers)
/frontendv2/      (V2 - New pivot strategy)
```

## When to Use Which?

### Use V1 If:
- You're targeting career coaching/training
- You want entry-level non-technical jobs only
- You have customers who need this specific filter
- You want to keep the original business model

### Use V2 If:
- You're pivoting to a broader job board
- You want to do recruiter outreach (email domains!)
- You need high volume for better monetization
- You want to serve all remote workers, not just entry-level

## Running Both Simultaneously

Yes! You can run both at the same time:

```bash
# V1 Backend
cd backend && npm start         # Port 3000

# V2 Backend  
cd backendv2 && npm start       # Port 3001

# V1 Frontend
cd frontend && npm run dev      # Port 5173

# V2 Frontend
cd frontendv2 && npm run dev    # Port 5174
```

This lets you:
- A/B test different markets
- Keep existing V1 customers while testing V2
- Compare results between both approaches

## Migration Path

If V2 proves successful, you can:
1. Keep both running (serve different markets)
2. Migrate V1 customers to V2
3. Sunset V1 entirely
4. Merge best features of both into V3

## Cost Comparison

### V1 Costs
- Adzuna: FREE (1,000 calls/month)
- No other API keys required
- **Total: $0/month**

### V2 Costs
- Adzuna: FREE (1,000 calls/month)
- Jooble: FREE (500 calls/day)
- Optional JSearch: $30/month
- **Total: $0-30/month**

Both are extremely cost-effective!

## Next Steps

1. ✅ V1 and V2 backends are set up
2. ⏭️ Test V2 job fetching
3. ⏭️ Update frontendv2 to display new jobs
4. ⏭️ Decide on business model for V2
5. ⏭️ Build features unique to V2 (email outreach tools?)

## Questions to Consider

1. **Do you want to run both?** Or just pivot to V2?
2. **What will you do with email domains?** Recruiter outreach tool?
3. **Pricing strategy for V2?** Job board, premium listings, recruiter access?
4. **Keep V1 customers?** Or migrate them to V2?

---

**Bottom Line:** V2 gives you 6x more jobs across all levels with email domains for direct outreach. It's positioned for a broader market and more monetization opportunities.
