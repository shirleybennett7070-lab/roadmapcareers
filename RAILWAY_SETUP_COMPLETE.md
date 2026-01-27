# ✅ Railway Environments Setup Complete!

## 🎯 Both Environments Configured

### Production Environment
- ✅ NODE_ENV=production
- ✅ PORT=8080
- ✅ GOOGLE_SHEET_ID (workspace sheet)
- ✅ GOOGLE_CREDENTIALS_JSON (service account)
- ✅ YOUR_CONTACT_EMAIL=katherine@roadmapcareers.com
- ✅ YOUR_BUSINESS_NAME=RoadmapCareers
- ✅ JOOBLE_API_KEY (configured)

### Development Environment
- ✅ NODE_ENV=development
- ✅ PORT=8080
- ✅ GOOGLE_SHEET_ID (same workspace sheet)
- ✅ GOOGLE_CREDENTIALS_JSON (service account)
- ✅ YOUR_CONTACT_EMAIL=katherine@roadmapcareers.com
- ✅ YOUR_BUSINESS_NAME=RoadmapCareers
- ✅ JOOBLE_API_KEY (configured)

---

## ⚠️ Still Need to Add:

Both environments need Stripe variables. Get them from https://dashboard.stripe.com/apikeys

### For Production:
```bash
railway environment production
railway variables set STRIPE_SECRET_KEY=sk_live_your_key
railway variables set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
railway variables set STRIPE_WEBHOOK_SECRET=whsec_your_webhook
railway variables set STRIPE_SUCCESS_URL=https://yourdomain.com/certification/result
railway variables set STRIPE_CANCEL_URL=https://yourdomain.com/certification
```

### For Development:
```bash
railway environment development
railway variables set STRIPE_SECRET_KEY=sk_test_your_key
railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_your_key
railway variables set STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook
railway variables set STRIPE_SUCCESS_URL=https://dev.yourdomain.com/certification/result
railway variables set STRIPE_CANCEL_URL=https://dev.yourdomain.com/certification
```

---

## 🚀 Deployment Commands

### Deploy to Development:
```bash
cd /Users/alisonzhao/RoadmapCareers/backend
export PATH=$HOME/.node/bin:$PATH
railway environment development
railway up
```

### Deploy to Production:
```bash
cd /Users/alisonzhao/RoadmapCareers/backend
export PATH=$HOME/.node/bin:$PATH
railway environment production
railway up
```

---

## 📊 Check Deployment Status

```bash
railway status
railway logs
```

---

## 🔄 Switch Between Environments

```bash
# Switch to development
railway environment development

# Switch to production
railway environment production

# Check current environment
railway status
```

---

## ✅ What's Working Now:

1. Both environments have Google Sheets access
2. Job fetching (Jooble API) will work
3. Basic backend functionality ready
4. Just need Stripe keys for payment features

---

## 📝 Next Steps:

1. Get Stripe API keys from dashboard
2. Add Stripe variables to both environments
3. Deploy to development first (`railway up`)
4. Test everything
5. Deploy to production when ready

Your backend is 95% configured! 🎉
