import express from 'express';
import { 
  createCheckoutSession, 
  verifyPayment, 
  handleWebhook 
} from './services/paymentService.js';
import {
  createPayPalOrder,
  capturePayPalOrder,
} from './services/paypalService.js';
import { isPayPalConfigured } from './config/paypal.js';
import { getExamResultByToken, updatePaymentStatus } from '../certifications/services/certificationsService.js';
import { STRIPE_CONFIG } from './config/stripe.js';

const router = express.Router();

/**
 * POST /api/payments/create-checkout-session
 * Create a Stripe checkout session for certification payment
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    // Verify the exam result exists and user passed
    const examResult = await getExamResultByToken(token);
    
    if (!examResult) {
      return res.status(404).json({ 
        error: 'Exam result not found' 
      });
    }

    if (!examResult.passed) {
      return res.status(400).json({ 
        error: 'Cannot purchase certificate - exam not passed' 
      });
    }

    if (examResult.paymentStatus === 'completed') {
      return res.status(400).json({ 
        error: 'Certificate already purchased' 
      });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      token,
      email: examResult.email,
      fullName: examResult.fullName,
    });

    res.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment and update certification status
 */
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }

    // Verify payment with Stripe
    const verification = await verifyPayment(sessionId);

    if (!verification.paid) {
      return res.status(400).json({ 
        error: 'Payment not completed' 
      });
    }

    // Update payment status in database
    const result = await updatePaymentStatus(verification.token, 'completed');

    res.json({
      success: true,
      paid: true,
      certificateId: result.certificateId,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events (for production)
 * This endpoint receives real-time updates from Stripe
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ 
        error: 'Missing Stripe signature' 
      });
    }

    const event = await handleWebhook(req.body, signature);

    // Handle successful payment
    if (event.type === 'payment_success') {
      await updatePaymentStatus(event.token, 'completed');
      console.log(`✅ Payment completed for token: ${event.token}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ 
      error: 'Webhook error',
      message: error.message 
    });
  }
});

// ─── PayPal Routes ────────────────────────────────────────────────────────────

/**
 * POST /api/payments/paypal/create-order
 * Create a PayPal order (equivalent of Stripe checkout session)
 */
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Same validation as Stripe flow
    const examResult = await getExamResultByToken(token);

    if (!examResult) {
      return res.status(404).json({ error: 'Exam result not found' });
    }
    if (!examResult.passed) {
      return res.status(400).json({ error: 'Cannot purchase certificate - exam not passed' });
    }
    if (examResult.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Certificate already purchased' });
    }

    const order = await createPayPalOrder({
      token,
      email: examResult.email,
      fullName: examResult.fullName,
    });

    res.json(order);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({
      error: 'Failed to create PayPal order',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/paypal/capture-order
 * Capture payment after user approves on PayPal, then update cert status
 */
router.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const capture = await capturePayPalOrder(orderId);

    if (!capture.paid) {
      return res.status(400).json({ error: 'Payment not completed', status: capture.status });
    }

    // Update payment status in database (same as Stripe flow)
    const result = await updatePaymentStatus(capture.token, 'completed');

    console.log(`✅ PayPal payment completed for token: ${capture.token}`);

    res.json({
      success: true,
      paid: true,
      certificateId: result.certificateId,
      message: 'PayPal payment verified successfully',
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({
      error: 'Failed to capture PayPal payment',
      message: error.message,
    });
  }
});

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * GET /api/payments/config
 * Get payment configuration for frontend
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    certificationPrice: STRIPE_CONFIG.certificationPrice / 100, // Convert cents to dollars
    paypalEnabled: isPayPalConfigured(),
  });
});

export default router;
