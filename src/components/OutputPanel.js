import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './OutputPanel.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OutputPanel = ({ simulationState, reactor }) => {
  const powerChartRef = useRef(null);
  const tempChartRef = useRef(null);
  const reactivityChartRef = useRef(null);

  const getChartData = React.useCallback((dataType) => {
    const history = reactor.getHistoryData();
    const data = history[dataType] || [];
    const timeLabels = history.time.map(t => {
      const date = new Date(t * 1000);
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    });

    let backgroundColor, borderColor, label;
    
    switch (dataType) {
      case 'power':
        backgroundColor = 'rgba(0, 212, 255, 0.1)';
        borderColor = '#00d4ff';
        label = 'Power Output (MW)';
        break;
      case 'temperature':
        backgroundColor = 'rgba(255, 71, 87, 0.1)';
        borderColor = '#ff4757';
        label = 'Core Temperature (°C)';
        break;
      case 'reactivity':
        backgroundColor = 'rgba(255, 165, 2, 0.1)';
        borderColor = '#ffa502';
        label = 'Reactivity';
        break;
      default:
        backgroundColor = 'rgba(255, 255, 255, 0.1)';
        borderColor = '#ffffff';
        label = 'Data';
    }

    return {
      labels: timeLabels,
      datasets: [
        {
          label,
          data,
          borderColor,
          backgroundColor,
          fill: true,
          borderWidth: 2
        }
      ]
    };
  }, [reactor]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00d4ff',
        bodyColor: '#ffffff',
        borderColor: '#00d4ff',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    elements: {
      point: {
        radius: 0
      },
      line: {
        tension: 0.4
      }
    }
  };



  useEffect(() => {
    if (powerChartRef.current && tempChartRef.current && reactivityChartRef.current) {
      const powerChart = powerChartRef.current;
      const tempChart = tempChartRef.current;
      const reactivityChart = reactivityChartRef.current;
      
      const powerData = getChartData('power');
      powerChart.data = powerData;
      powerChart.update('none');
      
      const tempData = getChartData('temperature');
      tempChart.data = tempData;
      tempChart.update('none');
      
      const reactivityData = getChartData('reactivity');
      reactivityChart.data = reactivityData;
      reactivityChart.update('none');
    }
  }, [simulationState, getChartData]);

  return (
    <div className="output-panel">
      <h3>📊 Real-Time Data</h3>
      
      {}
      <div className="current-values">
        <div className="value-card power-card">
          <div className="value-icon">⚡</div>
          <div className="value-content">
            <div className="value-label">Power Output</div>
            <div className="value-number">{simulationState.power.toFixed(1)} MW</div>
            <div className="value-unit">Thermal Power</div>
          </div>
        </div>
        
        <div className="value-card temp-card">
          <div className="value-icon">🌡️</div>
          <div className="value-content">
            <div className="value-label">Core Temperature</div>
            <div className="value-number">{simulationState.temperature.toFixed(1)}°C</div>
            <div className="value-unit">Average Core Temp</div>
          </div>
        </div>
        
        <div className="value-card reactivity-card">
          <div className="value-icon">⚛️</div>
          <div className="value-content">
            <div className="value-label">Reactivity</div>
            <div className="value-number">{(simulationState.reactivity * 100).toFixed(2)}%</div>
            <div className="value-unit">Neutron Balance</div>
          </div>
        </div>
      </div>

      {/* Power Chart */}
      <div className="chart-container">
        <h4>Power Output Over Time</h4>
        <div className="chart-wrapper">
          <Line
            ref={powerChartRef}
            data={getChartData('power')}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: Math.max(1500, simulationState.power * 1.5),
                  min: 0
                }
              }
            }}
          />
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="chart-container">
        <h4>Core Temperature Over Time</h4>
        <div className="chart-wrapper">
          <Line
            ref={tempChartRef}
            data={getChartData('temperature')}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: false,
                  min: Math.max(250, simulationState.temperature - 100),
                  max: Math.min(1200, simulationState.temperature + 100)
                }
              }
            }}
          />
        </div>
      </div>

      {/* Reactivity Chart */}
      <div className="chart-container">
        <h4>Reactivity Over Time</h4>
        <div className="chart-wrapper">
          <Line
            ref={reactivityChartRef}
            data={getChartData('reactivity')}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  min: -0.5,
                  max: 0.5,
                  ticks: {
                    callback: function(value) {
                      return (value * 100).toFixed(1) + '%';
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Data Analysis */}
      <div className="data-analysis">
        <h4>📈 Data Analysis</h4>
        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="analysis-label">Peak Power:</span>
            <span className="analysis-value">
              {Math.max(...reactor.getHistoryData().power).toFixed(1)} MW
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Peak Temp:</span>
            <span className="analysis-value">
              {Math.max(...reactor.getHistoryData().temperature).toFixed(1)}°C
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Peak Reactivity:</span>
            <span className="analysis-value">
              {(Math.max(...reactor.getHistoryData().reactivity) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Avg Power:</span>
            <span className="analysis-value">
              {(reactor.getHistoryData().power.reduce((a, b) => a + b, 0) / reactor.getHistoryData().power.length || 0).toFixed(1)} MW
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Avg Temp:</span>
            <span className="analysis-value">
              {(reactor.getHistoryData().temperature.reduce((a, b) => a + b, 0) / reactor.getHistoryData().temperature.length || 20).toFixed(1)}°C
            </span>
          </div>
          <div className="analysis-item">
            <span className="analysis-label">Avg Reactivity:</span>
            <span className="analysis-value">
              {((reactor.getHistoryData().reactivity.reduce((a, b) => a + b, 0) / reactor.getHistoryData().reactivity.length || 0) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel; 