import React, { useState, useEffect } from 'react';
import { mcpService } from '../../services/mcpService';
import WhyRecommendedModal from './WhyRecommendedModal';
import '../styles/mcp/mcp.css';

const tierFromScore = (s) => (s >= 85 ? 'PREMIUM' : s >= 60 ? 'GOOD' : 'BASIC');
const tierClass = (s) => (s >= 85 ? 'tier-premium' : s >= 60 ? 'tier-good' : 'tier-basic');

export default function RecommendationsStrip({ products = [], userId = null, useMockData = false, useApiRecommendations = true }) {
  console.log('RecommendationsStrip render with props:', { products, userId, useMockData, useApiRecommendations });
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExplanation, setModalExplanation] = useState('');
  const [modalProductName, setModalProductName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Simple useEffect that only runs once or when userId changes
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      console.log('Loading recommendations...');
      setLoading(true);
      setError(null);
      
      try {
        if (useApiRecommendations && userId) {
          console.log('Fetching API recommendations for user:', userId);
          const fallbackUserId = userId || 'e1ca2b93-314f-4a71-b6fb-3bb430157b1f';
          const result = await mcpService.getRecommendations(fallbackUserId, 6);
          
          if (isMounted) {
            if (Array.isArray(result) && result.length > 0) {
              console.log('Setting recommendations:', result.length, 'products received');
              setRecommendations(result);
            } else {
              console.log('No recommendations received');
              setRecommendations([]);
            }
          }
        } else if (products && products.length > 0) {
          console.log('Using provided products:', products);
          if (isMounted) {
            setRecommendations(products);
          }
        } else {
          console.log('No data source available');
          if (isMounted) {
            setRecommendations([]);
          }
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
        if (isMounted) {
          setError('Failed to load recommendations');
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [userId]); // Only depend on userId

  console.log('Component state:', { loading, error, recommendations: recommendations?.length, modalOpen });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <section className="mcp-recs">
        <div className="mcp-recs-header">
          <h3>🌱 Recommended for You</h3>
          <span className="mcp-ai-badge">Powered by AI</span>
        </div>
        
        {/* AI Loading Animation */}
        <div className="mcp-ai-loading">
          <div className="mcp-ai-loading-content">
            <div className="mcp-ai-spinner">
              <div className="mcp-ai-spinner-ring"></div>
              <div className="mcp-ai-spinner-ring"></div>
              <div className="mcp-ai-spinner-ring"></div>
            </div>
            <div className="mcp-ai-loading-text">
              <span className="mcp-ai-loading-main">Generating your AI Powered Recommendations</span>
              <div className="mcp-ai-loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton cards for preview */}
        <div className="mcp-recs-grid mcp-recs-grid-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mcp-recs-card mcp-recs-card-skeleton">
              <div className="skeleton skeleton-image" style={{ aspectRatio: '4/3' }}></div>
              <div className="mcp-recs-info">
                <div className="skeleton skeleton-badge" style={{ width: '60px', height: '1.2rem' }}></div>
                <div className="skeleton skeleton-title" style={{ width: '100%', height: '1rem' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton skeleton-price" style={{ width: '50px', height: '1rem' }}></div>
                  <div className="skeleton skeleton-reason" style={{ width: '80px', height: '1rem' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <section className="mcp-recs">
        <div className="mcp-error" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Unable to load recommendations: {error}</p>
          <button 
            className="mcp-btn" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </section>
    );
  }

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    console.log('Rendering empty state');
    return (
      <section className="mcp-recs">
        <div className="mcp-recs-header">
          <h3>🌱 Recommended for You</h3>
          <span className="mcp-ai-badge">Powered by AI</span>
        </div>
        <div className="mcp-recs-grid">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666', gridColumn: '1 / -1' }}>
            <p>No personalized recommendations available right now.</p>
            <p style={{ fontSize: '0.9em', marginTop: '0.5rem' }}>
              Browse our products to help us learn your preferences!
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  console.log('Rendering recommendations:', recommendations.length);
  
  const top = recommendations.slice(0, 6);

  const handleWhyRecommended = async (productId, productName, event) => {
    // Prevent card click when clicking question mark
    event.stopPropagation();
    
    setModalProductName(productName);
    setModalOpen(true);
    setModalLoading(true);
    setModalExplanation('');
    
    try {
      const fallbackUserId = userId || 'e1ca2b93-314f-4a71-b6fb-3bb430157b1f';
      console.log('Getting explanation for product:', productId, 'user:', fallbackUserId);
      
      const result = await mcpService.whyRecommended(productId, fallbackUserId);
      setModalExplanation(result.analysis?.answer || 'This product was recommended based on your preferences and sustainability profile.');
    } catch (error) {
      console.error('Error getting recommendation explanation:', error);
      setModalExplanation('Unable to get explanation at this time. This product was recommended based on your preferences and sustainability profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalExplanation('');
    setModalProductName('');
    setModalLoading(false);
  };

  return (
    <>
      {modalOpen && (
        <WhyRecommendedModal 
          isOpen={modalOpen}
          onClose={closeModal}
          explanation={modalExplanation}
          productName={modalProductName}
          isLoading={modalLoading}
        />
      )}
      
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
                
                {/* Why Recommended Question Mark */}
                <button 
                  className="why-recommended-btn"
                  onClick={(e) => handleWhyRecommended(p.id, p.name, e)}
                  title="Why was this recommended?"
                  aria-label="Why was this recommended?"
                >
                  ?
                </button>
                
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
    </>
  );
}