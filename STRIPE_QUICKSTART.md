# 🚀 Quick Start - Stripe Payment Testing

## Setup (5 minutes)

1. **Get Stripe Keys** (FREE account):
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your **test** keys (pk_test_ and sk_test_)

2. **Add to .env file**:
   ```bash
   cd backend
   nano .env  # or open in your editor
   ```
   
   Add these lines:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ```

3. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Test Payment (FREE - No Real Money!)

1. Open: http://localhost:5173/certification
2. Fill form and complete exam (pass with 12+ correct)
3. Click "Get Your Certificate Now - $9"
4. Use this test card:
   ```
   Card:     4242 4242 4242 4242
   Expiry:   12/25 (any future date)
   CVC:      123 (any 3 digits)
   ZIP:      12345 (any 5 digits)
   ```
5. Complete payment
6. See success message!

## More Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Declined | 4000 0000 0000 0002 |
| 3D Secure | 4000 0025 0000 3155 |

## Costs

- **Testing**: FREE (unlimited)
- **Production**: 2.9% + $0.30 per sale
  - You pay ~$0.56 per $9 sale
  - You keep ~$8.44

## Troubleshooting

**"Stripe key not found"**
→ Add keys to `.env` and restart backend

**Payment button doesn't work**
→ Check browser console, verify backend is running

**Need help?**
→ Check `STRIPE_SETUP_GUIDE.md` for full details

---

✅ **Remember**: Test mode is 100% free - test as much as you want!
