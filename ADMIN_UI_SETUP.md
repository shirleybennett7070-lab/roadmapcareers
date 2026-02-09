# Admin UI Setup Complete! 🎉

## Access the Admin UI

**URL:** `http://localhost:5174/admin`

## Features

### 6 Control Buttons:
1. **📥 Fetch Jobs** - Get jobs from all APIs
2. **🔤 Enrich Domains** - Guess company domains from names
3. **🔍 Find Real Domains** - Search web for actual domains (saves to Column G)
4. **✅ Verify Domains** - Free DNS/HTTP check
5. **🎯 Verify with Hunter.io** - Use Hunter API (uses credits)
6. **📧 Scrape Company Emails** - Extract HR emails from websites

### UI Features:
- **Real-time status** for each script (Running/Completed/Failed/Idle)
- **Start/Stop buttons** for each script
- **Live output console** to view script logs
- **Workflow guide** showing recommended order
- **Auto-refresh** status every 2 seconds

## How to Use

1. **Start backend:**
   ```bash
   cd backendv2
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd frontendv2
   npm run dev
   ```

3. **Open Admin UI:**
   ```
   http://localhost:5174/admin
   ```

4. **Click buttons in order:**
   - Fetch Jobs → Enrich Domains → Find Domains → Verify Domains → Scrape Emails

## What You Get

- **Click & Wait** - No more terminal commands!
- **Visual Status** - See what's running, what's done
- **Live Logs** - Watch output in real-time
- **Stop Control** - Stop long-running scripts anytime
- **Guided Workflow** - Know which script to run next

## Column Layout in Google Sheets

- **Column E**: Guessed domains
- **Column F**: Domain source (guessed/verified-free/etc)
- **Column G**: Real domains (from web search)
- **Column H, I, J**: HR Email 1, 2, 3

Enjoy your new admin dashboard! 🚀
