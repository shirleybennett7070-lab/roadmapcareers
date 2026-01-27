import { useState } from 'react';
import { API_URL } from '../config/api';

export default function PaymentButton({ token, examResult, className }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session on backend
      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect directly to Stripe Checkout URL (modern approach)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={className || "bg-gray-800 text-white px-10 py-4 rounded-md font-semibold text-base hover:bg-gray-900 transition-colors shadow-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          'Download Certificate - $9.00'
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
