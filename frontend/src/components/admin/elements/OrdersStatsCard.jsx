import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';

const OrderStatsCards = () => {
  const [orderPeriod, setOrderPeriod] = useState('Week');
  const [revenuePeriod, setRevenuePeriod] = useState('Last Month');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);

  const orderPeriods = ['Day', 'Week', 'Month', 'Year'];
  const revenuePeriods = ['Day', 'Week', 'Month', 'Year'];

  useEffect(() => {
    // Order Overview Chart
    const orderChart = Highcharts.chart('order-chart', {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 80,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0]
      },
      title: { text: null },
      legend: { enabled: false },
      xAxis: {
        categories: ['Active', 'Pending', 'Delivery', 'Delivered'],
        labels: { enabled: false },
        lineWidth: 0,
        tickLength: 0
      },
      yAxis: {
        title: { text: null },
        labels: { enabled: false },
        gridLineWidth: 0
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          groupPadding: 0.1,
          borderWidth: 0,
          borderRadius: 2
        }
      },
      series: [{
        data: [
          { y: 123, color: '#8b5cf6' },
          { y: 157, color: '#f97316' },
          { y: 530, color: '#10b981' },
          { y: 1710, color: '#06b6d4' }
        ]
      }],
      credits: { enabled: false }
    });

    // Revenue Chart (Donut)
    const revenueChart = Highcharts.chart('revenue-chart', {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 120,
        margin: [0, 0, 0, 0]
      },
      title: { text: null },
      legend: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: { enabled: false },
          borderWidth: 0
        }
      },
      series: [{
        data: [
          { name: 'Online', y: 74, color: '#8b5cf6' },
          { name: 'Cash', y: 42, color: '#f97316' }
        ]
      }],
      credits: { enabled: false }
    });

    return () => {
      if (orderChart) orderChart.destroy();
      if (revenueChart) revenueChart.destroy();
    };
  }, [orderPeriod, revenuePeriod]);

  const handleOrderPeriodChange = (period) => {
    setOrderPeriod(period);
    setShowOrderDropdown(false);
  };

  const handleRevenuePeriodChange = (period) => {
    setRevenuePeriod(period);
    setShowRevenueDropdown(false);
  };

  return (
    <div className="adm-ord-stats-grid">
      {/* Order Overview Card */}
      <div className="adm-ord-stats-card">
        <div className="adm-ord-stats-header">
          <div className="adm-ord-stats-title-section">
            <h3 className="adm-ord-stats-title">Order Overview</h3>
          </div>
          <div className="adm-ord-dropdown-container">
            <button 
              className="adm-ord-period-dropdown"
              onClick={() => setShowOrderDropdown(!showOrderDropdown)}
            >
              {orderPeriod}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {showOrderDropdown && (
              <div className="adm-ord-dropdown-menu">
                {orderPeriods.map((period) => (
                  <button
                    key={period}
                    className="adm-ord-dropdown-item"
                    onClick={() => handleOrderPeriodChange(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="adm-ord-stats-content">
          <div className="adm-ord-stats-value-row">
            <div className="adm-ord-stats-main">
              <div className="adm-ord-stats-label">Total Order</div>
              <div className="adm-ord-stats-value">2,520</div>
              <div className="adm-ord-stats-change">
                <span className="adm-ord-change positive">+10.5%</span>
                <span className="adm-ord-comparison">Compared to last week</span>
              </div>
            </div>
            <div className="adm-ord-chart-container">
              <div id="order-chart"></div>
            </div>
          </div>
        </div>
        
        {/* Order breakdown */}
        <div className="adm-ord-breakdown">
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Active Order</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #8b5cf6', paddingLeft: '6px'}}>123</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Pending Order</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #f97316', paddingLeft: '6px'}}>157</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">On Delivery</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #10b981', paddingLeft: '6px'}}>530</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Delivered</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #06b6d4', paddingLeft: '6px'}}>1710</span>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="adm-ord-stats-card">
        <div className="adm-ord-stats-header">
          <div className="adm-ord-stats-title-section">
            <h3 className="adm-ord-stats-title">Revenue</h3>
          </div>
          <div className="adm-ord-dropdown-container">
            <button 
              className="adm-ord-period-dropdown"
              onClick={() => setShowRevenueDropdown(!showRevenueDropdown)}
            >
              {revenuePeriod}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {showRevenueDropdown && (
              <div className="adm-ord-dropdown-menu">
                {revenuePeriods.map((period) => (
                  <button
                    key={period}
                    className="adm-ord-dropdown-item"
                    onClick={() => handleRevenuePeriodChange(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="adm-ord-stats-content">
          <div className="adm-ord-stats-value-row">
            <div className="adm-ord-stats-main">
              <div className="adm-ord-stats-label">Total Revenue</div>
              <div className="adm-ord-stats-value">$116K</div>
              <div className="adm-ord-stats-change">
                <span className="adm-ord-change negative">-7.2%</span>
                <span className="adm-ord-comparison">Compared to last week</span>
              </div>
            </div>
            <div className="adm-ord-chart-container">
              <div id="revenue-chart"></div>
            </div>
          </div>
        </div>
        
        {/* Revenue breakdown */}
        <div className="adm-ord-breakdown">
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Online</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #8b5cf6', paddingLeft: '6px'}}>$74K</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Cash</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #f97316', paddingLeft: '6px'}}>$42K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatsCards;