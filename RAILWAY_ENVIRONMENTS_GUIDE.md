# 🚀 Railway Environment Setup Guide

## Option 1: Using Railway Dashboard (Recommended)

Railway supports multiple environments in the same project. Here's how to set them up:

### Step 1: Create Environments
1. Go to your Railway project
2. Click **Settings** → **Environments**
3. You'll see "production" by default
4. Click **+ New Environment** → Name it "development"

### Step 2: Add Variables to Each Environment

#### Switch to **Production** Environment:
Click "production" in the environment dropdown, then add:

```
NODE_ENV=production
PORT=8080
GOOGLE_SHEET_ID=1QP1KwgqKVCIt2t7FA45YvVXbAtVcwJ-ADifksUNC-FM
GOOGLE_CREDENTIALS_JSON=<paste from RAILWAY_VARS_READY.txt>
YOUR_CONTACT_EMAIL=katherine@roadmapcareers.com
YOUR_BUSINESS_NAME=RoadmapCareers
JOOBLE_API_KEY=c182197d-6d09-4829-88a4-ad57b1912614
STRIPE_SECRET_KEY=sk_live_... (your LIVE Stripe key)
STRIPE_PUBLISHABLE_KEY=pk_live_... (your LIVE Stripe key)
STRIPE_WEBHOOK_SECRET=whsec_... (your production webhook)
STRIPE_SUCCESS_URL=https://your-production-domain.com/certification/result
STRIPE_CANCEL_URL=https://your-production-domain.com/certification
```

#### Switch to **Development** Environment:
Click "development" in the environment dropdown, then add:

```
NODE_ENV=development
PORT=8080
GOOGLE_SHEET_ID=1QP1KwgqKVCIt2t7FA45YvVXbAtVcwJ-ADifksUNC-FM
GOOGLE_CREDENTIALS_JSON=<paste from RAILWAY_VARS_READY.txt>
YOUR_CONTACT_EMAIL=katherine@roadmapcareers.com
YOUR_BUSINESS_NAME=RoadmapCareers
JOOBLE_API_KEY=c182197d-6d09-4829-88a4-ad57b1912614
STRIPE_SECRET_KEY=sk_test_... (your TEST Stripe key)
STRIPE_PUBLISHABLE_KEY=pk_test_... (your TEST Stripe key)
STRIPE_WEBHOOK_SECRET=whsec_... (your test webhook)
STRIPE_SUCCESS_URL=https://dev-your-domain.com/certification/result
STRIPE_CANCEL_URL=https://dev-your-domain.com/certification
```

---

## Option 2: Using Railway CLI (Alternative)

### Step 1: Login to Railway
```bash
railway login
```
(This will open your browser to authenticate)

### Step 2: Link to Your Project
```bash
cd /Users/alisonzhao/RoadmapCareers/backend
railway link
```
(Select your project from the list)

### Step 3: Set Variables by Environment

**For Production:**
```bash
railway environment production

# Add variables one by one
railway variables set NODE_ENV=production
railway variables set PORT=8080
railway variables set GOOGLE_SHEET_ID=1QP1KwgqKVCIt2t7FA45YvVXbAtVcwJ-ADifksUNC-FM
# ... (add all other variables)
```

**For Development:**
```bash
railway environment development

# Add variables one by one
railway variables set NODE_ENV=development
railway variables set PORT=8080
# ... (add all other variables)
```

### Step 4: Deploy to Specific Environment
```bash
# Deploy to production
railway up --environment production

# Deploy to development
railway up --environment development
```

---

## 🎯 Key Differences Between Environments:

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | development | production |
| `STRIPE_SECRET_KEY` | sk_test_... | sk_live_... |
| `STRIPE_PUBLISHABLE_KEY` | pk_test_... | pk_live_... |
| `STRIPE_SUCCESS_URL` | dev domain | production domain |
| `STRIPE_CANCEL_URL` | dev domain | production domain |

Everything else (Google Sheets, Jooble API) can be the same.

---

## ✅ Benefits:

- **Separate deployments** - Test in dev before pushing to production
- **Different domains** - dev.yourdomain.com vs yourdomain.com
- **Safe testing** - Use Stripe test keys in dev
- **Easy switching** - Toggle between environments in Railway dashboard

---

## 📝 Next Steps:

1. Set up both environments in Railway dashboard
2. Deploy to development first to test
3. Once everything works, deploy to production
4. Use development for all future testing

Would you like help with the Railway CLI commands or dashboard setup?
