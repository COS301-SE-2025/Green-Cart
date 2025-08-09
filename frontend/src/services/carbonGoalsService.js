// Carbon Goals API Service
import { API_BASE_URL } from '../config/api.js';

class CarbonGoalsService {
  /**
   * Get all carbon goals for a user
   */
  async getUserCarbonGoals(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-goals/${userId}`, {
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
      console.error('Error fetching carbon goals:', error);
      throw error;
    }
  }

  /**
   * Set or update a carbon goal for a specific month
   */
  async setCarbonGoal(userId, month, goalValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-goals/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          month: month,
          goal_value: goalValue
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting carbon goal:', error);
      throw error;
    }
  }

  /**
   * Update a carbon goal (for chart drag interactions)
   */
  async updateCarbonGoal(userId, month, goalValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-goals/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          month: month,
          goal_value: goalValue
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating carbon goal:', error);
      throw error;
    }
  }

  /**
   * Get carbon goal for a specific month
   */
  async getCarbonGoal(userId, month) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-goals/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          month: month
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching carbon goal:', error);
      throw error;
    }
  }

  /**
   * Get complete carbon footprint data for user
   */
  async getUserCarbonData(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carbon-data`, {
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
      
      const result = await response.json();
      return result.data; // Return just the data part
    } catch (error) {
      console.error('Error fetching carbon data:', error);
      throw error;
    }
  }

  /**
   * Convert month number to month name
   */
  getMonthName(monthNumber) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || 'Invalid';
  }

  /**
   * Get current month number
   */
  getCurrentMonth() {
    return new Date().getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  }
}

export default new CarbonGoalsService();
