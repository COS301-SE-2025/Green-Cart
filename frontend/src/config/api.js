/**
 * Centralized API configuration for Green Cart
 * This ensures all frontend components use the correct API URL
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// API URLs
const DEVELOPMENT_API_URL = "http://127.0.0.1:8000";
const PRODUCTION_API_URL = "https://api.greencart-cos301.co.za";

// Use local API for development, production API for production
export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;
export const API_LOCAL_URL = "http://127.0.0.1:8000";

// Helper function to get API URL (kept for compatibility)
export const getApiUrl = () => API_BASE_URL;
export const getLocalApiUrl = () => API_LOCAL_URL;

// Export for backward compatibility
export default API_BASE_URL;
