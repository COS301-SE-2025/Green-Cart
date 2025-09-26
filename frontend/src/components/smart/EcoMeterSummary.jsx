import React from 'react';
import '../styles/smart/smart.css';

const color = (v) => (v >= 80 ? '#22C55E' : v >= 60 ? '#F59E0B' : v >= 40 ? '#F97316' : '#EF4444');

export default function EcoMeterSummary({ ecoMeter = 0, donation = 0, onImprove }) {
  return (
    <div className="smart-ecometer-sticky">
      <div className="smart-ecometer-head">
        <span>🌱 Eco-Meter</span>
        <span className="smart-ecometer-score" style={{ color: color(ecoMeter) }}>{ecoMeter}/100</span>
      </div>
      <div className="smart-ecometer-bar">
        <div className="smart-ecometer-fill" style={{ width: `${ecoMeter}%`, background: color(ecoMeter) }} />
      </div>
      {donation > 0 && <div className="smart-ecometer-note">+ Impact from donation</div>}
      <button className="smart-btn primary full" onClick={onImprove}>Improve Eco-Meter</button>
    </div>
  );
}
