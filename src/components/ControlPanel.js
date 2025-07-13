import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ControlPanel.css';

const ControlPanel = ({ controlRodPosition, onControlRodChange, onScram, simulationState, isMeltdown, isSuccess, isRunning }) => {
  const [sliderValue, setSliderValue] = useState(controlRodPosition);
  
  const debouncedControlRodChange = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onControlRodChange(value);
        }, 50); 
      };
    })(),
    [onControlRodChange]
  );

  useEffect(() => {
    setSliderValue(controlRodPosition);
  }, [controlRodPosition]);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value); 
    debouncedControlRodChange(value); 
  };

  const getControlRodStatus = () => {
    if (controlRodPosition < 20) return 'fully withdrawn';
    if (controlRodPosition > 80) return 'fully inserted';
    return 'partially inserted';
  };

  const getReactivityDescription = () => {
    const reactivity = simulationState.reactivity;
    if (reactivity < -0.1) return 'Strong negative reactivity - reactor shutting down';
    if (reactivity < -0.01) return 'Negative reactivity - power decreasing';
    if (reactivity < 0.01) return 'Near critical - stable operation';
    if (reactivity < 0.1) return 'Positive reactivity - power increasing';
    return 'Strong positive reactivity - rapid power increase';
  };

  return (
    <div className="control-panel">
      <h3>🎛️ Control Panel</h3>
      
      {}
      <div className="control-section">
        <h4>Control Rods</h4>
        <div className="slider-container">
          <div className="slider-labels">
            <span>Fully Withdrawn</span>
            <span>Fully Inserted</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className={`control-slider ${isMeltdown || isSuccess || !isRunning ? 'disabled' : ''}`}
            disabled={isMeltdown || isSuccess || !isRunning}
            style={{
              background: `linear-gradient(to right, #2ed573 0%, #ffa502 ${sliderValue}%, #ff4757 ${sliderValue}%, #ff4757 100%)`
            }}
          />
          <div className="slider-value">
            {sliderValue}% Inserted
          </div>
          <div className="rod-status">
            Status: {getControlRodStatus()}
            {!isRunning && !isMeltdown && !isSuccess && (
              <span className="pause-indicator"> (PAUSED)</span>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="control-section">
        <h4>Emergency Controls</h4>
        <motion.button
          className="btn btn-danger scram-btn"
          onClick={onScram}
          disabled={isMeltdown || isSuccess}
          whileHover={!isMeltdown && !isSuccess ? { scale: 1.05 } : {}}
          whileTap={!isMeltdown && !isSuccess ? { scale: 0.95 } : {}}
        >
          🚨 SCRAM
        </motion.button>
        <p className="scram-description">
          Emergency shutdown - immediately inserts all control rods
        </p>
      </div>

      {}
      <div className="control-section">
        <h4>Reactivity Analysis</h4>
        <div className="reactivity-info">
          <div className="info-row">
            <span>k_eff:</span>
            <span className="value">{simulationState.keff.toFixed(3)}</span>
          </div>
          <div className="info-row">
            <span>Reactivity:</span>
            <span className="value">{(simulationState.reactivity * 100).toFixed(2)}%</span>
          </div>
          <div className="info-row">
            <span>Status:</span>
            <span className={`value status-${simulationState.status}`}>
              {simulationState.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="reactivity-description">
          {getReactivityDescription()}
        </div>
      </div>

      {}
      <div className="control-section">
        <h4>📚 Physics Notes</h4>
        <div className="physics-notes">
          <p>
            <strong>Control Rods:</strong> Absorb neutrons to control the nuclear chain reaction. 
            Inserting rods increases negative reactivity.
          </p>
          <p>
            <strong>k_eff:</strong> Effective multiplication factor. k_eff = 1.0 means critical, 
            &lt; 1.0 subcritical, &gt; 1.0 supercritical.
          </p>
          <p>
            <strong>Temperature Feedback:</strong> Higher temperatures increase neutron absorption, 
            providing natural safety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 