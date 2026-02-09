function getApiUrl() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // TODO: update with production URL
  return 'http://localhost:3001';
}

export const API_URL = import.meta.env.VITE_API_URL || getApiUrl();
