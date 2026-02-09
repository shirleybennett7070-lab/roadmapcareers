import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

// Cache the pricing data to avoid repeated API calls
let cachedPricing = null;
let fetchPromise = null;

export function usePricing() {
  const [pricing, setPricing] = useState(cachedPricing);
  const [loading, setLoading] = useState(!cachedPricing);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedPricing) {
      setPricing(cachedPricing);
      setLoading(false);
      return;
    }

    // Avoid duplicate fetches
    if (!fetchPromise) {
      fetchPromise = fetch(`${API_URL}/api/payments/config`)
        .then(res => res.json())
        .then(data => {
          cachedPricing = {
            certificationPrice: data.certificationPrice,
          };
          return cachedPricing;
        })
        .catch(err => {
          // Fallback to default if API fails
          console.error('Failed to fetch pricing:', err);
          cachedPricing = { certificationPrice: 1 };
          return cachedPricing;
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    fetchPromise.then(data => {
      setPricing(data);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  return { pricing, loading, error };
}

// Format price for display
export function formatPrice(amount) {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}
