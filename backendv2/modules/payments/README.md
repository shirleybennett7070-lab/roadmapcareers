# Payment Module

Stripe payment integration for RoadmapCareers certification payments.

## Overview

This module handles secure payment processing for certification purchases using Stripe Checkout.

## Features

- ✅ Stripe Checkout integration
- ✅ Payment verification
- ✅ Automatic payment status updates
- ✅ International currency support (135+ currencies)
- ✅ Test mode for development
- ✅ Webhook support for production
- ✅ Secure payment processing

## Price

- **Certification**: $9.00 USD
- Automatic currency conversion for international customers

## Structure

```
modules/payments/
├── config/
│   └── stripe.js          # Stripe configuration
├── services/
│   └── paymentService.js  # Payment processing logic
└── routes.js              # API endpoints
```

## Endpoints

### POST /api/payments/create-checkout-session
Create a new Stripe checkout session.

**Request:**
```json
{
  "token": "exam-result-token"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_abc123",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/payments/verify
Verify payment after Stripe checkout.

**Request:**
```json
{
  "sessionId": "cs_test_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "paid": true,
  "certificateId": "RC-ABC123-XYZ"
}
```

### GET /api/payments/config
Get Stripe publishable key.

**Response:**
```json
{
  "publishableKey": "pk_test_..."
}
```

### POST /api/payments/webhook
Handle Stripe webhook events (production).

## Setup

1. Get Stripe API keys from https://dashboard.stripe.com/test/apikeys
2. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Restart backend server

See `STRIPE_SETUP_GUIDE.md` for detailed instructions.

## Testing

Use Stripe test cards (100% FREE):

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`

Any future expiry date, any CVC, any ZIP.

## Security

- Never expose secret keys
- Always verify payments server-side
- Use webhook signatures in production
- Keep test/live keys separate

## Costs

- **Development**: FREE (unlimited testing)
- **Production**: 2.9% + $0.30 per transaction

For $9 certification:
- Stripe fee: ~$0.56
- You receive: ~$8.44

## Integration Flow

1. User passes certification exam
2. Frontend calls `/create-checkout-session`
3. User redirected to Stripe Checkout
4. User enters payment info
5. Stripe processes payment
6. User redirected back to success page
7. Frontend calls `/verify` to confirm payment
8. Backend updates payment status to "completed"
9. Certificate ID generated and saved

## Production Deployment

1. Switch to live Stripe keys (pk_live_, sk_live_)
2. Set up webhook endpoint
3. Update success/cancel URLs in .env
4. Test with real card (small amount)
5. Monitor Stripe Dashboard

## Support

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
