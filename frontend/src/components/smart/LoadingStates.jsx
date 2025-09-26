import React from 'react';
import '../styles/smart/smart.css';

export const RecommendationsSkeleton = () => (
  <section className="smart-recs">
    <div className="smart-recs-header">
      <div className="skeleton" style={{ width: '200px', height: '1.5rem' }}></div>
      <div className="skeleton" style={{ width: '80px', height: '1rem' }}></div>
    </div>
    <div className="smart-recs-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="smart-recs-card">
          <div className="skeleton" style={{ aspectRatio: '4/3' }}></div>
          <div className="smart-recs-info">
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

export const SustainabilityAISkeleton = () => (
  <section className="smart-ai">
    <div className="smart-ai-header">
      <div className="skeleton" style={{ width: '250px', height: '1.2rem' }}></div>
    </div>
    <div className="smart-qa">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="smart-qa-item">
          <div className="skeleton" style={{ width: '300px', height: '1rem' }}></div>
        </div>
      ))}
    </div>
  </section>
);

// Add skeleton styles to smart.css
export const skeletonStyles = `
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;
