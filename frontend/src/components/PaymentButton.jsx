import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { usePricing, formatPrice } from '../hooks/usePricing';

export default function PaymentButton({ token, examResult, className }) {
  const [loading, setLoading] = useState(null); // null | 'stripe' | 'paypal'
  const [error, setError] = useState(null);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const { pricing } = usePricing();
  const price = pricing?.certificationPrice ?? 1;

  // Check if PayPal is available
  useEffect(() => {
    fetch(`${API_URL}/api/payments/config`)
      .then(res => res.json())
      .then(data => {
        if (data.paypalEnabled) setPaypalEnabled(true);
      })
      .catch(() => {}); // silently ignore – PayPal just won't show
  }, []);

  const handleStripePayment = async () => {
    try {
      setLoading('stripe');
      setError(null);

      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(null);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setLoading('paypal');
      setError(null);

      const response = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No PayPal approval URL received');
      }
    } catch (err) {
      console.error('PayPal payment error:', err);
      setError(err.message || 'PayPal payment failed. Please try again.');
      setLoading(null);
    }
  };

  const isDisabled = loading !== null;

  return (
    <div className="text-center">
      {/* Primary: PayPal button (shown first if configured) */}
      {paypalEnabled && (
        <button
          onClick={handlePayPalPayment}
          disabled={isDisabled}
          className="bg-[#0070ba] hover:bg-[#005ea6] text-white px-10 py-4 rounded-md font-semibold text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-sm mx-auto flex items-center justify-center"
        >
          {loading === 'paypal' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting to PayPal...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z"/>
                <path d="M18.171 7.394c-.004.025-.01.052-.015.078-.93 4.778-4.005 7.201-9.195 7.201h-1.2L6.596 21.5a.472.472 0 0 0 .466.548h3.273c.494 0 .914-.357.992-.844l.04-.208.788-5.001.05-.275a1.002 1.002 0 0 1 .992-.844h.625c4.043 0 7.205-1.642 8.13-6.393.386-1.983.186-3.639-.834-4.803a3.95 3.95 0 0 0-1.135-.896c.08.382.12.777.12 1.184 0 .157-.005.315-.015.474l.083-.048z" opacity=".7"/>
              </svg>
              {`Download Certificate - ${formatPrice(price)}`}
            </span>
          )}
        </button>
      )}

      {/* Divider between PayPal and Stripe */}
      {paypalEnabled && (
        <div className="flex items-center gap-3 my-3 max-w-sm mx-auto">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wide">or pay with card</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      )}

      {/* Secondary: Stripe (Card) button */}
      <button
        onClick={handleStripePayment}
        disabled={isDisabled}
        className={paypalEnabled
          ? "bg-white text-gray-700 border border-gray-300 px-10 py-4 rounded-md font-semibold text-base hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-sm mx-auto flex items-center justify-center"
          : (className || "bg-gray-800 text-white px-10 py-4 rounded-md font-semibold text-base hover:bg-gray-900 transition-colors shadow-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-sm mx-auto")
        }
      >
        {loading === 'stripe' ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting to Checkout...
          </span>
        ) : paypalEnabled ? (
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Pay with Card
          </span>
        ) : (
          `Download Certificate - ${formatPrice(price)}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
        The fee helps cover the costs of operating and maintaining the platform, including assessment testing and delivery, certificate issuance, and verification services.
      </p>
    </div>
  );
}
