# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for the certification payment feature.

## 🎯 What's Been Implemented

### Backend (Node.js/Express)
- **Payment Module**: `/backend/modules/payments/`
  - Stripe configuration
  - Payment service functions
  - Payment routes with checkout and verification
  - Webhook handler for production use

### Frontend (React)
- **PaymentButton Component**: Handles Stripe Checkout flow
- **CertificationResult Component**: Displays results and handles payment verification
- **Updated Certification Component**: Integrated with PaymentButton

### Features
✅ Create Stripe Checkout Session
✅ Secure payment processing
✅ Payment verification
✅ Automatic payment status updates
✅ International currency support
✅ Webhook support for production
✅ Test mode for free development

---

## 📋 Prerequisites

1. A Stripe account (free to sign up)
2. Node.js and npm installed
3. Your application running locally

---

## 🚀 Setup Instructions

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" and create a free account
3. Complete the registration process

### Step 2: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **TEST MODE** (toggle in the top right)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 3: Configure Your Backend

1. Create a `.env` file in your `backend` directory (if you don't have one):
   ```bash
   cd /Users/diwakar/RoadmapCareers/backend
   cp .env.example .env
   ```

2. Open `.env` and add your Stripe keys:
   ```env
   # Stripe Payment Configuration
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   
   # Optional: For webhooks (we'll set this up later)
   STRIPE_WEBHOOK_SECRET=
   
   # URLs for redirect after payment
   STRIPE_SUCCESS_URL=http://localhost:5173/certification/result
   STRIPE_CANCEL_URL=http://localhost:5173/certification
   ```

3. Replace `YOUR_SECRET_KEY_HERE` and `YOUR_PUBLISHABLE_KEY_HERE` with your actual keys

### Step 4: Install Dependencies (Already Done)

The necessary packages have been installed:
- Backend: `stripe` package
- Frontend: `@stripe/stripe-js` package

### Step 5: Start Your Servers

1. **Start the backend:**
   ```bash
   cd /Users/diwakar/RoadmapCareers/backend
   npm run dev
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd /Users/diwakar/RoadmapCareers/frontend
   npm run dev
   ```

---

## 🧪 Testing the Payment Integration

### Test in Development Mode (FREE)

Stripe provides test card numbers that you can use for free testing:

#### Test Cards

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Declined:**
- Card Number: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card Number: `4000 0025 0000 3155`

### Testing Flow

1. Go to your certification page
2. Complete the exam and pass
3. Click "Get Your Certificate Now - $9"
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete the payment
7. You'll be redirected back with payment confirmation

### What Happens After Payment

1. User is redirected to success page
2. Payment is verified with Stripe
3. Payment status is updated to "completed" in Google Sheets
4. Certificate ID is generated
5. User sees confirmation message

---

## 🌐 International Support

Stripe automatically handles international payments:

- **Supports 135+ currencies**
- **Accepts cards from 195+ countries**
- **Automatic currency conversion**
- Users pay in their local currency
- You receive payment in USD (or your preferred currency)

### Example:
- US customer sees: $9.00
- UK customer sees: £7.00
- Indian customer sees: ₹750
- You receive: $9.00 (Stripe handles conversion)

---

## 💰 Pricing & Costs

### Development/Testing
- **FREE**: Unlimited test transactions
- **No setup fees**
- **No monthly fees**

### Production (When You Go Live)
- **2.9% + $0.30** per successful charge
- For a $9 certification:
  - Your fee: ~$0.56
  - You keep: ~$8.44

### No Hidden Costs
- No monthly fees
- No setup fees
- No minimum transaction requirements
- Only pay when you make sales

---

## 📱 API Endpoints

Your backend now has these payment endpoints:

```
POST   /api/payments/create-checkout-session
       Create a new Stripe checkout session
       Body: { token: "exam-result-token" }

POST   /api/payments/verify
       Verify payment after checkout
       Body: { sessionId: "stripe-session-id" }

GET    /api/payments/config
       Get Stripe publishable key for frontend

POST   /api/payments/webhook
       Handle Stripe webhook events (for production)
```

---

## 🔧 Troubleshooting

### "Stripe key not found" Error
- Make sure your `.env` file has the correct Stripe keys
- Restart your backend server after adding keys

### Payment Button Not Working
- Check browser console for errors
- Verify backend is running on port 3000
- Ensure frontend can reach `http://localhost:3000`

### Payment Not Verifying
- Check that you're using test mode keys
- Verify the success URL is correct in `.env`
- Check backend logs for errors

### Test Cards Not Working
- Ensure you're in TEST MODE in Stripe Dashboard
- Use the exact card number: `4242 4242 4242 4242`
- Any future expiration date works

---

## 🚀 Going to Production

When you're ready to accept real payments:

### 1. Complete Stripe Account Setup
- Add business details
- Verify your identity
- Add bank account for payouts

### 2. Switch to Live Mode
1. In Stripe Dashboard, toggle to **LIVE MODE**
2. Get your live API keys (starts with `pk_live_` and `sk_live_`)
3. Update your `.env` with live keys

### 3. Set Up Webhooks (Recommended)
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/payments/webhook`
4. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
5. Copy the webhook secret to your `.env` file

### 4. Update URLs
Update your `.env` with production URLs:
```env
STRIPE_SUCCESS_URL=https://yourdomain.com/certification/result
STRIPE_CANCEL_URL=https://yourdomain.com/certification
```

---

## 📧 Certificate Delivery

After successful payment:
1. Payment status is updated to "completed"
2. Certificate ID is generated (e.g., `RC-XXXXX-XXXX`)
3. Status is saved in Google Sheets
4. *TODO*: Set up email to send certificate PDF

---

## 🔐 Security Notes

- Never commit your `.env` file to git
- Keep your secret key (`sk_`) private
- Use test keys for development
- Enable webhook signatures in production
- Validate all payments server-side

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## 🎉 You're All Set!

Your payment integration is ready to test. Remember:
- ✅ Testing is **100% FREE**
- ✅ Use test card: `4242 4242 4242 4242`
- ✅ Test as much as you want
- ✅ No real money charged in test mode

Need help? Check the Stripe Dashboard for detailed transaction logs and debugging information.
