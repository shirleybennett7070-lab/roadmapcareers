import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your secret key (only if key is provided and not placeholder)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isValidKey = stripeKey && stripeKey.startsWith('sk_');

export const stripe = isValidKey 
  ? new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  : null;

// Helper to check if Stripe is configured
export const isStripeConfigured = () => isValidKey;

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  certificationPrice: 100, // $1.00 in cents
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/certification/result',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/certification',
};
