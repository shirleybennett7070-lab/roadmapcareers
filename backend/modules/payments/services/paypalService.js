import { getAccessToken, PAYPAL_CONFIG, isPayPalConfigured } from '../config/paypal.js';
import { STRIPE_CONFIG } from '../config/stripe.js';

/**
 * Create a PayPal order (equivalent of Stripe checkout session)
 * @param {Object} params
 * @param {string} params.token - Exam result token
 * @param {string} params.email - User's email
 * @param {string} params.fullName - User's full name
 * @returns {Object} - { orderId, approvalUrl }
 */
export async function createPayPalOrder({ token, email, fullName }) {
  if (!isPayPalConfigured()) {
    throw new Error('PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env');
  }

  const accessToken = await getAccessToken();

  // Price in dollars (STRIPE_CONFIG.certificationPrice is in cents)
  const basePrice = (STRIPE_CONFIG.certificationPrice / 100);
  const taxAmount = (basePrice * STRIPE_CONFIG.taxRate);
  const totalPrice = (basePrice + taxAmount).toFixed(2);

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: token,
        description: `Remote Work Professional Certification for ${fullName}`,
        custom_id: token, // stored on PayPal side, returned in capture
        amount: {
          currency_code: PAYPAL_CONFIG.currency,
          value: totalPrice,
          breakdown: {
            item_total: { currency_code: PAYPAL_CONFIG.currency, value: basePrice.toFixed(2) },
            tax_total: { currency_code: PAYPAL_CONFIG.currency, value: taxAmount.toFixed(2) },
          },
        },
        items: [
          {
            name: 'Remote Work Professional Certification',
            description: 'Official digital certificate with lifetime validity',
            unit_amount: { currency_code: PAYPAL_CONFIG.currency, value: basePrice.toFixed(2) },
            quantity: '1',
            category: 'DIGITAL_GOODS',
            tax: { currency_code: PAYPAL_CONFIG.currency, value: taxAmount.toFixed(2) },
          },
        ],
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: 'RoadmapCareers',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${PAYPAL_CONFIG.successUrl}/${token}?payment=success&provider=paypal`,
          cancel_url: `${PAYPAL_CONFIG.successUrl}/${token}?payment=cancelled`,
        },
      },
    },
  };

  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('PayPal create order error:', err);
    throw new Error('Failed to create PayPal order');
  }

  const order = await response.json();

  // Find the approval link (where we redirect the user)
  const approvalLink = order.links?.find(l => l.rel === 'payer-action')?.href;

  if (!approvalLink) {
    throw new Error('No PayPal approval URL received');
  }

  return {
    success: true,
    orderId: order.id,
    url: approvalLink,
  };
}

/**
 * Capture a PayPal order after the user has approved it
 * @param {string} orderId - PayPal order ID
 * @returns {Object} - Capture result with token
 */
export async function capturePayPalOrder(orderId) {
  if (!isPayPalConfigured()) {
    throw new Error('PayPal is not configured.');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('PayPal capture error:', err);
    throw new Error('Failed to capture PayPal payment');
  }

  const capture = await response.json();
  const captureStatus = capture.status; // 'COMPLETED', 'DECLINED', etc.
  const purchaseUnit = capture.purchase_units?.[0];
  const token = purchaseUnit?.payments?.captures?.[0]?.custom_id
    || purchaseUnit?.reference_id;

  return {
    success: captureStatus === 'COMPLETED',
    paid: captureStatus === 'COMPLETED',
    status: captureStatus,
    orderId: capture.id,
    token,
    email: capture.payer?.email_address,
  };
}

/**
 * Verify a PayPal order (check status without capturing)
 * @param {string} orderId - PayPal order ID
 * @returns {Object} - Order details
 */
export async function verifyPayPalOrder(orderId) {
  if (!isPayPalConfigured()) {
    throw new Error('PayPal is not configured.');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('PayPal verify error:', err);
    throw new Error('Failed to verify PayPal order');
  }

  const order = await response.json();
  const purchaseUnit = order.purchase_units?.[0];

  return {
    success: true,
    paid: order.status === 'COMPLETED',
    status: order.status,
    orderId: order.id,
    token: purchaseUnit?.reference_id || purchaseUnit?.custom_id,
    email: order.payer?.email_address,
  };
}
