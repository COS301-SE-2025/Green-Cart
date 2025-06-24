import { useState } from "react";
import { footprintMock } from "../../data/footprintMock";
import "../styles/product/FootprintTracker.css";

export default function FootprintTracker({ sustainability }) {
  const data = sustainability;
  const [selected, setSelected] = useState(null);

  const detail = "Hello World";//data.breakdown.find(d => d.stage === selected);
  const MAX_RATING = 100;
  const percentage = Math.min(data.rating, MAX_RATING) / MAX_RATING * 100;
  
  // Calculate the rotation angle for the needle (180 degrees arc)
  const needleAngle = (percentage / 100) * 180 - 90;

  // Get color based on rating level
  const getRatingColor = (rating) => {
    if (rating >= 80) return '#22c55e'; // Green - excellent
    if (rating >= 60) return '#eab308'; // Yellow - good
    if (rating >= 40) return '#f97316'; // Orange - moderate
    return '#ef4444'; // Red - poor
  };

  const getRatingLevel = (rating) => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const ratingColor = getRatingColor(data.rating);
  const ratingLevel = getRatingLevel(data.rating);

  return (
    <div className="fp-tracker">
      <div className="fp-header">
        <h2 className="fp-title">
          <span className="fp-icon">🌱</span>
          Sustainability Rating
        </h2>
        <div className="fp-badge" style={{ backgroundColor: `${ratingColor}20`, color: ratingColor }}>
          {ratingLevel}
        </div>
      </div>

      {/* Circular Gauge Meter */}
      <div className="fp-gauge-container">
        <svg className="fp-gauge" viewBox="0 0 200 120" width="200" height="120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={ratingColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="fp-progress-arc"
          />
          
          {/* Center circle */}
          <circle cx="100" cy="100" r="8" fill={ratingColor} />
          
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={ratingColor}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${needleAngle} 100 100)`}
            className="fp-needle"
          />
          
          {/* Scale markers */}
          {[0, 25, 50, 75, 100].map((mark, index) => {
            const angle = (mark / 100) * 180 - 90;
            const x1 = 100 + 75 * Math.cos((angle * Math.PI) / 180);
            const y1 = 100 + 75 * Math.sin((angle * Math.PI) / 180);
            const x2 = 100 + 65 * Math.cos((angle * Math.PI) / 180);
            const y2 = 100 + 65 * Math.sin((angle * Math.PI) / 180);
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div className="fp-center-value">
          <span className="fp-value">{data.rating.toFixed(1)}</span>
          <span className="fp-unit">/ 100</span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="fp-scale-labels">
        <span className="fp-scale-min">0</span>
        <span className="fp-scale-mid">50</span>
        <span className="fp-scale-max">100</span>
      </div>

      {/* Interactive Breakdown */}
      <div className="fp-breakdown">
        <h3 className="fp-breakdown-title">Sustainability Breakdown</h3>
        
        <div className="fp-breakdown-grid">
          {data.statistics.map(item => (
            <div
              key={item.id}
              className={`fp-breakdown-item ${selected === item.type ? 'active' : ''}`}
              onClick={() => setSelected(item.type)}
              style={{
                '--accent-color': getRatingColor((item.value/5) * 100),
              }}
            >
              <div className="fp-breakdown-bar">
                <div 
                  className="fp-breakdown-fill"
                  style={{ 
                    width: `${((item.value/5)) * 100}%`,
                    backgroundColor: getRatingColor((item.value/5) * 100)
                  }}
                />
              </div>
              <div className="fp-breakdown-info">
                <span className="fp-breakdown-stage">{item.type}</span>
                <span className="fp-breakdown-value">
                  {((item.value/5)*100).toFixed(1)}/100 ({(item.value/5)*100}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected detail */}
        {/*detail && (
          <div className="fp-detail" style={{ borderColor: getRatingColor(detail.rating) }}>
            <div className="fp-detail-header">
              <h4>{detail.stage}</h4>
              <span className="fp-detail-badge" style={{ backgroundColor: getRatingColor(detail.rating) }}>
                {detail.rating.toFixed(0)}/100
              </span>
            </div>
            <p className="fp-detail-description">
              This category has a sustainability rating of <strong>{detail.rating.toFixed(1)}/100</strong>.
              {detail.rating < 60 && " Consider looking for products with better sustainability in this area."}
            </p>
          </div>
        )*/}
      </div>

      {/* Sustainability tips */}
      <div className="fp-tips">
        <h4 className="fp-tips-title">💡 Sustainability Tips</h4>
        <ul className="fp-tips-list">
          <li>Look for products with high energy efficiency ratings</li>
          <li>Choose items made from sustainable materials</li>
          <li>Consider product durability to reduce replacement frequency</li>
          <li>Check recyclability ratings to minimize environmental impact</li>
        </ul>
      </div>
    </div>
  );
}