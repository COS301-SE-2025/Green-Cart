import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import { getApiUrl, getLocalApiUrl } from '../../../config/api';

const OrderStatsCards = ({ loading = false }) => {
  const [orderPeriod, setOrderPeriod] = useState('Day');
  const [revenuePeriod, setRevenuePeriod] = useState('Day');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const [pending, setPending] = useState(0);
  const [ready, setReady] = useState(0);
  const [inTransit, setInTransit] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [total, setTotal] = useState(0);
  const [monthly, setMonthly] = useState(0.0);
  const [totalRevenue, setTotalRevenue] = useState(0.0);
  const [totalLoss, setTotalLoss] = useState(0.0);
  const [monthlyChange, setMonthlyChange] = useState(0.0);

  const orderPeriods = ['Day', 'Week', 'Month', 'Year'];
  const revenuePeriods = ['Day', 'Week', 'Month', 'Year'];

  const populateOrdersRevenue = async (period) => {
    const apiUrl = getLocalApiUrl();
    const response = await fetch(`${apiUrl}/admin/orders/revenue/${period}`).then(res => res.json());
    
    if(response){
      setTotalRevenue(response.total_revenue || 0);
      setTotalLoss(response.lost_revenue || 0);
      setMonthlyChange(response.monthly_comparison * 100 || 0.0);
    }
  }

  const populateOrdersOverview = async (period) => {
    const apiUrl = getLocalApiUrl();
    const response = await fetch(`${apiUrl}/admin/orders/overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'time': period })
    }).then(res => res.json());

    if (response) {
      setPending(response.total_pending || 0);
      setReady(response.total_ready_for_delivery || 0);
      setInTransit(response.total_in_transit || 0);
      setDelivered(response.total_delivered || 0);
      setCancelled(response.total_cancelled || 0);
      setTotal(response.total_orders || 0);
      setMonthly(response.monthly_comparison * 100 || 0.0);
    }
  }

  useEffect(() => {
    if (!loading) {
      populateOrdersOverview(orderPeriods.findIndex(p => p === orderPeriod) + 1);
      populateOrdersRevenue(revenuePeriods.findIndex(p => p === revenuePeriod) + 1);
    }
  }, [orderPeriod, revenuePeriod, loading]);

  useEffect(() => {
    if (!loading) {
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
          categories: ['Pending', 'Ready for Delivery', 'In Transit', 'Delivered', 'Cancelled'],
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
            { y: pending, color: '#f97316' },
            { y: ready, color: '#8b5cf6' },
            { y: inTransit, color: '#10b981' },
            { y: delivered, color: '#06b6d4' },
            { y: cancelled, color: 'rgb(212, 6, 6)' }
          ]
        }],
        credits: { enabled: false }
      });

      return () => {
        if (orderChart) orderChart.destroy();
      };
    }
  }, [pending, ready, inTransit, delivered, cancelled, loading]);

  useEffect(() => {
    if (!loading) {
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
            { name: 'Revenue', y: totalRevenue, color: '#8b5cf6' },
            { name: 'Lost Revenue from Cancelled Orders', y: totalLoss, color: 'red' }
          ]
        }],
        credits: { enabled: false }
      });

      return () => {
        if (revenueChart) revenueChart.destroy();
      };
    }
  }, [totalRevenue, totalLoss, loading]);

  const handleOrderPeriodChange = (period) => {
    setOrderPeriod(period);
    setShowOrderDropdown(false);
  };

  const handleRevenuePeriodChange = (period) => {
    setRevenuePeriod(period);
    setShowRevenueDropdown(false);
  };

  if (loading) {
    return (
      <div className="adm-ord-stats-grid">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="adm-ord-stats-card adm-ord-stats-card-loading">
            <div className="adm-ord-loading-banner">
              <div className="adm-ord-custom-loader">
                <svg className="adm-ord-circular" viewBox="25 25 50 50">
                  <circle 
                    className="adm-ord-path" 
                    cx="50" 
                    cy="50" 
                    r="20" 
                    fill="none" 
                    strokeWidth="2" 
                    strokeMiterlimit="10"
                  />
                </svg>
              </div>
              <span>Loading...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              <div className="adm-ord-stats-label">Total Orders</div>
              <div className="adm-ord-stats-value">{total}</div>
              <div className="adm-ord-stats-change">
                <span className={`adm-ord-change ${monthly > 0 ? 'positive' : 'negative'}`}>{monthly}%</span>
                <span className="adm-ord-comparison">Compared to last month</span>
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
            <span className="adm-ord-breakdown-label">Pending</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #f97316', paddingLeft: '6px'}}>{pending}</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Ready for Delivery</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #8b5cf6', paddingLeft: '6px'}}>{ready}</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">In Transit</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #10b981', paddingLeft: '6px'}}>{inTransit}</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Delivered</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #06b6d4', paddingLeft: '6px'}}>{delivered}</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Cancelled</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid rgb(212, 6, 6)', paddingLeft: '6px'}}>{cancelled}</span>
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
              <div className="adm-ord-stats-value">R{totalRevenue}</div>
              <div className="adm-ord-stats-change">
                <span className={`adm-ord-change ${monthlyChange > 0 ? 'positive' : 'negative'}`}>{monthlyChange}%</span>
                <span className="adm-ord-comparison">Compared to last month</span>
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
            <span className="adm-ord-breakdown-label">Revenue</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid #8b5cf6', paddingLeft: '6px'}}>R{totalRevenue}</span>
          </div>
          <div className="adm-ord-breakdown-item">
            <span className="adm-ord-breakdown-label">Lost Revenue from Cancelled Orders</span>
            <span className="adm-ord-breakdown-value" style={{borderLeft: '3px solid red', paddingLeft: '6px'}}>R{totalLoss}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatsCards;