// components/dashboard/MetricsChart.jsx
import React, { useState, useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const DashboardMetricsChart = ({ adminMetrics, loading = false }) => {
  const [exportDropdown, setExportDropdown] = useState(false);
  const [periodDropdown, setPeriodDropdown] = useState(false);
  const exportRef = useRef(null);
  const periodRef = useRef(null);

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

  if (loading) {
    return (
      <div className="chart-container sales-chart">
        <div className="loading-banner">
          <div className="custom-loader">
          <svg className="circular" viewBox="25 25 50 50">
            <circle 
              className="path" 
              cx="50" 
              cy="50" 
              r="20" 
              fill="none" 
              strokeWidth="2" 
              strokeMiterlimit="10"
            />
          </svg>
        </div>
          <span>Loading monthly orders...</span>
        </div>
      </div>
    );
  }

  return (
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
          className="line-chart"
        />
      </div>
    </div>
  );
};

export default DashboardMetricsChart;