#!/bin/bash

# Stripe Payment Integration Test Script
# This script helps you quickly test the payment integration

echo "🚀 RoadmapCareers - Stripe Payment Test Helper"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo ""
    echo "Please create backend/.env file with your Stripe keys:"
    echo "  cd backend"
    echo "  cp .env.example .env"
    echo "  nano .env  # Add your Stripe keys"
    echo ""
    exit 1
fi

# Check if Stripe keys are configured
if ! grep -q "STRIPE_SECRET_KEY=sk_test_" backend/.env 2>/dev/null; then
    echo "⚠️  Warning: Stripe keys not configured in backend/.env"
    echo ""
    echo "Get your test keys from: https://dashboard.stripe.com/test/apikeys"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to stop..."
fi

echo "✅ Configuration check complete!"
echo ""
echo "🎯 Test Card Numbers (100% FREE):"
echo "================================"
echo "✅ Success:    4242 4242 4242 4242"
echo "❌ Declined:   4000 0000 0000 0002"
echo "🔐 3D Secure:  4000 0025 0000 3155"
echo ""
echo "For all cards use:"
echo "  • Expiry: 12/25 (any future date)"
echo "  • CVC: 123 (any 3 digits)"
echo "  • ZIP: 12345 (any 5 digits)"
echo ""
echo "📋 Testing Steps:"
echo "================"
echo "1. Open: http://localhost:5173/certification"
echo "2. Fill in your name and email"
echo "3. Complete the exam (get 12+ correct)"
echo "4. Click 'Get Your Certificate Now - \$9'"
echo "5. Use test card: 4242 4242 4242 4242"
echo "6. Complete payment"
echo "7. See success message!"
echo ""
echo "💰 Costs:"
echo "========"
echo "• Testing: \$0 (FREE forever)"
echo "• Production: 2.9% + \$0.30 per sale"
echo "• For \$9 sale: You keep ~\$8.44"
echo ""
echo "🌍 International:"
echo "================"
echo "• 135+ currencies supported automatically"
echo "• Customers pay in their local currency"
echo "• You receive everything in USD"
echo ""
echo "📚 Resources:"
echo "============"
echo "• Setup Guide: STRIPE_SETUP_GUIDE.md"
echo "• Quick Start: STRIPE_QUICKSTART.md"
echo "• API Docs: backend/API_DOCS.md"
echo "• Stripe Dashboard: https://dashboard.stripe.com"
echo ""
echo "Ready to start servers? (Press Ctrl+C to cancel)"
read -p "Press Enter to continue..."
echo ""
echo "Starting servers..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "🎯 Open http://localhost:5173/certification to test!"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for user to stop
wait
