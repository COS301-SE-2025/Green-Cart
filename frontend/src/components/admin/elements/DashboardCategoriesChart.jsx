// components/dashboard/CategoriesChart.jsx
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const DashboardCategoriesChart = ({ categories, loading = false }) => {
  const donutChartOptions = {
    chart: {
      type: 'pie',
      height: 180,
      backgroundColor: 'transparent',
      margin: [10, 10, 10, 10]
    },
    title: {
      text: categories.length > 0 ? `${categories.reduce((sum, cat) => sum + cat.count, 0)}` : '0',
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
      data: categories.map(category => ({
        name: category.name,
        y: category.percentage,
        color: category.color,
        custom_count: category.count
      }))
    }]
  };

  if (loading) {
    return (
      <div className="chart-container categories-chart">
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
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default DashboardCategoriesChart;