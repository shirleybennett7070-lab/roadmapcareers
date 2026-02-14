import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

// Stripe setup
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isValidKey = stripeKey && stripeKey.startsWith('sk_');
const stripe = isValidKey ? new Stripe(stripeKey, { apiVersion: '2023-10-16' }) : null;

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Pricing config (in cents)
const PRICING = {
  basePrice: 1000,       // $10.00
  discountedPrice: 500,  // $5.00
};

/**
 * POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout session for the background check
 */
app.post('/api/payments/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' });
  }

  try {
    const { firstName, lastName, email, phone, companyName, deliveryEmail, discountApplied } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !companyName || !deliveryEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const unitAmount = discountApplied ? PRICING.discountedPrice : PRICING.basePrice;

    const session = await stripe.checkout.sessions.create({
      // Use automatic_payment_methods instead of payment_method_types: ['card']
      // This lets Stripe dynamically show the best payment methods for each
      // customer's region (UPI in India, iDEAL in NL, cards everywhere, etc.)
      automatic_payment_methods: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Comprehensive Background Check',
              description: `Background verification for ${firstName} ${lastName} — Report delivered to ${companyName}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/personal-info?payment=cancelled`,
      customer_email: email,
      // Collect billing address & phone — gives Stripe more identity signals
      // to distinguish real customers from card testers, reducing fraud blocks
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      // Clear statement descriptor so the charge looks legitimate on bank statements
      payment_intent_data: {
        statement_descriptor: 'VERIFYCANDIDATES',
        description: `Background check for ${firstName} ${lastName}`,
      },
      metadata: {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        deliveryEmail,
        discountApplied: discountApplied ? 'true' : 'false',
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment status
 */
app.post('/api/payments/verify', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      paid: session.payment_status === 'paid',
      email: session.customer_email,
      amount: session.amount_total / 100,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment', message: error.message });
  }
});

/**
 * GET /api/payments/config
 * Return publishable key and pricing for frontend
 */
app.get('/api/payments/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    basePrice: PRICING.basePrice / 100,
    discountedPrice: PRICING.discountedPrice / 100,
  });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  VerifyCandidates API running on http://localhost:${PORT}`);
  console.log(`   Stripe: ${stripe ? '✅ Connected' : '❌ Not configured (add STRIPE_SECRET_KEY to .env)'}\n`);
});
