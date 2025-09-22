import React, { useState, useEffect } from 'react';
import { mcpMockService } from '../../services/mcpMockService';
import '../styles/mcp/mcp.css';

const tierFromScore = (s) => (s >= 85 ? 'PREMIUM' : s >= 60 ? 'GOOD' : 'BASIC');
const tierClass = (s) => (s >= 85 ? 'tier-premium' : s >= 60 ? 'tier-good' : 'tier-basic');

export default function RecommendationsStrip({ products = [], userId = null, useMockData = false }) {
  const [recommendations, setRecommendations] = useState(products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (useMockData && (!products || products.length === 0)) {
      loadRecommendations();
    } else {
      setRecommendations(products);
    }
  }, [products, useMockData, userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mockRecommendations = await mcpMockService.getRecommendations(userId || '1', 6);
      setRecommendations(mockRecommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mcp-recs">
        <div className="mcp-recs-header">
          <div className="skeleton" style={{ width: '200px', height: '1.5rem' }}></div>
          <div className="skeleton" style={{ width: '80px', height: '1rem' }}></div>
        </div>
        <div className="mcp-recs-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mcp-recs-card">
              <div className="skeleton" style={{ aspectRatio: '4/3' }}></div>
              <div className="mcp-recs-info">
                <div className="skeleton" style={{ width: '60px', height: '1.2rem' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '1rem' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: '50px', height: '1rem' }}></div>
                  <div className="skeleton" style={{ width: '80px', height: '1rem' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mcp-recs">
        <div className="mcp-error" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Unable to load recommendations</p>
          <button className="mcp-btn" onClick={loadRecommendations}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!Array.isArray(recommendations) || recommendations.length === 0) return null;
  
  const top = recommendations.slice(0, 6);

  return (
    <section className="mcp-recs">
      <div className="mcp-recs-header">
        <h3>🌱 Recommended for You</h3>
        <span className="mcp-ai-badge">Powered by AI</span>
      </div>

      <div className="mcp-recs-grid">
        {top.map((p) => {
          const score = typeof p.sustainability_rating === 'number' ? Math.round(p.sustainability_rating) : null;
          const price = Number(p.price || 0);
          const tier = score !== null ? tierFromScore(score) : 'BASIC';
          
          return (
            <div key={p.id} className="mcp-recs-card" onClick={() => (window.location.href = `/Product/${p.id}`)}>
              <div className="mcp-recs-image">
                <img 
                  src={p.image_url || p.images?.[0] || '/fallback-image.jpg'} 
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                {score !== null && (
                  <div className="mcp-score-pill">
                    <span className="mcp-score-number">{score}</span>
                    <span className="mcp-score-unit">/100</span>
                  </div>
                )}
              </div>
              <div className="mcp-recs-info">
                <div className={`mcp-tier-badge ${tierClass(score ?? 0)}`}>
                  {tier === 'PREMIUM' ? '🔥 PREMIUM' : tier === 'GOOD' ? '✨ GOOD' : '⚠ BASIC'}
                </div>
                <h4 className="mcp-recs-name" title={p.name}>{p.name}</h4>
                <div className="mcp-recs-meta">
                  <span className="mcp-recs-price">
                    {price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                  </span>
                  <span className="mcp-recs-reason">
                    {score !== null ? 'Low carbon footprint' : 'Eco-friendly pick'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}