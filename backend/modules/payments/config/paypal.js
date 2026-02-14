import dotenv from 'dotenv';

dotenv.config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

const BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

export const isPayPalConfigured = () =>
  !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

/**
 * Get an OAuth 2.0 access token from PayPal
 */
export async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}

export const PAYPAL_CONFIG = {
  baseUrl: BASE_URL,
  currency: 'USD',
  clientId: PAYPAL_CLIENT_ID,
  // Re-use the same success/cancel URLs as Stripe, with a paypal flag
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/certification/result',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/certification',
};
