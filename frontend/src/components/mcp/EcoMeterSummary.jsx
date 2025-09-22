import React from 'react';
import '../styles/mcp/mcp.css';

const color = (v) => (v >= 80 ? '#22C55E' : v >= 60 ? '#F59E0B' : v >= 40 ? '#F97316' : '#EF4444');

export default function EcoMeterSummary({ ecoMeter = 0, donation = 0, onImprove }) {
  return (
    <div className="mcp-ecometer-sticky">
      <div className="mcp-ecometer-head">
        <span>🌱 Eco-Meter</span>
        <span className="mcp-ecometer-score" style={{ color: color(ecoMeter) }}>{ecoMeter}/100</span>
      </div>
      <div className="mcp-ecometer-bar">
        <div className="mcp-ecometer-fill" style={{ width: `${ecoMeter}%`, background: color(ecoMeter) }} />
      </div>
      {donation > 0 && <div className="mcp-ecometer-note">+ Impact from donation</div>}
      <button className="mcp-btn primary full" onClick={onImprove}>Improve Eco-Meter</button>
    </div>
  );
}