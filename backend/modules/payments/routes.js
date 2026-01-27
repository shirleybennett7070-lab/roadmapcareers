import express from 'express';
import { 
  createCheckoutSession, 
  verifyPayment, 
  handleWebhook 
} from './services/paymentService.js';
import { getExamResultByToken, updatePaymentStatus } from '../certifications/services/certificationsService.js';

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

/**
 * GET /api/payments/config
 * Get Stripe publishable key for frontend
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

export default router;
