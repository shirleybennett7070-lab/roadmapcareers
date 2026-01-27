# 🔧 OAuth Consent Screen Setup

## Step-by-Step Guide

### 1. Go to OAuth Consent Screen
https://console.cloud.google.com/apis/credentials/consent?project=roadmap-careers

### 2. Configure the Consent Screen

If you haven't configured it yet:

1. **User Type:** Select **External** → Click **Create**

2. **App Information:**
   - App name: `RoadmapCareers Email Bot`
   - User support email: (select your personal Gmail)
   - App logo: (skip for now)

3. **App Domain:**
   - Skip all domains for now
   - Developer contact: (your personal Gmail)
   - Click **Save and Continue**

4. **Scopes:**
   - Click **Add or Remove Scopes**
   - Search for: `gmail`
   - Check these boxes:
     - `.../auth/gmail.readonly`
     - `.../auth/gmail.send`
     - `.../auth/gmail.modify`
   - Click **Update** → **Save and Continue**

5. **Test Users (IMPORTANT!):**
   - Click **+ ADD USERS**
   - Enter: `shirley@roapmapcareers.com`
   - Click **Add**
   - Click **Save and Continue**

6. **Summary:**
   - Click **Back to Dashboard**

### 3. Verify Test User Added

Go back to: https://console.cloud.google.com/apis/credentials/consent?project=roadmap-careers

You should see:
- Publishing status: **Testing**
- Test users: **shirley@roapmapcareers.com**

---

## ✅ Once Complete

Your app is now authorized to access shirley@roapmapcareers.com's Gmail!

Run:
```bash
npm run auth-gmail
```

The authorization URL will work now and you can sign in as Shirley.

---

## 📝 Notes

- App stays in "Testing" mode (perfect for your use case)
- Only test users can authorize the app
- No Google verification needed for testing mode
- Can have up to 100 test users
