import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getAdminMetrics } from '../../../admin-services/adminMetricsService';
import { getProductStats } from '../../../admin-services/adminProductService';
import toast from 'react-hot-toast';
import '../../styles/admin/tabs/Dashboard.css';

const Dashboard = () => {
  const [exportDropdown, setExportDropdown] = useState(false);
  const [periodDropdown, setPeriodDropdown] = useState(false);
  const [adminMetrics, setAdminMetrics] = useState({
    total_users: 0,
    total_retailers: 0,
    total_products: 0,
    verified_products: 0,
    unverified_products: 0,
    recent_orders: 0,
    active_retailers: 0,
    top_categories: [],
    monthly_orders: []
  });
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    totalValue: '0.00'
  });
  const [loading, setLoading] = useState(true);
  const exportRef = useRef(null);
  const periodRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsResponse, statsResponse] = await Promise.all([
        getAdminMetrics(),
        getProductStats()
      ]);

      if (metricsResponse) {
        setAdminMetrics(metricsResponse);
      }

      if (statsResponse.status === 200) {
        setProductStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      id: 1,
      title: 'Total Users',
      subtitle: 'Registered Users',
      value: adminMetrics.total_users.toString(),
      percentage: `${adminMetrics.recent_orders} orders this week`,
      trend: 'up',
      dark: true
    },
    {
      id: 2,
      title: 'Total Retailers',
      subtitle: 'Active Retailers', 
      value: adminMetrics.total_retailers.toString(),
      percentage: `${adminMetrics.active_retailers} with products`,
      trend: 'up',
      dark: true
    },
    {
      id: 3,
      title: 'Verified Products',
      subtitle: 'Approved Products',
      value: adminMetrics.verified_products.toString(),
      percentage: adminMetrics.total_products > 0 ? `${Math.round((adminMetrics.verified_products / adminMetrics.total_products) * 100)}% of total` : '0% of total',
      trend: 'up',
      dark: true
    },
    {
      id: 4,
      title: 'Unverified Products',
      subtitle: 'Pending Review',
      value: adminMetrics.unverified_products.toString(),
      percentage: adminMetrics.total_products > 0 ? `${Math.round((adminMetrics.unverified_products / adminMetrics.total_products) * 100)}% of total` : '0% of total',
      trend: adminMetrics.unverified_products > 0 ? 'down' : 'up',
      dark: true
    }
  ];

  // Use real categories data from backend
  const categories = adminMetrics.top_categories || [];

  // Line chart configuration
  const lineChartOptions = {
    chart: {
      type: 'line',
      height: 300,
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
      categories: adminMetrics.monthly_orders.map(item => item.month),
      gridLineWidth: 0,
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: {
          color: '#9ca3af',
          fontSize: '12px'
        },
        rotation: -45
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
      min: 0
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 4
        },
        lineWidth: 3
      }
    },
    series: [
      {
        name: 'Total Orders',
        data: adminMetrics.monthly_orders.map(item => item.orders),
        color: '#1f2937',
        marker: {
          fillColor: '#1f2937'
        }
      }
    ],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          chart: {
            height: 250
          }
        }
      }]
    }
  };

  // Donut chart configuration for top 3 categories
  const donutChartOptions = {
    chart: {
      type: 'pie',
      height: 220,  // Slightly increased height for better proportion with 3 categories
      backgroundColor: 'transparent'
    },
    title: {
      text: categories.length > 0 ? `${categories.reduce((sum, cat) => sum + cat.count, 0)}` : '0',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontSize: '24px',
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
      enabled: true,
      formatter: function() {
        return `<b>${this.point.name}</b><br/>
                Orders: ${this.point.options.custom_count}<br/>
                Percentage: ${this.y}%`;
      },
      backgroundColor: '#1f2937',
      borderWidth: 0,
      style: {
        color: '#ffffff',
        fontSize: '12px'
      }
    },
    plotOptions: {
      pie: {
        innerSize: '70%',
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: true,
        borderWidth: 0
      }
    },
    series: [{
      data: categories.map(category => ({
        name: category.name,
        y: category.percentage,
        color: category.color,
        custom_count: category.count
      }))
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
              <div className="stat-info">
                <h3 className="stat-title">{card.title}</h3>
                <p className="stat-subtitle">{card.subtitle}</p>
              </div>
              <div className="stat-arrow">›</div>
            </div>
            
            <div className="stat-value">{card.value}</div>
            
            <div className="stat-footer">
              <span className={`stat-percentage ${card.trend}`}>
                {card.percentage}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Orders Chart */}
        <div className="chart-container sales-chart">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Orders</h3>
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
                  Last 12 Months <span className="dropdown-arrow">⌄</span>
                </button>
                {periodDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handlePeriodClick('6 Months')}>
                      Last 6 Months
                    </div>
                    <div className="dropdown-item" onClick={() => handlePeriodClick('12 Months')}>
                      Last 12 Months
                    </div>
                    <div className="dropdown-item" onClick={() => handlePeriodClick('24 Months')}>
                      Last 24 Months
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot earnings"></span>
              <span>Total Orders</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            <HighchartsReact
              highcharts={Highcharts}
              options={lineChartOptions}
            />
          </div>
        </div>

        {/* Top 3 Categories by Orders */}
        <div className="chart-container categories-chart">
          <div className="chart-header">
            <h3 className="chart-title">Top 3 Categories by Orders</h3>
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
    </div>
  );
};

export default Dashboard;