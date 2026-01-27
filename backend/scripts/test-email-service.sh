#!/bin/bash

# Email Service Test Script
# Tests email endpoints on both Railway environments

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DEV_URL="https://roadmapcareers-development.up.railway.app"
PROD_URL="https://roadmapcareers-production.up.railway.app"

echo -e "${BLUE}📧 Email Service Test${NC}"
echo "===================="
echo ""

# Test Development Environment
echo -e "${YELLOW}Testing DEVELOPMENT environment...${NC}"
echo "URL: $DEV_URL"
echo ""

echo "1. Testing email process endpoint..."
curl -X POST "$DEV_URL/api/email/process" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "2. Getting leads count..."
curl -X GET "$DEV_URL/api/email/leads" \
  -H "Content-Type: application/json" \
  -s | jq '{success, count}'

echo ""
echo -e "${GREEN}✅ Development tests complete${NC}"
echo ""

# Test Production Environment
echo -e "${YELLOW}Testing PRODUCTION environment...${NC}"
echo "URL: $PROD_URL"
echo ""

echo "1. Testing email process endpoint..."
curl -X POST "$PROD_URL/api/email/process" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo "2. Getting leads count..."
curl -X GET "$PROD_URL/api/email/leads" \
  -H "Content-Type: application/json" \
  -s | jq '{success, count}'

echo ""
echo -e "${GREEN}✅ Production tests complete${NC}"
echo ""

# Summary
echo "========================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "========================================="
echo ""
echo "Development URL: $DEV_URL"
echo "Production URL:  $PROD_URL"
echo ""
echo "Email processing schedule:"
echo "  • Development: Every 1 minute"
echo "  • Production:  Every 1 hour"
echo ""
echo "Sending from: katherine@roadmapcareers.com"
echo ""
echo "To monitor logs:"
echo "  railway environment development && railway logs --follow"
echo "  railway environment production && railway logs --follow"
echo ""
