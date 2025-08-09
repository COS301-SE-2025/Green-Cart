import React, { useState, useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import '../styles/charts/InteractiveCarbonChart.css';

// Enable draggable points module
import HighchartsDraggablePoints from 'highcharts/modules/draggable-points';
import HighchartsAnnotations from 'highcharts/modules/annotations';

// Initialize Highcharts modules with error handling
try {
  HighchartsDraggablePoints(Highcharts);
  HighchartsAnnotations(Highcharts);
} catch (error) {
  console.warn('Highcharts modules initialization failed:', error);
}

export default function InteractiveCarbonChart({ 
  monthlyData = [], 
  onGoalChange, 
  getCarbonColor = () => '#22c55e',
  selectedTimeframe = 'monthly' 
}) {
  const chartRef = useRef(null);
  const [goals, setGoals] = useState(
    Array.isArray(monthlyData) && monthlyData.length > 0 
      ? monthlyData.map(month => month?.goal || 75)
      : []
  );

  // Update goals when monthlyData changes
  useEffect(() => {
    if (Array.isArray(monthlyData) && monthlyData.length > 0) {
      setGoals(monthlyData.map(month => month?.goal || 75));
    }
  }, [monthlyData]);

  // Early return if no data
  if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
    return (
      <div className="interactive-carbon-chart">
        <div className="ua-chart-header">
          <div className="ua-chart-info">
            <h3>Sustainability Score Tracking</h3>
            <p>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle goal changes from dragging
  const handleGoalUpdate = (monthIndex, newGoal) => {
    const updatedGoals = [...goals];
    updatedGoals[monthIndex] = Math.round(newGoal * 10) / 10; // Round to 1 decimal
    setGoals(updatedGoals);
    
    if (onGoalChange) {
      onGoalChange(monthIndex, updatedGoals[monthIndex]);
    }
  };

  // Calculate performance statistics
  const performanceStats = {
    monthsUnderGoal: monthlyData.filter((month, index) => 
      (month?.footprint || 0) >= (goals[index] || 75)
    ).length,
    monthsOverGoal: monthlyData.filter((month, index) => 
      (month?.footprint || 0) < (goals[index] || 75)
    ).length,
    averagePerformance: monthlyData.length > 0 ? (() => {
      const monthsWithData = monthlyData.filter(month => (month?.footprint || 0) > 0);
      if (monthsWithData.length === 0) return '0';
      
      const total = monthsWithData.reduce((sum, month) => {
        return sum + (month?.footprint || 0);
      }, 0);
      
      return (total / monthsWithData.length).toFixed(1);
    })() : '0'
  };

  // Highcharts configuration
  const chartOptions = {
    chart: {
      type: 'line',
      height: 500,
      backgroundColor: '#fafbfc',
      borderRadius: 12,
      // marginTop: 60,
      // marginBottom: 80,
      // marginLeft: 80,
      // marginRight: 80,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    },
    
    title: {
      text: 'Interactive Sustainability Score Tracker',
      style: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937'
      },
      y: 30
    },
    
    subtitle: {
      text: 'Drag the green goal points to set your monthly targets',
      style: {
        fontSize: '14px',
        color: '#6b7280'
      },
      y: 50
    },
    
    credits: { enabled: false },
    
    xAxis: {
      categories: monthlyData.map(month => month?.month || 'Unknown'),
      gridLineWidth: 1,
      // gridLineColor: '#f3f4f6',
      gridLineColor: '#e5e7eb',
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px',
          fontWeight: '500'
        }
      },
      title: {
        text: 'Month',
        style: {
          color: '#374151',
          fontSize: '14px',
          fontWeight: '600'
        }
      }
    },
    
    yAxis: {
      title: {
        text: 'Sustainability Score',
        style: {
          color: '#374151',
          fontSize: '14px',
          fontWeight: '600'
        }
      },
      gridLineColor: '#f3f4f6',
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px'
        }
      },
      min: 0,
      max: 100,
      tickInterval: 25
    },
    
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      backgroundColor: '#f9fafb',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      itemStyle: {
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500'
      },
      symbolPadding: 8,
      itemMarginTop: 8,
      itemMarginBottom: 8,
      padding: 16
    },
    
    tooltip: {
      shared: true,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderRadius: 8,
      style: {
        color: '#ffffff',
        fontSize: '12px'
      },
      headerFormat: '<span style="font-size: 14px; font-weight: 600;">{point.key}</span><br/>',
      formatter: function() {
        let tooltipText = `<span style="font-size: 14px; font-weight: 600;">${this.x}</span><br/>`;
        
        this.points.forEach(function(point) {
          const hasData = point.y > 0;
          if (hasData) {
            tooltipText += `<span style="color: ${point.color};">●</span> ${point.series.name}: <b>${point.y}/100</b><br/>`;
          } else {
            tooltipText += `<span style="color: ${point.color};">●</span> ${point.series.name}: <b>No orders this month</b><br/>`;
          }
        });
        
        return tooltipText;
      },
      shadow: true
    },
    
    plotOptions: {
      line: {
        lineWidth: 3,
        marker: {
          radius: 6,
          lineWidth: 2,
          lineColor: '#ffffff'
        },
        states: {
          hover: {
            lineWidth: 4,
            marker: {
              radius: 8
            }
          }
        }
      },
      series: {
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    },
    
    series: [
      {
        name: 'Actual Score',
        data: monthlyData.map(month => {
          const footprint = month?.footprint || 0;
          const hasData = footprint > 0;
          return {
            y: footprint,
            color: hasData ? getCarbonColor(footprint) : '#e5e7eb',
            marker: {
              fillColor: hasData ? getCarbonColor(footprint) : '#e5e7eb',
              lineColor: hasData ? '#ffffff' : '#d1d5db',
              lineWidth: hasData ? 2 : 1,
              radius: hasData ? 6 : 4
            }
          };
        }),
        color: '#3b82f6',
        marker: {
          fillColor: '#3b82f6',
          states: {
            hover: {
              fillColor: '#2563eb',
              radius: 8
            }
          }
        },
        zIndex: 2,
        dragDrop: {
          draggableY: false // Actual data shouldn't be draggable
        }
      },
      {
        name: 'Your Goals (Draggable)',
        data: goals.map((goal, index) => ({
          y: goal || 75,
          color: '#22c55e'
        })),
        color: '#22c55e',
        dashStyle: 'Dash',
        marker: {
          fillColor: '#22c55e',
          radius: 8,
          states: {
            hover: {
              fillColor: '#16a34a',
              radius: 10
            }
          }
        },
        zIndex: 3,
        cursor: 'ns-resize',
        dragDrop: {
          draggableY: true,
          dragMinY: 0,
          dragMaxY: 100,
          dragPrecisionY: 0.1,
          dragSensitivity: 10
        },
        point: {
          events: {
            drop: function() {
              const pointIndex = this.index;
              const newValue = this.y;
              handleGoalUpdate(pointIndex, newValue);
            }
          }
        }
      }
    ],
    
    // Temporarily disable annotations for debugging
    // annotations: [{
    //   shapes: monthlyData.map((month, index) => {
    //     if (index === monthlyData.length - 1) return null;
        
    //     const currentFootprint = month?.footprint || 0;
    //     const nextFootprint = monthlyData[index + 1]?.footprint || 0;
    //     const currentGoal = goals[index] || 25;
    //     const nextGoal = goals[index + 1] || 25;
    //     const isOverGoal = currentFootprint > currentGoal;
        
    //     return {
    //       type: 'path',
    //       points: [
    //         { x: index, y: currentFootprint, xAxis: 0, yAxis: 0 },
    //         { x: index + 1, y: nextFootprint, xAxis: 0, yAxis: 0 },
    //         { x: index + 1, y: nextGoal, xAxis: 0, yAxis: 0 },
    //         { x: index, y: currentGoal, xAxis: 0, yAxis: 0 }
    //       ],
    //       fill: isOverGoal ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
    //       // stroke: 'transparent'
    //     };
    //   }).filter(Boolean)
    // }]
  };

  return (
    <div className="interactive-carbon-chart">
      <div className="ua-chart-header">
        <div className="ua-chart-info">
          <h3>Sustainability Score Tracking</h3>
          <p>Track your progress and set achievable monthly goals</p>
        </div>

        <div className="ua-chart-stats">
          <div className="ua-stat-badge success">
            <span className="ua-stat-number">{performanceStats.monthsUnderGoal}</span>
            <span className="ua-stat-label">Above Goal</span>
          </div>
          <div className="ua-stat-badge warning">
            <span className="ua-stat-number">{performanceStats.monthsOverGoal}</span>
            <span className="ua-stat-label">Below Goal</span>
          </div>
          <div className="ua-stat-badge info">
            <span className="ua-stat-number">{performanceStats.averagePerformance}/100</span>
            <span className="ua-stat-label">Avg Score</span>
          </div>
        </div>
      </div>

      <div className="ua-chart-container">
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{ className: 'carbon-chart' }}
        />
      </div>

      <div className="chart-instructions">
        <div className="instruction-item">
          <span className="instruction-icon">🎯</span>
          <p><strong>How to use:</strong> Drag the green dashed line points up or down to set your monthly sustainability score targets</p>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">📊</span>
          <p><strong>Performance:</strong> Higher scores indicate better sustainability choices in your purchases</p>
        </div>
      </div>
    </div>
  );
}