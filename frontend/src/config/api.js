// API configuration - auto-detects environment based on hostname
function getApiUrl() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Dev environment (GitHub Pages or Netlify)
  if (hostname.includes('.github.io') || hostname.includes('-dev.netlify.app') || hostname.includes('roadmapcareers-dev')) {
    return 'https://roadmapcareers-development.up.railway.app';
  }
  
  // Production (custom domain or default)
  return 'https://roadmapcareers-production.up.railway.app';
}

export const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

export const api = {
  // Helper function for API calls
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  }
};
