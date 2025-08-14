/**
 * Centralized API configuration for Green Cart
 * This ensures all frontend components use the hosted API only
 */

// Production API URL - always use the hosted version
export const API_BASE_URL = "https://api.greencart-cos301.co.za";

// Helper function to get API URL (kept for compatibility)
export const getApiUrl = () => API_BASE_URL;

// Export for backward compatibility
export default API_BASE_URL;
