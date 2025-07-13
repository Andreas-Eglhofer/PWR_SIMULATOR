import React from 'react';
import { motion } from 'framer-motion';
import { getTemperatureColor } from '../utils/physics';
import './CoolantLoop.css';

const CoolantLoop = ({ temperature, power, isRunning }) => {
  const coolantColor = getTemperatureColor(temperature);
  const flowSpeed = Math.max(1, power / 100); 

  return (
    <div className="coolant-loop">
      <h3>💧 Coolant Loop</h3>
      <div className="loop-container">
        {}
        <svg className="coolant-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          {}
          <circle
            cx="200"
            cy="150"
            r="40"
            fill="none"
            stroke={coolantColor}
            strokeWidth="3"
            className="reactor-vessel"
          />
          
          {}
          <rect
            x="320"
            y="120"
            width="60"
            height="60"
            fill="none"
            stroke={coolantColor}
            strokeWidth="3"
            className="steam-generator"
          />
          
          {}
          <path
            d="M 240 150 L 320 150"
            stroke={coolantColor}
            strokeWidth="4"
            fill="none"
            className="primary-pipe"
          />
          <path
            d="M 320 180 L 240 180"
            stroke={coolantColor}
            strokeWidth="4"
            fill="none"
            className="primary-pipe"
          />
          
          {}
          <path
            d="M 380 150 L 420 150 L 420 200 L 20 200 L 20 150 L 60 150"
            stroke={coolantColor}
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            className="secondary-pipe"
          />
          
          {}
          {isRunning && (
            <>
              <motion.circle
                cx="200"
                cy="150"
                r="2"
                fill={coolantColor}
                className="flow-particle"
                animate={{
                  cx: [200, 320, 320, 200],
                  cy: [150, 150, 180, 180]
                }}
                transition={{
                  duration: 8 / flowSpeed,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.circle
                cx="200"
                cy="180"
                r="2"
                fill={coolantColor}
                className="flow-particle"
                animate={{
                  cx: [200, 320, 320, 200],
                  cy: [180, 180, 150, 150]
                }}
                transition={{
                  duration: 8 / flowSpeed,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              />
            </>
          )}
          
          {}
          <text x="200" y="220" textAnchor="middle" className="temp-label">
            Core: {temperature.toFixed(1)}°C
          </text>
          <text x="350" y="220" textAnchor="middle" className="temp-label">
            SG: {(temperature * 0.8).toFixed(1)}°C
          </text>
        </svg>
        

        
        {}
        <div className="coolant-properties">
          <div className="property">
            <span>Temperature:</span>
            <span className="value">{temperature.toFixed(1)}°C</span>
          </div>
          <div className="property">
            <span>Flow Rate:</span>
            <span className="value">{(flowSpeed * 100).toFixed(0)}%</span>
          </div>
          <div className="property">
            <span>Pressure:</span>
            <span className="value">15.5 MPa</span>
          </div>
        </div>
      </div>
      
      {}
      <div className="coolant-notes">
        <h4>How the Coolant Loop Works:</h4>
        <ul>
          <li><strong>Primary Loop:</strong> Pressurized water circulates through the reactor core, absorbing heat from nuclear fission</li>
          <li><strong>Steam Generator:</strong> Heat transfers to the secondary loop without mixing the radioactive primary coolant</li>
          <li><strong>Secondary Loop:</strong> Water boils to steam, which drives turbines to generate electricity</li>
          <li><strong>Safety:</strong> Multiple barriers prevent radioactive material from reaching the environment</li>
        </ul>
      </div>
    </div>
  );
};

export default CoolantLoop; 