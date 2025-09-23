/**
 * Centralized API configuration for Green Cart
 * This ensures all frontend components use the hosted API only
 */

// Production API URL - always use the hosted version
export const API_BASE_URL = "http://127.0.0.1:8000";
export const API_LOCAL_URL = "http://127.0.0.1:8000";

// Helper function to get API URL (kept for compatibility)
export const getApiUrl = () => API_BASE_URL;
export const getLocalApiUrl = () => API_LOCAL_URL;

// Export for backward compatibility
export default API_BASE_URL;
