/**
 * Centralized API configuration for Green Cart
 * Uses Vite env var when provided, falls back to sensible defaults.
 */

// Prefer explicitly provided env var
const ENV_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
	? import.meta.env.VITE_API_URL
	: null;

// Detect local dev
const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

// Default URLs
const DEFAULT_LOCAL_API = 'http://localhost:8000';
const DEFAULT_PROD_API = 'https://api.greencart-cos301.co.za';

export const API_BASE_URL = ENV_URL || (isLocalHost ? DEFAULT_LOCAL_API : DEFAULT_PROD_API);

export const getApiUrl = () => API_BASE_URL;

export default API_BASE_URL;
