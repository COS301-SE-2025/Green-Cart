import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import '../styles/retailer/SalesChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SalesChart({ salesData }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1e293b',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R' + value.toLocaleString();
          },
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
        },
      }
    }
  };

  const data = {
    labels: salesData.map(item => item.month),
    datasets: [
      {
        label: 'Sales (ZAR)',
        data: salesData.map(item => item.sales),
        backgroundColor: 'rgba(123, 181, 64, 0.1)',
        borderColor: 'rgba(123, 181, 64, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(123, 181, 64, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <>
     <h2 className="sales-chart-title">Sales</h2>
    <div className="sales-chart-section">
     
      <div className="chart-container" style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
    </>
    
  );
}