// components/dashboard/StatsGrid.jsx
import React from 'react';
import DashboardStatsCard from './DashboardStatsCard';

const DashboardStatsGrid = ({ statsCards, onCardClick, loading = false }) => {
  return (
    <div className="stats-grid">
      {loading ? (
        // Show 4 loading cards
        Array.from({ length: 4 }).map((_, index) => (
          <DashboardStatsCard key={index} loading={true} />
        ))
      ) : (
        statsCards.map((card) => (
          <DashboardStatsCard 
            key={card.id} 
            card={card} 
            onClick={onCardClick}
          />
        ))
      )}
    </div>
  );
};

export default DashboardStatsGrid;