import { stripe, STRIPE_CONFIG, isStripeConfigured } from '../config/stripe.js';

/**
 * Create a Stripe Checkout Session for certification payment
 * @param {Object} params - Payment parameters
 * @param {string} params.token - Unique token for the exam result
 * @param {string} params.email - User's email
 * @param {string} params.fullName - User's full name
 * @returns {Object} - Checkout session with URL
 */
export async function createCheckoutSession({ token, email, fullName }) {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Please add your Stripe API keys to .env file.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: 'Remote Work Professional Certification',
              description: 'Official digital certificate with lifetime validity',
              images: ['https://your-logo-url.com/certificate.png'], // Optional: add your logo
            },
            unit_amount: STRIPE_CONFIG.certificationPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}/${token}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${STRIPE_CONFIG.successUrl}/${token}?payment=cancelled`,
      customer_email: email,
      metadata: {
        token,
        fullName,
        productType: 'certification',
      },
      // Enable automatic tax calculation (optional)
      // automatic_tax: { enabled: true },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Verify payment status from Stripe
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Object} - Payment verification result
 */
export async function verifyPayment(sessionId) {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Please add your Stripe API keys to .env file.');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      success: true,
      paid: session.payment_status === 'paid',
      token: session.metadata.token,
      email: session.customer_email,
      amount: session.amount_total / 100, // Convert from cents to dollars
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
}

/**
 * Handle Stripe webhook events (for production use)
 * @param {string} rawBody - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} - Processed event
 */
export async function handleWebhook(rawBody, signature) {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Please add your Stripe API keys to .env file.');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        return {
          success: true,
          type: 'payment_success',
          token: session.metadata.token,
          email: session.customer_email,
        };

      case 'payment_intent.payment_failed':
        return {
          success: false,
          type: 'payment_failed',
        };

      default:
        return {
          success: true,
          type: 'unhandled_event',
          eventType: event.type,
        };
    }
  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Webhook signature verification failed');
  }
}

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Object} - Refund result
 */
export async function createRefund(paymentIntentId) {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Please add your Stripe API keys to .env file.');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}
