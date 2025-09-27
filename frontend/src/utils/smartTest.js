/**
 * Test file to verify Smart backend integration
 * Run this in browser console to test API connectivity
 */

import { smartService } from '../services/smartService.js';

// Test functions for the Smart integration
window.testSmart = {
  async testHealth() {
    console.log('Testing Smart Health...');
    try {
      const health = await smartService.healthCheck();
      console.log('✅ Smart Health:', health);
      
      const aiHealth = await smartService.aiHealthCheck();
      console.log('✅ AI Health:', aiHealth);
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  },

  async testRecommendations(userId = 'test-user-123') {
    console.log('Testing Recommendations...');
    try {
      const recommendations = await smartService.getRecommendations(userId, 5);
      console.log('✅ Recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('❌ Recommendations failed:', error);
    }
  },

  async testQ1(productId = 17, userId = 'test-user-123') {
    console.log('Testing Q1 - Why Recommended...');
    try {
      const result = await smartService.whyRecommended(productId, userId);
      console.log('✅ Q1 Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Q1 failed:', error);
    }
  },

  async testQ2(productId = 17, userId = 'test-user-123') {
    console.log('Testing Q2 - Sustainability Analysis...');
    try {
      const result = await smartService.analyzeSustainability(productId, userId);
      console.log('✅ Q2 Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Q2 failed:', error);
    }
  },

  async testQ3(productId = 17, userId = 'test-user-123') {
    console.log('Testing Q3 - Find Alternatives...');
    try {
      const result = await smartService.findAlternatives(productId, userId);
      console.log('✅ Q3 Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Q3 failed:', error);
    }
  },

  async testQ4(productId = 17, userId = 'test-user-123') {
    console.log('Testing Q4 - EcoMeter Impact...');
    try {
      const result = await smartService.calculateEcoMeterImpact(productId, userId);
      console.log('✅ Q4 Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Q4 failed:', error);
    }
  },

  async testAll(productId = 17, userId = 'test-user-123') {
    console.log('Running all Smart tests...');
    await this.testHealth();
    await this.testRecommendations(userId);
    await this.testQ1(productId, userId);
    await this.testQ2(productId, userId);
    await this.testQ3(productId, userId);
    await this.testQ4(productId, userId);
    console.log('🎉 All tests completed!');
  }
};

// Instructions for testing
console.log(`
🚀 Smart Integration Test Suite Ready!

Usage in browser console:
- testSmart.testHealth()          // Test service health
- testSmart.testRecommendations() // Test recommendations endpoint
- testSmart.testQ1(17)           // Test Q1 with product ID 17
- testSmart.testQ2(17)           // Test Q2 with product ID 17
- testSmart.testQ3(17)           // Test Q3 with product ID 17
- testSmart.testQ4(17)           // Test Q4 with product ID 17
- testSmart.testAll(17)          // Run all tests

Make sure your backend is running on http://127.0.0.1:8000
`);

export default window.testSmart;
