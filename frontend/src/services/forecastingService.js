// Carbon Forecasting API Service
import { API_BASE_URL } from '../config/api.js';

class ForecastingService {
  /**
   * Generate a carbon forecast for a user (fixed 30-day horizon)
   */
  async generateForecast(userId, horizonDays = 30, algorithm = 'ensemble') {
    // Always use 30 days as per requirements
    horizonDays = 30;
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/generate-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          horizon_days: horizonDays,
          algorithm: algorithm
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  /**
   * Get user carbon insights
   */
  async getUserInsights(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/user-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user insights:', error);
      throw error;
    }
  }

  /**
   * Get quick forecast for a user
   */
  async getQuickForecast(userId, days = 30) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/quick-forecast/${userId}?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching quick forecast:', error);
      throw error;
    }
  }

  /**
   * Get user carbon score
   */
  async getUserScore(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/user-score/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user score:', error);
      throw error;
    }
  }

  /**
   * Update forecast accuracy
   */
  async updateForecastAccuracy(forecastId, actualSustainabilityScore) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/update-accuracy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forecast_id: forecastId,
          actual_sustainability_score: actualSustainabilityScore
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating forecast accuracy:', error);
      throw error;
    }
  }

  /**
   * Check health of forecasting service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-forecasting/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking forecasting service health:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const forecastingService = new ForecastingService();

export default forecastingService;