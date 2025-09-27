/**
 * Mock service for Smart data - makes it easy for backend integration
 * Replace these functions with real API calls when backend is ready
 */

export const SmartMockService = {
  // Question 1: Sustainability Analysis
  async analyzeSustainability(productId, userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      question_type: "sustainability_analysis",
      product_id: productId,
      user_id: userId,
      analysis: {
        overall_score: Math.floor(Math.random() * 40) + 60, // 60-100
        eco_level: "🔥 PREMIUM Sustainability Rating",
        detailed_ratings: [
          { id: 1, type: "Carbon Footprint", value: Math.floor(Math.random() * 30) + 70 },
          { id: 2, type: "Recyclability", value: Math.floor(Math.random() * 30) + 70 },
          { id: 3, type: "Durability", value: Math.floor(Math.random() * 30) + 60 },
          { id: 4, type: "Energy Efficiency", value: Math.floor(Math.random() * 25) + 75 }
        ]
      }
    };
  },

  // Question 2: Find Alternatives
  async findAlternatives(productId, userId, limit = 5) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const alternatives = [];
    for (let i = 1; i <= limit; i++) {
      alternatives.push({
        id: productId + i,
        name: `Eco Alternative Product ${i}`,
        price: Math.floor(Math.random() * 200) + 50,
        sustainability_rating: Math.floor(Math.random() * 30) + 70,
        image_url: `https://picsum.photos/200/150?random=${productId + i}`,
        brand: `EcoFriendly Brand ${i}`
      });
    }

    return {
      question_type: "find_alternatives",
      product_id: productId,
      user_id: userId,
      alternatives: {
        products: alternatives,
        total_found: alternatives.length
      }
    };
  },

  // Question 3: Eco-Meter Impact
  async calculateEcoMeterImpact(productId, userId) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const currentRating = Math.floor(Math.random() * 40) + 50; // 50-90
    const productRating = Math.floor(Math.random() * 40) + 60; // 60-100
    const willImprove = productRating > currentRating;
    
    return {
      question_type: "eco_meter_impact",
      product_id: productId,
      user_id: userId,
      eco_meter_analysis: {
        current_rating: currentRating,
        product_rating: productRating,
        will_improve_ecometer: willImprove,
        impact: willImprove ? "positive" : "neutral",
        message: willImprove 
          ? `✅ Great choice! This product has a ${productRating}/100 sustainability rating and will boost your eco-meter score. It's an eco-friendly option for your cart.`
          : `➖ This product has a ${productRating}/100 sustainability rating, similar to your current average. It won't significantly impact your eco-meter.`
      }
    };
  },

  // Get recommended products for homepage
  async getRecommendations(userId, limit = 6) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const recommendations = [];
    for (let i = 1; i <= limit; i++) {
      recommendations.push({
        id: 1000 + i,
        name: `Sustainable Product ${i}`,
        price: Math.floor(Math.random() * 300) + 100,
        sustainability_rating: Math.floor(Math.random() * 40) + 60,
        image_url: `https://picsum.photos/300/200?random=${1000 + i}`,
        brand: `Green Brand ${i}`,
        images: [`https://picsum.photos/300/200?random=${1000 + i}`]
      });
    }

    return recommendations;
  }
};

// Easy integration helper - replace with real API calls
export const integrateSmartAPI = {
  // Backend team can replace these URLs with real endpoints
  endpoints: {
    sustainability: '/api/Smart/question/1/{productId}/{userId}',
    alternatives: '/api/Smart/question/2/{productId}/{userId}',
    ecoMeter: '/api/Smart/question/3/{productId}/{userId}',
    recommendations: '/api/Smart/recommendations/{userId}'
  },

  // Helper to make API calls when backend is ready
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Smart API Error:', error);
      throw error;
    }
  }
};
