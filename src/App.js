import React, { useState } from 'react';
import HomePage from './components/HomePage';
import SimulatorPage from './components/SimulatorPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateToSimulator = () => {
    setCurrentPage('simulator');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {currentPage === 'home' ? (
        <HomePage onStartSimulation={navigateToSimulator} />
      ) : (
        <SimulatorPage onBackToHome={navigateToHome} />
      )}
    </div>
  );
}

export default App; 