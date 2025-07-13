import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReactorPhysics } from '../utils/physics';
import ControlPanel from './ControlPanel';
import OutputPanel from './OutputPanel';
import CoolantLoop from './CoolantLoop';
import './SimulatorPage.css';

const SimulatorPage = ({ onBackToHome }) => {
  const [reactor] = useState(new ReactorPhysics());
  const [simulationState, setSimulationState] = useState({
    power: 0,
    temperature: 300,
    keff: 1.0,
    reactivity: 0,
    status: 'subcritical',
    safetyStatus: 'safe',
    cumulativePower: 0,
    powerGoal: 2000000,
    timeElapsed: 0,
    meltdownProgress: 0,
    isMeltdownInProgress: false,
    meltdownPhase: 'none'
  });
  const [isRunning, setIsRunning] = useState(true);
  const [controlRodPosition, setControlRodPosition] = useState(50);
  const [isMeltdown, setIsMeltdown] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  const [showScramIndicator, setShowScramIndicator] = useState(false);
  const animationRef = useRef();

  useEffect(() => {
    const runSimulation = () => {
      if (!isRunning) return;

      let criticalReached = false;
      let powerGoalReached = false;
      let newSafetyStatus = 'safe';

      try {
        const currentTime = Date.now() / 1000;
        const newState = reactor.update(currentTime);
        
        if (!newState || typeof newState !== 'object') {
          console.error('Invalid reactor state returned:', newState);
          return;
        }
        
        newSafetyStatus = reactor.getSafetyStatus();
        criticalReached = newSafetyStatus === 'critical';
        powerGoalReached = reactor.hasReachedPowerGoal();
        
        setSimulationState({
          power: newState.power || 0,
          temperature: newState.temperature || 300,
          keff: newState.keff || 1.0,
          reactivity: newState.reactivity || 0,
          status: reactor.getStatus(),
          safetyStatus: newSafetyStatus,
          cumulativePower: newState.cumulativePower || 0,
          powerGoal: newState.powerGoal || 2000000,
          timeElapsed: newState.timeElapsed || 0,
          meltdownProgress: newState.meltdownProgress || 0,
          isMeltdownInProgress: newState.isMeltdownInProgress || false,
          meltdownPhase: newState.meltdownPhase || 'none'
        });
      } catch (error) {
        console.error('Error in simulation loop:', error);
      }

      if (criticalReached && !showCriticalWarning) {
        setShowCriticalWarning(true);
      } else if (!criticalReached) {
        setShowCriticalWarning(false);
      }

      if (reactor.isMeltdown() && !isMeltdown) {
        setIsMeltdown(true);
        setIsRunning(false);
      }

      if (powerGoalReached && !isSuccess) {
        setIsSuccess(true);
        setIsRunning(false);
      }

      animationRef.current = requestAnimationFrame(runSimulation);
    };

    animationRef.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [reactor, isRunning, isMeltdown, isSuccess, showCriticalWarning]);

  const handleControlRodChange = (value) => {
    const fraction = value / 100;
    setControlRodPosition(value);
    reactor.setControlRods(fraction);
  };

  const handleScram = () => {
    try {
      setShowScramIndicator(true);
      
      const newState = reactor.scram();
      setControlRodPosition(100);
      
      if (newState && typeof newState === 'object') {
        setSimulationState({
          power: newState.power || 0,
          temperature: newState.temperature || 300,
          keff: newState.keff || 1.0,
          reactivity: newState.reactivity || 0,
          status: reactor.getStatus(),
          safetyStatus: reactor.getSafetyStatus(),
          cumulativePower: newState.cumulativePower || 0,
          powerGoal: newState.powerGoal || 500000,
          timeElapsed: newState.timeElapsed || 0,
          meltdownProgress: newState.meltdownProgress || 0,
          isMeltdownInProgress: newState.isMeltdownInProgress || false,
          meltdownPhase: newState.meltdownPhase || 'none'
        });
      }
      
      setTimeout(() => {
        setShowScramIndicator(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error in SCRAM:', error);
      setShowScramIndicator(false);
    }
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    reactor.reset();
    setControlRodPosition(50);
    setSimulationState({
      power: 0,
      temperature: 300,
      keff: 1.0,
      reactivity: 0,
      status: 'subcritical',
      safetyStatus: 'safe',
      cumulativePower: 0,
      powerGoal: 500000,
      timeElapsed: 0,
      meltdownProgress: 0,
      isMeltdownInProgress: false,
      meltdownPhase: 'none'
    });
    setIsRunning(true);
    setIsMeltdown(false);
    setIsSuccess(false);
    setShowCriticalWarning(false);
    setShowScramIndicator(false);
  };

  return (
    <div className={`simulator-page ${isMeltdown ? 'meltdown-mode' : ''} ${isSuccess ? 'success-mode' : ''}`}>
      <div className="container">
        {}
        {isMeltdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="meltdown-overlay"
          >
            <div className="meltdown-content">
              <h2 className="meltdown-title">⚠️ MELTDOWN</h2>
              <button className="btn btn-danger meltdown-restart" onClick={resetSimulation}>
                🔄 Restart Simulation
              </button>
            </div>
          </motion.div>
        )}

        {}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="success-overlay"
          >
            <div className="success-content">
              <h2 className="success-title">🎉 Mission Complete!</h2>
              
              {/* Prominent Time Display */}
              <div className="completion-time">
                <div className="time-label">COMPLETION TIME</div>
                <div className="time-value">{simulationState.timeElapsed.toFixed(1)}</div>
                <div className="time-unit">SECONDS</div>
              </div>
              
              <p className="success-message">
                You successfully generated {simulationState.powerGoal.toFixed(0)} MW-s of power!
              </p>
              
              <div className="success-stats">
                <div>Total Power Generated: {simulationState.cumulativePower.toFixed(0)} MW-s</div>
                <div>Power Goal: {simulationState.powerGoal.toFixed(0)} MW-s</div>
                <div>Final Temperature: {simulationState.temperature.toFixed(1)}°C</div>
                <div>Average Power: {(simulationState.cumulativePower / simulationState.timeElapsed).toFixed(1)} MW</div>
              </div>
              
              <button className="btn btn-primary success-restart" onClick={resetSimulation}>
                🔄 Play Again
              </button>
            </div>
          </motion.div>
        )}

        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="simulator-header"
        >
          <button className="btn btn-secondary back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <h1>⚛️ PWR Reactor Simulator</h1>
          <div className="header-controls">
            <button 
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleSimulation}
              disabled={isMeltdown || isSuccess}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button className="btn btn-secondary" onClick={resetSimulation}>
              🔄 Reset
            </button>
          </div>
        </motion.div>

        {}
        {showScramIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="scram-indicator"
          >
            <div className="scram-content">
              <div className="scram-icon">🚨</div>
              <div className="scram-text">SCRAM ACTIVATED</div>
              <div className="scram-subtext">Emergency Shutdown in Progress</div>
            </div>
          </motion.div>
        )}

        {}
        <div className="simulation-layout">
          {}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="left-panel"
          >
            <ControlPanel
              controlRodPosition={controlRodPosition}
              onControlRodChange={handleControlRodChange}
              onScram={handleScram}
              simulationState={simulationState}
              isMeltdown={isMeltdown}
              isSuccess={isSuccess}
              isRunning={isRunning}
            />
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="center-panel"
          >
            <div className="reactor-visualization">
              <h3>Reactor Core</h3>
              <div className={`reactor-core ${simulationState.safetyStatus} ${isMeltdown ? 'meltdown' : ''}`}>
                <div 
                  className="core-glow"
                  style={{
                    boxShadow: `0 0 ${Math.max(10, simulationState.power / 10)}px ${isMeltdown ? '#ff0000' : getTemperatureColor(simulationState.temperature)}`
                  }}
                />
                <div className="core-info">
                  <div className="core-stat">
                    <span>Power:</span>
                    <span className="value">{simulationState.power.toFixed(1)} MW</span>
                  </div>
                  <div className="core-stat">
                    <span>Temp:</span>
                    <span className="value">{simulationState.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="core-stat">
                    <span>k_eff:</span>
                    <span className="value">{simulationState.keff.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              
              <CoolantLoop 
                temperature={simulationState.temperature}
                power={simulationState.power}
                isRunning={isRunning}
              />
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="right-panel"
          >
            <OutputPanel
              simulationState={simulationState}
              reactor={reactor}
            />
          </motion.div>
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="status-bar"
        >
          <div className={`status-indicator ${simulationState.status}`}>
            Status: {simulationState.status.toUpperCase()}
          </div>
          <div className={`safety-indicator ${simulationState.safetyStatus}`}>
            Safety: {simulationState.safetyStatus.toUpperCase()}
          </div>
          <div className="reactivity-display">
            Reactivity: {(simulationState.reactivity * 100).toFixed(2)}%
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="game-progress"
        >
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min(100, (simulationState.cumulativePower / simulationState.powerGoal) * 100)}%` }}
            />
          </div>
          <div className="progress-text">
            Power Goal: {simulationState.cumulativePower.toFixed(0)} / {simulationState.powerGoal.toFixed(0)} MW-s
            ({((simulationState.cumulativePower / simulationState.powerGoal) * 100).toFixed(1)}%)
          </div>
          <div className="time-elapsed">
            Time: {simulationState.timeElapsed.toFixed(1)}s
          </div>
        </motion.div>

        {}
        {simulationState.isMeltdownInProgress && simulationState.meltdownProgress >= 70 && !isMeltdown && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="corner-warning meltdown-progress-warning"
          >
            <div className="meltdown-progress-header">
              🔥 {simulationState.meltdownProgress.toFixed(0)}%
            </div>
            <div className="meltdown-phase-label">
              {simulationState.meltdownPhase.charAt(0).toUpperCase() + simulationState.meltdownPhase.slice(1)}
            </div>
            <div className="meltdown-progress-bar">
              <div 
                className="meltdown-progress-fill"
                style={{ width: `${simulationState.meltdownProgress}%` }}
              />
            </div>
          </motion.div>
        )}

        {}
        {!isMeltdown && !simulationState.isMeltdownInProgress && (
          <>
            {}
            {simulationState.temperature > 855 && simulationState.temperature <= 900 && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="corner-warning temperature-warning"
              >
                🔥 {simulationState.temperature.toFixed(0)}°C
              </motion.div>
            )}
            
            {}
            {simulationState.power > 1045 && simulationState.power <= 1100 && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="corner-warning power-warning"
              >
                ⚡ {simulationState.power.toFixed(0)} MW
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const getTemperatureColor = (temp) => {
  const normalized = Math.min(1, (temp - 300) / 1700);
  const red = Math.min(255, normalized * 255);
  const blue = Math.max(0, 255 - normalized * 255);
  const green = Math.max(0, 100 - normalized * 100);
  return `rgb(${red}, ${green}, ${blue})`;
};

export default SimulatorPage; 