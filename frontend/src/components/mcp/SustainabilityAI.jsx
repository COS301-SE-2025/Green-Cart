import React, { useState, useMemo } from 'react';
import { mcpService } from '../../services/mcpService';
import '../styles/mcp/mcp.css';

const getColor = (v) => (v >= 80 ? '#22C55E' : v >= 60 ? '#F59E0B' : v >= 40 ? '#F97316' : '#EF4444');
const gaugeWidth = (v) => `${Math.max(0, Math.min(100, Math.round(v)))}%`;

export default function SustainabilityAI({ 
  product, 
  sustainability, 
  alternatives = [], 
  onAddToCart, 
  currentEcoMeter = 65,
  userId = null 
}) {
  const [open, setOpen] = useState({ q1: false, q2: false, q3: false });
  const [loading, setLoading] = useState({ q1: false, q2: false, q3: false });
  const [data, setData] = useState({ q1: null, q2: null, q3: null });
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  
  const score = typeof sustainability?.rating === 'number' ? Math.round(sustainability.rating) : null;
  const stats = Array.isArray(sustainability?.statistics) ? sustainability.statistics : [];

  const tierText = useMemo(() => {
    if (score === null) return 'No rating available';
    if (score >= 85) return '🔥 PREMIUM Sustainability Rating';
    if (score >= 60) return '✨ GOOD Sustainability Rating';
    return '⚠ BASIC Sustainability Rating';
  }, [score]);

  // Handle question clicks with loading states
  const handleQuestionClick = async (questionNum) => {
    const questionKey = `q${questionNum}`;
    
    if (open[questionKey] && data[questionKey]) {
      // Just toggle if already loaded
      setOpen(prev => ({ ...prev, [questionKey]: !prev[questionKey] }));
      return;
    }

    // Show loading and fetch data
    setLoading(prev => ({ ...prev, [questionKey]: true }));
    setOpen(prev => ({ ...prev, [questionKey]: true }));

    try {
      let result;
      const productId = product?.id || 1;
      const currentUserId = userId || '1';

      switch (questionNum) {
        case 1:
          result = await mcpService.analyzeSustainability(productId, currentUserId);
          break;
        case 2:
          result = await mcpService.findAlternatives(productId, currentUserId);
          break;
        case 3:
          result = await mcpService.calculateEcoMeterImpact(productId, currentUserId);
          break;
        default:
          throw new Error('Invalid question number');
      }

      setData(prev => ({ ...prev, [questionKey]: result }));
    } catch (error) {
      console.error(`Error loading question ${questionNum}:`, error);
      setData(prev => ({ ...prev, [questionKey]: { error: 'Failed to load data' } }));
    } finally {
      setLoading(prev => ({ ...prev, [questionKey]: false }));
    }
  };

  return (
    <section className="mcp-ai">
      <div className="mcp-ai-header">🤔 Ask Our Sustainability AI</div>

      <div className="mcp-qa">
        {/* Question 1: Sustainability Analysis */}
        <button className="mcp-qa-item" onClick={() => handleQuestionClick(1)}>
          [1] 📊 How sustainable is this product?
        </button>
        {open.q1 && (
          <div className="mcp-card">
            <div className="mcp-card-title">📊 Sustainability Analysis</div>
            
            {loading.q1 ? (
              <div className="mcp-loading">
                <div className="skeleton" style={{ height: '20px', marginBottom: '10px' }}></div>
                <div className="skeleton" style={{ height: '40px', marginBottom: '10px' }}></div>
                <div className="skeleton" style={{ height: '60px' }}></div>
              </div>
            ) : data.q1?.error ? (
              <div className="mcp-error">Failed to load sustainability analysis</div>
            ) : data.q1 ? (
              <>
                <div className="mcp-score-row">
                  <div className="mcp-score-label">Overall Score</div>
                  <div className="mcp-score-bar">
                    <div className="mcp-score-fill" style={{ 
                      width: gaugeWidth(data.q1.analysis.overall_score), 
                      background: getColor(data.q1.analysis.overall_score) 
                    }} />
                  </div>
                  <div className="mcp-score-value">{data.q1.analysis.overall_score}/100</div>
                </div>
                
                <div className="mcp-tier-text" style={{ color: getColor(data.q1.analysis.overall_score) }}>
                  {data.q1.analysis.eco_level}
                </div>

                {data.q1.analysis.detailed_ratings && (
                  <div className="mcp-stat-grid">
                    {data.q1.analysis.detailed_ratings.map((rating) => (
                      <div key={rating.id} className="mcp-stat-row">
                        <span className="mcp-stat-label">{rating.type}</span>
                        <div className="mcp-stat-bar">
                          <div className="mcp-stat-fill" style={{ 
                            width: gaugeWidth(rating.value), 
                            background: getColor(rating.value) 
                          }} />
                        </div>
                        <span className="mcp-stat-val">{rating.value}/100</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Text Analysis */}
                {data.q1.analysis.answer && (
                  <div className="mcp-ai-text">
                    <div className="mcp-ai-text-label">🤖 AI Analysis:</div>
                    <div className="mcp-ai-text-content">{data.q1.analysis.answer}</div>
                  </div>
                )}

                <div className="mcp-actions">
                  <button 
                    className="mcp-btn ghost" 
                    onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  >
                    {showDetailedBreakdown ? 'Hide Detailed Breakdown' : 'View Detailed Breakdown'}
                  </button>
                  <button className="mcp-btn ghost">Eco Certifications</button>
                </div>

                {/* Detailed Breakdown */}
                {showDetailedBreakdown && data.q1.analysis.answer && (
                  <div className="mcp-detailed-breakdown">
                    <div className="mcp-breakdown-title">📋 Detailed Sustainability Breakdown</div>
                    <div className="mcp-breakdown-content">
                      <p><strong>Full Analysis:</strong></p>
                      <p>{data.q1.analysis.answer}</p>
                      
                      <div className="mcp-breakdown-tips">
                        <p><strong>💡 Sustainability Tips:</strong></p>
                        <ul>
                          <li>Look for products with scores above 70/100 for optimal sustainability</li>
                          <li>Consider the full lifecycle impact, not just immediate benefits</li>
                          <li>Check for eco-certifications and sustainable materials</li>
                          <li>Compare alternatives to find the best environmental choice</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Fallback to existing sustainability data
              <>
                <div className="mcp-score-row">
                  <div className="mcp-score-label">Overall Score</div>
                  <div className="mcp-score-bar">
                    <div className="mcp-score-fill" style={{ width: gaugeWidth(score || 0), background: getColor(score || 0) }} />
                  </div>
                  <div className="mcp-score-value">{score !== null ? `${score}/100` : 'N/A'}</div>
                </div>
                <div className="mcp-tier-text" style={{ color: getColor(score || 0) }}>{tierText}</div>

                {stats.length > 0 && (
                  <div className="mcp-stat-grid">
                    {stats.map((s) => (
                      <div key={s.id} className="mcp-stat-row">
                        <span className="mcp-stat-label">{s.type}</span>
                        <div className="mcp-stat-bar">
                          <div className="mcp-stat-fill" style={{ width: gaugeWidth(s.value), background: getColor(s.value) }} />
                        </div>
                        <span className="mcp-stat-val">{Math.round(s.value)}/100</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Question 2: Alternatives */}
        <button className="mcp-qa-item" onClick={() => handleQuestionClick(2)}>
          [2] 🔍 Show me better alternatives
        </button>
        {open.q2 && (
          <div className="mcp-card">
            <div className="mcp-card-title">🔍 Sustainable Alternatives</div>
            
            {loading.q2 ? (
              <div className="mcp-loading">
                <div className="mcp-alt-strip">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="mcp-alt-card">
                      <div className="skeleton" style={{ aspectRatio: '4/3' }}></div>
                      <div style={{ padding: '10px' }}>
                        <div className="skeleton" style={{ height: '15px', marginBottom: '5px' }}></div>
                        <div className="skeleton" style={{ height: '12px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : data.q2?.error ? (
              <div className="mcp-error">Failed to load alternatives</div>
            ) : data.q2?.alternatives?.products ? (
              <>
                <div className="mcp-alt-strip">
                  {data.q2.alternatives.products.map((alt) => (
                    <div key={alt.id} className="mcp-alt-card" onClick={() => (window.location.href = `/Product/${alt.id}`)}>
                      <div className="mcp-alt-img">
                        <img src={alt.image_url} alt={alt.name} />
                        <div className="mcp-alt-score" style={{ 
                          borderColor: getColor(alt.sustainability_rating), 
                          color: getColor(alt.sustainability_rating) 
                        }}>
                          {alt.sustainability_rating}
                        </div>
                      </div>
                      <div className="mcp-alt-info">
                        <div className="mcp-alt-name" title={alt.name}>{alt.name}</div>
                        <div className="mcp-alt-price">
                          {Number(alt.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mcp-actions">
                  <button className="mcp-btn ghost">View All Alternatives</button>
                </div>
              </>
            ) : (
              <div className="mcp-empty">
                No alternatives available at the moment. We're constantly adding new sustainable products!
              </div>
            )}
          </div>
        )}

        {/* Question 3: Eco-Meter Impact */}
        <button className="mcp-qa-item" onClick={() => handleQuestionClick(3)}>
          [3] 📈 How will this improve my eco-meter?
        </button>
        {open.q3 && (
          <div className="mcp-card">
            <div className="mcp-card-title">📈 Eco-Meter Impact</div>
            
            {loading.q3 ? (
              <div className="mcp-loading">
                <div className="skeleton" style={{ height: '30px', marginBottom: '15px' }}></div>
                <div className="skeleton" style={{ height: '80px', marginBottom: '15px' }}></div>
                <div className="skeleton" style={{ height: '40px' }}></div>
              </div>
            ) : data.q3?.error ? (
              <div className="mcp-error">Failed to load eco-meter analysis</div>
            ) : data.q3?.eco_meter_analysis ? (
              <>
                <p className="mcp-impact-line">{data.q3.eco_meter_analysis.message}</p>
                
                <div className="mcp-impact-grid">
                  <div className="mcp-impact-item">
                    <span className="mcp-impact-k">Current Rating</span>
                    <span className="mcp-impact-v" style={{ color: getColor(data.q3.eco_meter_analysis.current_rating) }}>
                      {data.q3.eco_meter_analysis.current_rating}/100
                    </span>
                  </div>
                  <div className="mcp-impact-item">
                    <span className="mcp-impact-k">This Product</span>
                    <span className="mcp-impact-v" style={{ color: getColor(data.q3.eco_meter_analysis.product_rating) }}>
                      {data.q3.eco_meter_analysis.product_rating}/100
                    </span>
                  </div>
                </div>
                
                <div className="mcp-actions">
                  <button className="mcp-btn primary" onClick={() => onAddToCart?.(product)}>
                    Add to Cart
                  </button>
                  {!data.q3.eco_meter_analysis.will_improve_ecometer && (
                    <button className="mcp-btn ghost">Find Better Options</button>
                  )}
                </div>
              </>
            ) : (
              <div className="mcp-empty">Unable to calculate eco-meter impact</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}