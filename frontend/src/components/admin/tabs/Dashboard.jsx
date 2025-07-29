import React, { useState } from 'react';
import '../../styles/admin/tabs/Dashboard.css';

const Dashboard = () => {
  const [exportDropdown, setExportDropdown] = useState(false);
  const [periodDropdown, setPeriodDropdown] = useState(false);

  const statsCards = [
    {
      id: 1,
      title: 'Total Sales',
      subtitle: '731 Orders',
      value: '$9,328.55',
      percentage: '+15.6%',
      change: '+1.4k this week',
      trend: 'up',
      icon: '🛒',
      dark: true
    },
    {
      id: 2,
      title: 'Visitors',
      subtitle: 'Avg. time: 4:30m',
      value: '12,302',
      percentage: '+12.7%',
      change: '+1.2k this week',
      trend: 'up',
      icon: '👤',
      dark: false
    },
    {
      id: 3,
      title: 'Refunds',
      subtitle: '2 Disputed',
      value: '963',
      percentage: '-12.7%',
      change: '-213',
      trend: 'down',
      icon: '↩️',
      dark: false
    }
  ];

  const chartData = [
    { day: '03 Wed', earnings: 30, costs: 25 },
    { day: '04 Thu', earnings: 40, costs: 20 },
    { day: '05 Fri', earnings: 46, costs: 35 },
    { day: '06 Sat', earnings: 37, costs: 22 },
    { day: '07 Sun', earnings: 42, costs: 38 },
    { day: '08 Mon', earnings: 62, costs: 42 },
    { day: '09 Tue', earnings: 55, costs: 25 },
    { day: '10 Wed', earnings: 13, costs: 15 },
    { day: '11 Thu', earnings: 35, costs: 40 },
    { day: '12 Fri', earnings: 38, costs: 30 },
    { day: '13 Sat', earnings: 20, costs: 18 },
    { day: '14 Sun', earnings: 10, costs: 20 },
    { day: '15 Mon', earnings: 32, costs: 28 },
    { day: '16 Tue', earnings: 48, costs: 30 }
  ];

  const categories = [
    { name: 'Electronics', color: '#1f2937', value: 45 },
    { name: 'Laptops', color: '#6b7280', value: 30 },
    { name: 'Phones', color: '#d1d5db', value: 25 }
  ];

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back, Matthew</h1>
          <p className="welcome-subtitle">Here are today's stats from your online store!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card) => (
          <div key={card.id} className={`stat-card ${card.dark ? 'stat-card-dark' : ''}`}>
            <div className="stat-card-header">
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-info">
                <h3 className="stat-title">{card.title}</h3>
                <p className="stat-subtitle">{card.subtitle}</p>
              </div>
              <div className="stat-arrow">›</div>
            </div>
            
            <div className="stat-value">{card.value}</div>
            
            <div className="stat-footer">
              <span className={`stat-percentage ${card.trend}`}>
                📈 {card.percentage}
              </span>
              <span className="stat-change">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Sales Performance Chart */}
        <div className="chart-container sales-chart">
          <div className="chart-header">
            <h3 className="chart-title">Sales Performance</h3>
            <div className="chart-controls">
              <div className="dropdown-container">
                <button 
                  className="dropdown-btn"
                  onClick={() => setExportDropdown(!exportDropdown)}
                >
                  Export data <span className="dropdown-arrow">⌄</span>
                </button>
                {exportDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">Export as CSV</div>
                    <div className="dropdown-item">Export as PDF</div>
                    <div className="dropdown-item">Export as Excel</div>
                  </div>
                )}
              </div>
              <div className="dropdown-container">
                <button 
                  className="dropdown-btn"
                  onClick={() => setPeriodDropdown(!periodDropdown)}
                >
                  Last 14 Days <span className="dropdown-arrow">⌄</span>
                </button>
                {periodDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">Last 7 Days</div>
                    <div className="dropdown-item">Last 14 Days</div>
                    <div className="dropdown-item">Last 30 Days</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot earnings"></span>
              <span>Earnings</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot costs"></span>
              <span>Costs</span>
            </div>
          </div>
          
          <div className="chart-area">
            <svg className="line-chart" viewBox="0 0 800 300">
              {/* Grid lines */}
              {[0, 10, 20, 30, 40, 50, 60].map((y) => (
                <line 
                  key={y} 
                  x1="40" 
                  y1={280 - (y * 4)} 
                  x2="760" 
                  y2={280 - (y * 4)} 
                  stroke="#f3f4f6" 
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 10, 20, 30, 40, 50, 60].map((y) => (
                <text 
                  key={y} 
                  x="30" 
                  y={285 - (y * 4)} 
                  fill="#9ca3af" 
                  fontSize="12" 
                  textAnchor="end"
                >
                  {y}
                </text>
              ))}
              
              {/* Earnings line */}
              <polyline
                fill="none"
                stroke="#1f2937"
                strokeWidth="2"
                points={chartData.map((point, index) => 
                  `${60 + (index * 50)},${280 - (point.earnings * 4)}`
                ).join(' ')}
              />
              
              {/* Costs line */}
              <polyline
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
                points={chartData.map((point, index) => 
                  `${60 + (index * 50)},${280 - (point.costs * 4)}`
                ).join(' ')}
              />
              
              {/* Data points for earnings */}
              {chartData.map((point, index) => (
                <circle
                  key={`earnings-${index}`}
                  cx={60 + (index * 50)}
                  cy={280 - (point.earnings * 4)}
                  r="3"
                  fill="#1f2937"
                />
              ))}
              
              {/* Data points for costs */}
              {chartData.map((point, index) => (
                <circle
                  key={`costs-${index}`}
                  cx={60 + (index * 50)}
                  cy={280 - (point.costs * 4)}
                  r="3"
                  fill="#d1d5db"
                />
              ))}
            </svg>
            
            {/* X-axis labels */}
            <div className="x-axis-labels">
              {chartData.map((point, index) => (
                <span key={index} className="x-label">{point.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="chart-container categories-chart">
          <div className="chart-header">
            <h3 className="chart-title">Top Categories</h3>
          </div>
          
          <div className="donut-chart-container">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="20"
                  strokeDasharray={`${categories[0].value * 4.4} 440`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="20"
                  strokeDasharray={`${categories[1].value * 4.4} 440`}
                  strokeDashoffset={`-${categories[0].value * 4.4}`}
                  transform="rotate(-90 100 100)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="20"
                  strokeDasharray={`${categories[2].value * 4.4} 440`}
                  strokeDashoffset={`-${(categories[0].value + categories[1].value) * 4.4}`}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="donut-center">
                <span className="donut-value">$6.2k</span>
              </div>
            </div>
          </div>
          
          <div className="categories-list">
            {categories.map((category, index) => (
              <div key={index} className="category-item">
                <div 
                  className="category-dot" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="category-name">{category.name}</span>
              </div>
            ))}
            <div className="category-arrow">›</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;