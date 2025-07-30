import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import '../../styles/admin/tabs/Dashboard.css';

// Import real icons
import retailerIcon from '../icons/retailerIcon.png';
import customerIcon from '../icons/customersIcon.png';
import verifiedIcon from '../icons/verifiedIcon.png';
import unverifiedIcon from '../icons/unverifiedIcon.png';
import statsLossIcon from '../icons/statsLossIcon.png';
import statsProfitIcon from '../icons/statsProfitIcon.png';

const Dashboard = () => {
  const [exportDropdown, setExportDropdown] = useState(false);
  const [periodDropdown, setPeriodDropdown] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const exportRef = useRef(null);
  const periodRef = useRef(null);

  const statsCards = [
    {
      id: 1,
      title: 'Total Customers',
      subtitle: '731 Orders',
      value: 'R9,328.55',
      percentage: '+15.6%',
      change: '+1.4k this week',
      trend: 'up',
      icon: customerIcon,
      dark: true,
      details: {
        totalCustomers: '12,302',
        newThisMonth: '1,428',
        activeCustomers: '8,945',
        averageOrderValue: '$127.50',
        topLocation: 'California',
        growthRate: '+15.6%'
      }
    },
    {
      id: 2,
      title: 'Total Retailers',
      subtitle: 'Avg. time: 4:30m',
      value: '12,302',
      percentage: '+12.7%',
      change: '+1.2k this week',
      trend: 'up',
      icon: retailerIcon,
      dark: true,
      details: {
        totalRetailers: '12,302',
        newThisMonth: '842',
        activeRetailers: '9,156',
        averageResponseTime: '4:30m',
        topCategory: 'Electronics',
        growthRate: '+12.7%'
      }
    },
    {
      id: 3,
      title: 'Verified Products',
      subtitle: '2 Disputed',
      value: '963',
      percentage: '-12.7%',
      change: '-213',
      trend: 'down',
      icon: verifiedIcon,
      dark: true,
      details: {
        totalVerified: '963',
        pendingVerification: '156',
        disputed: '2',
        averageVerificationTime: '2.5 days',
        successRate: '94.2%',
        changeRate: '-12.7%'
      }
    },
    {
      id: 4,
      title: 'Unverified Products',
      subtitle: '2 Disputed',
      value: '963',
      percentage: '-12.7%',
      change: '-213',
      trend: 'down',
      icon: unverifiedIcon,
      dark: true,
      details: {
        totalUnverified: '963',
        awaitingReview: '456',
        rejected: '89',
        averageWaitTime: '5.2 days',
        rejectionRate: '8.5%',
        changeRate: '-12.7%'
      }
    }
  ];

  const categories = [
    { name: 'Electronics', color: '#1f2937', value: 45 },
    { name: 'Laptops', color: '#6b7280', value: 30 },
    { name: 'Phones', color: '#d1d5db', value: 25 }
  ];

  // Responsive line chart configuration
  const lineChartOptions = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      spacing: [20, 20, 20, 20]
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    xAxis: {
      categories: ['03 Wed', '04 Thu', '05 Fri', '06 Sat', '07 Sun', '08 Mon', '09 Tue', '10 Wed', '11 Thu', '12 Fri', '13 Sat', '14 Sun', '15 Mon', '16 Tue'],
      gridLineWidth: 0,
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          color: '#9ca3af',
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: null
      },
      gridLineColor: '#f3f4f6',
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          color: '#9ca3af',
          fontSize: '12px'
        }
      },
      min: 0,
      max: 70
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 3
        },
        lineWidth: 2
      }
    },
    series: [
      {
        name: 'Earnings',
        data: [30, 40, 46, 37, 42, 62, 55, 13, 35, 38, 20, 10, 32, 48],
        color: '#1f2937',
        marker: {
          fillColor: '#1f2937'
        }
      },
      {
        name: 'Costs',
        data: [25, 20, 35, 22, 38, 42, 25, 15, 40, 30, 18, 20, 28, 30],
        color: '#d1d5db',
        marker: {
          fillColor: '#d1d5db'
        }
      }
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768
          },
          chartOptions: {
            xAxis: {
              categories: ['03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'],
              labels: {
                style: {
                  fontSize: '10px'
                }
              }
            }
          }
        },
        {
          condition: {
            maxWidth: 480
          },
          chartOptions: {
            xAxis: {
              categories: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
              labels: {
                step: 2,
                style: {
                  fontSize: '9px'
                }
              }
            }
          }
        }
      ]
    }
  };

  const donutChartOptions = {
    chart: {
      type: 'pie',
      height: 180,
      backgroundColor: 'transparent',
      margin: [10, 10, 10, 10]
    },
    title: {
      text: '$6.2k',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937'
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    tooltip: {
      enabled: false
    },
    plotOptions: {
      pie: {
        innerSize: '65%',
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: false,
        borderWidth: 0,
        size: '85%'
      }
    },
    series: [{
      data: [
        { name: 'Electronics', y: 45, color: '#1f2937' },
        { name: 'Laptops', y: 30, color: '#6b7280' },
        { name: 'Phones', y: 25, color: '#d1d5db' }
      ]
    }]
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportDropdown(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setPeriodDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportClick = (type) => {
    console.log(`Exporting as ${type}`);
    setExportDropdown(false);
  };

  const handlePeriodClick = (period) => {
    console.log(`Selected period: ${period}`);
    setPeriodDropdown(false);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

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
          <div 
            key={card.id} 
            className={`stat-card ${card.dark ? 'stat-card-dark' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="stat-card-header">
              <div className="stat-icon">
                <img src={card.icon} alt={card.title} className="stat-icon-image" />
              </div>
              <div className="stat-info">
                <h3 className="stat-title">{card.title}</h3>
                <p className="stat-subtitle">{card.subtitle}</p>
              </div>
              {/* <div className="stat-arrow">›</div> */}
            </div>
            
            <div className="stat-value">{card.value}</div>
            
            <div className="stat-footer">
              <span className={`stat-percentage ${card.trend}`}>
                <img src={card.percentage.charAt(0) === '-' ? statsLossIcon : statsProfitIcon} alt='stats-icon' className='stats-icon'/> 
                <span className="stat-percentage-text">{card.percentage}</span>
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
              <div className="dropdown-container" ref={exportRef}>
                <button 
                  className="dropdown-btn"
                  onClick={() => {
                    setExportDropdown(!exportDropdown);
                    setPeriodDropdown(false);
                  }}
                >
                  Export data <span className="dropdown-arrow">⌄</span>
                </button>
                {exportDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleExportClick('CSV')}>
                      Export as CSV
                    </div>
                    <div className="dropdown-item" onClick={() => handleExportClick('PDF')}>
                      Export as PDF
                    </div>
                    <div className="dropdown-item" onClick={() => handleExportClick('Excel')}>
                      Export as Excel
                    </div>
                  </div>
                )}
              </div>
              <div className="dropdown-container" ref={periodRef}>
                <button 
                  className="dropdown-btn"
                  onClick={() => {
                    setPeriodDropdown(!periodDropdown);
                    setExportDropdown(false);
                  }}
                >
                  Last 14 Days <span className="dropdown-arrow">⌄</span>
                </button>
                {periodDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handlePeriodClick('7 Days')}>
                      Last 7 Days
                    </div>
                    <div className="dropdown-item" onClick={() => handlePeriodClick('14 Days')}>
                      Last 14 Days
                    </div>
                    <div className="dropdown-item" onClick={() => handlePeriodClick('30 Days')}>
                      Last 30 Days
                    </div>
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
          
          <div className="chart-wrapper">
            <HighchartsReact
              highcharts={Highcharts}
              options={lineChartOptions}
            />
          </div>
        </div>

        {/* Top Categories */}
        <div className="chart-container categories-chart">
          <div className="chart-header">
            <h3 className="chart-title">Top Categories</h3>
          </div>
          
          <div className="donut-chart-wrapper">
            <HighchartsReact
              highcharts={Highcharts}
              options={donutChartOptions}
            />
          </div>
          
          <div className="categories-list">
            {categories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-left">
                  <div 
                    className="category-dot" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="category-name">{category.name}</span>
                </div>
              </div>
            ))}
            <div className="category-arrow">›</div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedCard && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedCard.title} Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-stats-grid">
                {Object.entries(selectedCard.details).map(([key, value]) => (
                  <div key={key} className="modal-stat-item">
                    <span className="modal-stat-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="modal-stat-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;