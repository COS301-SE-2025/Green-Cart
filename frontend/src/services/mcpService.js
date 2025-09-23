/**
 * MCP Service Integration with Real Backend API
 * Connects frontend MCP components to the actual recommendation endpoints
 */

const API_BASE_URL = 'https://api.greencart-cos301.co.za'; // Update this to match your backend URL

export const mcpService = {
  // Frontend Q1: How sustainable is this product? (Maps to backend Q2)
  async analyzeSustainability(productId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/q2/${userId}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        question_type: "sustainability_analysis",
        product_id: productId,
        user_id: userId,
        analysis: {
          answer: data.answer,
          sustainability_rating: data.sustainability_rating,
          overall_score: Math.round(data.sustainability_rating),
          eco_level: data.sustainability_rating >= 70 ? "🔥 HIGH Sustainability" : 
                    data.sustainability_rating >= 40 ? "⚡ MODERATE Sustainability" : 
                    "⚠️ LOW Sustainability",
          // For now, we'll generate some mock detailed ratings based on the overall score
          // TODO: Backend could provide breakdown of sustainability components
          detailed_ratings: [
            { id: 1, type: "Carbon Footprint", value: Math.max(0, Math.round(data.sustainability_rating + (Math.random() - 0.5) * 20)) },
            { id: 2, type: "Recyclability", value: Math.max(0, Math.round(data.sustainability_rating + (Math.random() - 0.5) * 20)) },
            { id: 3, type: "Durability", value: Math.max(0, Math.round(data.sustainability_rating + (Math.random() - 0.5) * 20)) },
            { id: 4, type: "Energy Efficiency", value: Math.max(0, Math.round(data.sustainability_rating + (Math.random() - 0.5) * 20)) }
          ]
        }
      };
    } catch (error) {
      console.error('MCP Q2 API Error:', error);
      // Fallback
      return {
        question_type: "sustainability_analysis",
        product_id: productId,
        user_id: userId,
        analysis: {
          answer: "Unable to analyze sustainability at this time.",
          sustainability_rating: 50,
          overall_score: 50,
          eco_level: "⚡ MODERATE Sustainability"
        }
      };
    }
  },

  // Frontend Q2: Find Alternatives (Maps to backend Q3)
  async findAlternatives(productId, userId, limit = 3) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/q3/${userId}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        question_type: "find_alternatives",
        product_id: productId,
        user_id: userId,
        alternatives: {
          products: data.alternatives || [],
          total_found: data.count || 0,
          original_product: data.product_data
        }
      };
    } catch (error) {
      console.error('MCP Q3 API Error:', error);
      // Fallback to empty alternatives
      return {
        question_type: "find_alternatives",
        product_id: productId,
        user_id: userId,
        alternatives: {
          products: [],
          total_found: 0
        }
      };
    }
  },

  // Frontend Q3: EcoMeter Impact (Maps to backend Q4)
  async calculateEcoMeterImpact(productId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/q4/${userId}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse impact from the answer text
      const answerText = data.answer.toLowerCase();
      let impact = "neutral";
      if (answerText.includes("positive")) {
        impact = "positive";
      } else if (answerText.includes("negative")) {
        impact = "negative";
      }
      
      return {
        question_type: "eco_meter_impact",
        product_id: productId,
        user_id: userId,
        eco_meter_analysis: {
          current_rating: data.current_cart_sustainability,
          product_rating: data.product_sustainability,
          impact: impact,
          message: data.answer,
          model_used: data.model_used || "gpt-5-nano"
        }
      };
    } catch (error) {
      console.error('MCP Q4 API Error:', error);
      // Fallback
      return {
        question_type: "eco_meter_impact",
        product_id: productId,
        user_id: userId,
        eco_meter_analysis: {
          current_rating: 50,
          product_rating: 50,
          impact: "neutral",
          message: "Unable to calculate EcoMeter impact at this time."
        }
      };
    }
  },

  // Backend Q1: Why was this product recommended? (Not used in current UI, but available)
  async whyRecommended(productId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/q1/${userId}/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        question_type: "why_recommended",
        product_id: productId,
        user_id: userId,
        analysis: {
          answer: data.answer,
          algorithmic_scores: data.algorithmic_scores
        }
      };
    } catch (error) {
      console.error('MCP Q1 API Error:', error);
      // Fallback to a simple message
      return {
        question_type: "why_recommended",
        product_id: productId,
        user_id: userId,
        analysis: {
          answer: "This product was recommended based on your preferences and sustainability profile.",
          algorithmic_scores: {}
        }
      };
    }
  },

  // Get recommended products for homepage - always returns exactly 6 products
  async getRecommendations(userId, limit = 6) {
    try {
      // Force limit to 6 for consistency
      const response = await fetch(`${API_BASE_URL}/api/recommendations/recommend/${userId}?limit=6`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw MCP API response:', data);
      console.log('Number of recommendations:', data.data?.length || 0);
      
      // Transform MCP recommendations to frontend format
      const recommendations = data.data?.map(item => {
        console.log('Transforming item:', {
          product_id: item.product_id,
          product_data: item.product_data,
          sustainability_rating: item.sustainability_rating,
          image_urls: item.image_urls
        });
        
        // Extract product data from nested structure
        const productData = item.product_data || {};
        const imageUrl = item.image_urls?.[0] || productData.image_urls?.[0] || 'https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product';
        
        const transformed = {
          id: item.product_id,
          name: productData.name || `Product ${item.product_id}`,
          price: productData.price || 0,
          sustainability_rating: Math.round(item.sustainability_rating || 0), // Already 0-100 scale
          image_url: imageUrl,
          brand: productData.brand || 'Unknown Brand',
          images: [imageUrl],
          recommendation_score: item.recommendation_score,
          tier: item.tier,
          reasoning: item.reasoning?.reasoning_factors?.join(', ') || 'Recommended for you'
        };
        
        console.log('Transformed to:', transformed);
        return transformed;
      }) || [];

      console.log('Transformed recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('MCP Recommendations API Error:', error);
      // Fallback to empty array
      return [];
    }
  },

  // Health check for MCP service
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('MCP Health Check Error:', error);
      return { status: 'error', message: 'MCP service unavailable' };
    }
  },

  // AI Health check specifically
  async aiHealthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/ai-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('MCP AI Health Check Error:', error);
      return { status: 'error', message: 'AI service unavailable' };
    }
  }
};

// Configuration helper
export const mcpConfig = {
  // Update this to match your backend URL
  setApiBaseUrl(url) {
    API_BASE_URL = url;
  },
  
  getApiBaseUrl() {
    return API_BASE_URL;
  },
  
  // Default user ID if not logged in
  defaultUserId: 'demo-user-123'
};

export default mcpService;