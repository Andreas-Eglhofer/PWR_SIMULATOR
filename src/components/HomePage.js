import React from 'react';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage = ({ onStartSimulation }) => {
  return (
    <div className="home-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-section"
        >
          <div className="hero-content">
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-title"
            >
              ⚛️ PWR Simulator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hero-subtitle"
            >
              Educational Pressurized Water Reactor Simulation
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button className="btn btn-primary start-btn" onClick={onStartSimulation}>
                🚀 Start Simulation
              </button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="info-section"
        >
          <div className="grid grid-3">
            <div className="card info-card">
              <h3>🔬 What is a PWR?</h3>
              <p>
                A Pressurized Water Reactor (PWR) is the most common type of nuclear reactor used for electricity generation. 
                It uses ordinary water as both coolant and neutron moderator, maintaining high pressure to prevent boiling.
              </p>
            </div>

            <div className="card info-card">
              <h3>⚡ How it Works</h3>
              <p>
                Nuclear fission in the reactor core heats pressurized water, which then transfers heat to a secondary water loop 
                through steam generators, producing steam to drive turbines and generate electricity.
              </p>
            </div>

            <div className="card info-card">
              <h3>🎓 Educational Value</h3>
              <p>
                This simulator demonstrates real nuclear physics principles including reactivity control, 
                temperature feedback, and emergency shutdown procedures in an interactive, safe environment.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="features-section"
        >
          <h2>🔧 Simulation Features</h2>
          <div className="grid grid-2">
            <div className="card feature-card">
              <h4>🎛️ Control Rod Simulation</h4>
              <p>Adjust control rod insertion (0-100%) to control reactor reactivity and power output using real physics equations.</p>
            </div>
            <div className="card feature-card">
              <h4>🌡️ Core Temperature Calculation</h4>
              <p>Real-time temperature calculations based on reactor power with realistic heat transfer physics.</p>
            </div>
            <div className="card feature-card">
              <h4>💧 Coolant Loop Animation</h4>
              <p>Visual representation of coolant flow with color changes based on temperature and animated circulation.</p>
            </div>
            <div className="card feature-card">
              <h4>🚨 SCRAM Function</h4>
              <p>Emergency shutdown button that immediately inserts all control rods and stops the nuclear reaction.</p>
            </div>
            <div className="card feature-card">
              <h4>📊 Real-Time Graphs</h4>
              <p>Live charts showing power output and core temperature over time with physics-based updates.</p>
            </div>
            <div className="card feature-card">
              <h4>🎯 Educational Interface</h4>
              <p>Student-friendly design with clear explanations and real-time feedback on nuclear physics concepts.</p>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="equations-section"
        >
          <h2>🔬 How It Works - Physics Equations</h2>
          <div className="equations-grid">
            <div className="equation-card">
              <h4>Reactivity Control</h4>
              <div className="equation">
                <span>k<sub>eff</sub> = 1 + (0.5 - control_rod_fraction) + α<sub>T</sub> × T</span>
              </div>
              <p>Effective multiplication factor depends on control rod position and temperature feedback</p>
            </div>
            
            <div className="equation-card">
              <h4>Power Output</h4>
              <div className="equation">
                <span>P(t) = P<sub>0</sub> × k<sub>eff</sub><sup>t</sup></span>
              </div>
              <p>Reactor power changes exponentially based on k_eff value</p>
            </div>
            
            <div className="equation-card">
              <h4>Core Temperature</h4>
              <div className="equation">
                <span>T = T<sub>ambient</sub> + P × h<sub>factor</sub> - cooling</span>
              </div>
              <p>Temperature rises with power output and is moderated by cooling systems</p>
            </div>
            
            <div className="equation-card">
              <h4>SCRAM Logic</h4>
              <div className="equation">
                <span>control_rods = 100% → k<sub>eff</sub> → 0.1</span>
              </div>
              <p>Emergency shutdown inserts all control rods, making reactor subcritical</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="footer-section"
        >
          <p className="footer-text">
            Built for educational purposes • No backend required • Runs entirely in your browser
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 