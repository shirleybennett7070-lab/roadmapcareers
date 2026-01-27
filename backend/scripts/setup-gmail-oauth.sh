#!/bin/bash

# Gmail OAuth Setup Script for Railway
# This script helps set up Gmail OAuth credentials for the email service

set -e

PROJECT_ID="roadmapcareers-1769485146"
export PATH=$HOME/google-cloud-sdk/bin:$PATH

echo "📧 Gmail OAuth Setup for RoadmapCareers"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Gmail API is enabled
echo "🔍 Checking Gmail API status..."
if gcloud services list --enabled --project=$PROJECT_ID | grep -q gmail.googleapis.com; then
    echo -e "${GREEN}✅ Gmail API is enabled${NC}"
else
    echo -e "${YELLOW}⚙️  Enabling Gmail API...${NC}"
    gcloud services enable gmail.googleapis.com --project=$PROJECT_ID
    echo -e "${GREEN}✅ Gmail API enabled${NC}"
fi

echo ""
echo "📋 Next Steps (Manual - via Google Cloud Console):"
echo "=================================================="
echo ""
echo "1. Create OAuth Credentials:"
echo "   - Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "   - Click '+ CREATE CREDENTIALS' → 'OAuth client ID'"
echo ""
echo "2. Configure OAuth Consent Screen (if needed):"
echo "   - User Type: External"
echo "   - App name: RoadmapCareers Email Bot"
echo "   - User support email: your-email@gmail.com"
echo "   - Developer contact: your-email@gmail.com"
echo "   - Add test user: katherine@roadmapcareers.com"
echo "   - Click 'Save and Continue'"
echo ""
echo "3. Create OAuth Client ID:"
echo "   - Application type: Web application"
echo "   - Name: RoadmapCareers Gmail Access"
echo "   - Authorized redirect URIs (add all three):"
echo "     • http://localhost:3000/oauth/callback"
echo "     • https://roadmapcareers-development.up.railway.app/oauth/callback"
echo "     • https://roadmapcareers-production.up.railway.app/oauth/callback"
echo ""
echo "4. Copy the Client ID and Client Secret"
echo ""
echo "=================================================="
echo ""

read -p "Have you created the OAuth credentials? (y/n): " created

if [ "$created" != "y" ]; then
    echo ""
    echo "Please create the OAuth credentials first, then run this script again."
    exit 0
fi

echo ""
read -p "Enter your GMAIL_CLIENT_ID: " CLIENT_ID
read -p "Enter your GMAIL_CLIENT_SECRET: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Client ID and Secret cannot be empty${NC}"
    exit 1
fi

echo ""
echo "🚀 Setting up Railway environment variables..."
echo ""

# Development environment
echo "📦 Setting up DEVELOPMENT environment..."
export PATH=$HOME/.node/bin:$PATH
cd "$(dirname "$0")/../.."

railway environment development
railway service roadmapcareers
railway variables set GMAIL_CLIENT_ID="$CLIENT_ID"
railway variables set GMAIL_CLIENT_SECRET="$CLIENT_SECRET"
railway variables set GMAIL_REDIRECT_URI="https://roadmapcareers-development.up.railway.app/oauth/callback"

echo -e "${GREEN}✅ Development environment configured${NC}"

# Production environment
echo ""
echo "📦 Setting up PRODUCTION environment..."
railway environment production
railway service roadmapcareers
railway variables set GMAIL_CLIENT_ID="$CLIENT_ID"
railway variables set GMAIL_CLIENT_SECRET="$CLIENT_SECRET"
railway variables set GMAIL_REDIRECT_URI="https://roadmapcareers-production.up.railway.app/oauth/callback"

echo -e "${GREEN}✅ Production environment configured${NC}"

# Update local .env
echo ""
echo "📝 Updating local .env file..."
ENV_FILE="./backend/.env"

if ! grep -q "GMAIL_CLIENT_ID" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# Gmail OAuth Configuration" >> "$ENV_FILE"
    echo "GMAIL_CLIENT_ID=$CLIENT_ID" >> "$ENV_FILE"
    echo "GMAIL_CLIENT_SECRET=$CLIENT_SECRET" >> "$ENV_FILE"
    echo "GMAIL_REDIRECT_URI=http://localhost:3000/oauth/callback" >> "$ENV_FILE"
else
    # Update existing values
    sed -i.bak "s|GMAIL_CLIENT_ID=.*|GMAIL_CLIENT_ID=$CLIENT_ID|" "$ENV_FILE"
    sed -i.bak "s|GMAIL_CLIENT_SECRET=.*|GMAIL_CLIENT_SECRET=$CLIENT_SECRET|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak"
fi

echo -e "${GREEN}✅ Local .env file updated${NC}"

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Gmail OAuth Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📝 Next Steps:"
echo "1. Authorize Gmail access locally:"
echo "   cd backend"
echo "   npm run auth-gmail"
echo ""
echo "2. Follow the prompts to authorize as katherine@roadmapcareers.com"
echo ""
echo "3. Test email processing:"
echo "   npm run process-emails"
echo ""
echo "4. Check Railway logs to verify cron jobs:"
echo "   railway logs --follow"
echo ""
echo "🎯 Email Service Configuration:"
echo "   - Development: Processes emails every 1 minute"
echo "   - Production: Processes emails every 1 hour"
echo "   - Sending from: katherine@roadmapcareers.com"
echo ""
