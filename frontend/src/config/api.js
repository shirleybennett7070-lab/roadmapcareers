// API configuration for development and production
// In production, set VITE_API_URL environment variable to your backend URL

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
