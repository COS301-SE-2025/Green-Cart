import { useState } from "react";
import { footprintMock } from "../../data/footprintMock";
import "../styles/product/FootprintTracker.css";

export default function FootprintTracker() {
  const data = footprintMock;
  const [selected, setSelected] = useState(data.breakdown[0].stage);

  const detail = data.breakdown.find(d => d.stage === selected);
  const MAX_KG = 50;
  const percentage = Math.min(data.overalRating, MAX_KG) / MAX_KG * 100;
  
  // Calculate the rotation angle for the needle (180 degrees arc)
  const needleAngle = (percentage / 100) * 180 - 90;

  // Get color based on footprint level
  const getFootprintColor = (kg) => {
    if (kg <= 10) return '#22c55e'; // Green - excellent
    if (kg <= 25) return '#eab308'; // Yellow - good
    if (kg <= 40) return '#f97316'; // Orange - moderate
    return '#ef4444'; // Red - high
  };

  const getFootprintLevel = (kg) => {
    if (kg <= 10) return 'Excellent';
    if (kg <= 25) return 'Good';
    if (kg <= 40) return 'Moderate';
    return 'High Impact';
  };

  const footprintColor = getFootprintColor(data.overalRating);
  const footprintLevel = getFootprintLevel(data.overalRating);

  return (
    <div className="fp-tracker">
      <div className="fp-header">
        <h2 className="fp-title">
          <span className="fp-icon">🌱</span>
          Carbon Footprint
        </h2>
        <div className="fp-badge" style={{ backgroundColor: `${footprintColor}20`, color: footprintColor }}>
          {footprintLevel}
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
            stroke={footprintColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="fp-progress-arc"
          />
          
          {/* Center circle */}
          <circle cx="100" cy="100" r="8" fill={footprintColor} />
          
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={footprintColor}
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
          <span className="fp-value">{data.overalRating.toFixed(1)}</span>
          <span className="fp-unit">Rating</span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="fp-scale-labels">
        <span className="fp-scale-min">0</span>
        <span className="fp-scale-mid">25</span>
        <span className="fp-scale-max">50+ kg</span>
      </div>

      {/* Interactive Breakdown */}
      <div className="fp-breakdown">
        <h3 className="fp-breakdown-title">Breakdown by Stage</h3>
        
        <div className="fp-breakdown-grid">
          {data.breakdown.map(item => (
            <div
              key={item.stage}
              className={`fp-breakdown-item ${selected === item.stage ? 'active' : ''}`}
              onClick={() => setSelected(item.stage)}
              style={{
                '--accent-color': getFootprintColor(item.kg)
              }}
            >
              <div className="fp-breakdown-bar">
                <div 
                  className="fp-breakdown-fill"
                  style={{ 
                    width: `${(item.kg / data.overalRating) * 100}%`,
                    backgroundColor: getFootprintColor(item.kg)
                  }}
                />
              </div>
              <div className="fp-breakdown-info">
                <span className="fp-breakdown-stage">{item.stage}</span>
                <span className="fp-breakdown-value">
                  {item.kg.toFixed(1)} kg ({item.percent.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected detail */}
        {detail && (
          <div className="fp-detail" style={{ borderColor: getFootprintColor(detail.kg) }}>
            <div className="fp-detail-header">
              <h4>{detail.stage}</h4>
              <span className="fp-detail-badge" style={{ backgroundColor: getFootprintColor(detail.kg) }}>
                {((detail.kg / data.overalRating) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="fp-detail-description">
              This stage contributes <strong>{detail.kg.toFixed(1)} kg CO₂e</strong> to the total footprint.
              {detail.kg > 15 && " Consider eco-friendly alternatives to reduce this impact."}
            </p>
          </div>
        )}
      </div>

      {/* Sustainability tips */}
      <div className="fp-tips">
        <h4 className="fp-tips-title">💡 Sustainability Tips</h4>
        <ul className="fp-tips-list">
          <li>Look for products with lower transportation footprints</li>
          <li>Choose items with sustainable packaging</li>
          <li>Consider the product's end-of-life recyclability</li>
        </ul>
      </div>
    </div>
  );
}