export class ReactorPhysics {
  constructor() {
    this.controlRodFraction = 0.5;
    this.basePower = 1000;
    this.ambientTemp = 300;
    this.heatFactor = 0.8;
    this.coolingEffect = 150;
    this.timeStep = 1;
    this.dopplerCoefficient = -0.0002;
    this.voidCoefficient = -0.0003;
    this.powerHistory = [];
    this.temperatureHistory = [];
    this.reactivityHistory = [];
    this.timeHistory = [];
    this.maxHistoryLength = 300;
    this.cumulativePower = 0;
    this.startTime = Date.now() / 1000;
    this.powerGoal = 500000;
    this.criticalTempDelay = 0;
    this.maxCriticalDelay = 3;
    this.highPowerDelay = 0;
    this.maxPowerDelay = 4;
    this.meltdownProgress = 0;
    this.isMeltdownInProgress = false;
    this.meltdownPhase = 'none';
  }

  calculateKeff() {
    try {
      const controlRodReactivity = 0.6 - (1.2 * this.controlRodFraction); 
      
      const temperatureFeedback = this.dopplerCoefficient * this.getCurrentTemperature();
      
      const totalReactivity = controlRodReactivity + temperatureFeedback;
      
      const k_eff = 1 + totalReactivity;
      
      if (!isFinite(k_eff) || isNaN(k_eff)) {
        console.warn('Invalid k_eff calculated, returning subcritical value');
        return 0.5; 
      }
      
      return Math.max(0.01, Math.min(2.0, k_eff));
    } catch (error) {
      console.error('Error in calculateKeff:', error);
      return 0.5; 
    }
  }

  calculatePower() {
    try {
      const k_eff = this.calculateKeff();
      
      const normalOperatingPoint = 0.375;
      const rodDeviation = this.controlRodFraction - normalOperatingPoint;
      
      let rodPowerFactor;
      if (rodDeviation <= 0) {
        const withdrawalFactor = Math.abs(rodDeviation) / normalOperatingPoint;
        rodPowerFactor = 1.0 + Math.pow(withdrawalFactor, 1.5) * 2.0; 
      } else {
        const insertionFactor = rodDeviation / (1.0 - normalOperatingPoint); 
        rodPowerFactor = Math.max(0.05, 1.0 - Math.pow(insertionFactor, 1.2) * 0.95); 
      }
      
      let basePowerOutput;
      if (k_eff < 0.95) {

        basePowerOutput = Math.max(0, this.basePower * Math.pow(k_eff, this.timeStep));
      } else if (k_eff < 1.0) {

        basePowerOutput = Math.max(0, this.basePower * Math.pow(k_eff, this.timeStep * 0.5));
      } else if (k_eff > 1.0) {

        basePowerOutput = this.basePower * Math.pow(k_eff, this.timeStep * 0.5);
      } else {

        basePowerOutput = this.basePower;
      }
      
      const finalPower = basePowerOutput * rodPowerFactor;
      
      if (!isFinite(finalPower) || isNaN(finalPower)) {
        console.warn('Invalid power calculated, returning 0');
        return 0; 
      }
      
      return Math.max(0, Math.min(5000, finalPower));
    } catch (error) {
      console.error('Error in calculatePower:', error);
      return 0; 
    }
  }

  calculateTemperature() {
    try {
      const power = this.calculatePower();
      
      const controlRodCooling = this.controlRodFraction * 200; 
      
      const powerHeating = power * this.heatFactor * (1.0 + (power / 1000) * 0.5); 
      
      const temp = this.ambientTemp + powerHeating - this.coolingEffect - controlRodCooling;
      
      if (!isFinite(temp) || isNaN(temp)) {
        console.warn('Invalid temperature calculated, returning ambient');
        return this.ambientTemp; 
      }
      
      return Math.max(300, Math.min(2000, temp));
    } catch (error) {
      console.error('Error in calculateTemperature:', error);
      return this.ambientTemp; 
    }
  }

  getCurrentTemperature() {
    if (this.temperatureHistory.length > 0) {
      return this.temperatureHistory[this.temperatureHistory.length - 1];
    }
    return this.ambientTemp;
  }

  update(time) {
    try {
      if (!isFinite(time) || isNaN(time)) {
        time = Date.now() / 1000;
      }
      
      const power = this.calculatePower();
      const temperature = this.calculateTemperature();
      const keff = this.calculateKeff();
      
      if (!isFinite(power) || !isFinite(temperature) || !isFinite(keff)) {
        console.warn('Invalid calculated values detected:', { power, temperature, keff });
        return this.getSafeState(time);
      }
      
      this.cumulativePower += power;
      
      if (!isFinite(this.cumulativePower) || isNaN(this.cumulativePower)) {
        console.warn('Invalid cumulative power detected, resetting to 0');
        this.cumulativePower = 0;
      }
      
      if (this.isCritical()) {
        const rodWithdrawalFactor = 1.0 - this.controlRodFraction; 
        const sensitivityMultiplier = 1.0 + (rodWithdrawalFactor * 8.0); 
        this.criticalTempDelay += sensitivityMultiplier;
      } else {
        this.criticalTempDelay = 0;
      }
      
      if (power > 1100) {
        const rodWithdrawalFactor = 1.0 - this.controlRodFraction;
        const sensitivityMultiplier = 1.0 + (rodWithdrawalFactor * 6.0); 
        this.highPowerDelay += sensitivityMultiplier;
      } else {
        this.highPowerDelay = 0;
      }

      const rodInsertionPercent = this.controlRodFraction * 100;
      
      if (!isFinite(rodInsertionPercent) || isNaN(rodInsertionPercent)) {
        console.warn('Invalid rod insertion percent detected:', rodInsertionPercent);
        return this.getSafeState(time);
      }
      
      if (rodInsertionPercent < 35) {
        if (!this.isMeltdownInProgress) {
          this.isMeltdownInProgress = true;
          this.meltdownProgress = 0;
          this.meltdownPhase = 'initiation';
          console.log('Meltdown initiated at', rodInsertionPercent, '% rod insertion');
        }
      } else if (rodInsertionPercent >= 40) {
        if (this.isMeltdownInProgress) {
          const decreaseRate = Math.max(0, (rodInsertionPercent - 40) * 0.5); 
          this.meltdownProgress = Math.max(0, this.meltdownProgress - decreaseRate);
          
          if (this.meltdownProgress <= 0) {
            this.isMeltdownInProgress = false;
            this.meltdownPhase = 'none';
            this.meltdownProgress = 0;
            console.log('Meltdown reversed at', rodInsertionPercent, '% rod insertion');
          }
        }
      }
      if (this.isMeltdownInProgress) {
        if (!isFinite(this.meltdownProgress) || isNaN(this.meltdownProgress)) {
          console.warn('Invalid meltdown progress detected, resetting');
          this.meltdownProgress = 0;
          this.isMeltdownInProgress = false;
          this.meltdownPhase = 'none';
        } else {
          let progressRate = 0.2;
          
          const rodWithdrawalFactor = 1.0 - this.controlRodFraction; 
          const speedMultiplier = Math.min(10.0, 1.0 + (rodWithdrawalFactor * 6.0)); 
          
          const rodInsertionEffect = Math.max(0.5, 1.0 + (this.controlRodFraction * 4.0));
          
          if (this.meltdownProgress < 20) {
            this.meltdownPhase = 'initiation';
            progressRate = Math.min(10.0, Math.max(0.01, (0.1 * speedMultiplier) / rodInsertionEffect)); 
          } else if (this.meltdownProgress < 50) {
            this.meltdownPhase = 'escalation';
            progressRate = Math.min(15.0, Math.max(0.01, (0.3 * speedMultiplier) / rodInsertionEffect)); 
          } else if (this.meltdownProgress < 80) {
            this.meltdownPhase = 'critical';
            progressRate = Math.min(20.0, Math.max(0.01, (0.5 * speedMultiplier) / rodInsertionEffect));
          } else {
            this.meltdownPhase = 'catastrophic';
            progressRate = Math.min(25.0, Math.max(0.01, (1.0 * speedMultiplier) / rodInsertionEffect)); 
          }
          
          this.meltdownProgress += progressRate;
          
          this.meltdownProgress = Math.max(0, Math.min(100, this.meltdownProgress));
          
          let tempIncrease = 0;
          if (this.meltdownPhase === 'initiation') {
            tempIncrease = (this.meltdownProgress / 20) * 100; 
          } else if (this.meltdownPhase === 'escalation') {
            tempIncrease = 100 + ((this.meltdownProgress - 20) / 30) * 200; 
          } else if (this.meltdownPhase === 'critical') {
            tempIncrease = 300 + ((this.meltdownProgress - 50) / 30) * 300; 
          } else {
            tempIncrease = 600 + ((this.meltdownProgress - 80) / 20) * 400; 
          }
          
          this.ambientTemp = 300 + tempIncrease;
          
          if (this.meltdownProgress >= 100) {
            this.ambientTemp = 1000;
          }
        }
      }
      
      this.powerHistory.push(power);
      this.temperatureHistory.push(temperature);
      this.reactivityHistory.push(keff - 1);
      this.timeHistory.push(time);
      
      if (this.powerHistory.length > this.maxHistoryLength) {
        this.powerHistory.shift();
        this.temperatureHistory.shift();
        this.reactivityHistory.shift();
        this.timeHistory.shift();
      }
      
      return {
        power,
        temperature,
        keff,
        reactivity: keff - 1,
        cumulativePower: this.cumulativePower,
        powerGoal: this.powerGoal,
        timeElapsed: time - this.startTime,
        meltdownProgress: this.meltdownProgress,
        isMeltdownInProgress: this.isMeltdownInProgress,
        meltdownPhase: this.meltdownPhase
      };
      
    } catch (error) {
      console.error('Error in reactor update:', error);
      return this.getSafeState(time);
    }
  }

  scram() {
    try {
      this.controlRodFraction = 1.0; 
      
      this.isMeltdownInProgress = false;
      this.meltdownProgress = 0;
      this.meltdownPhase = 'none';
      this.criticalTempDelay = 0;
      this.highPowerDelay = 0;
      
      const power = this.calculatePower();
      const temperature = this.calculateTemperature();
      const keff = this.calculateKeff();
      const currentTime = Date.now() / 1000;
      
      this.cumulativePower += power;
      
      this.powerHistory.push(power);
      this.temperatureHistory.push(temperature);
      this.reactivityHistory.push(keff - 1);
      this.timeHistory.push(currentTime);
      
      if (this.powerHistory.length > this.maxHistoryLength) {
        this.powerHistory.shift();
        this.temperatureHistory.shift();
        this.reactivityHistory.shift();
        this.timeHistory.shift();
      }
      
      return {
        power,
        temperature,
        keff,
        reactivity: keff - 1,
        cumulativePower: this.cumulativePower,
        powerGoal: this.powerGoal,
        timeElapsed: currentTime - this.startTime,
        meltdownProgress: 0,
        isMeltdownInProgress: false,
        meltdownPhase: 'none'
      };
    } catch (error) {
      console.error('Error in SCRAM:', error);
      return this.getSafeState(Date.now() / 1000);
    }
  }

  setControlRods(fraction) {
    try {
      this.controlRodFraction = Math.max(0, Math.min(1, fraction));
    } catch (error) {
      console.error('Error in setControlRods:', error);
      this.controlRodFraction = 0.5; 
    }
  }

  getStatus() {
    try {
      const keff = this.calculateKeff();
      if (keff < 0.95) return 'subcritical';
      if (keff > 1.05) return 'supercritical';
      return 'critical';
    } catch (error) {
      console.error('Error in getStatus:', error);
      return 'subcritical'; 
    }
  }

  getSafetyStatus() {
    try {
      const temp = this.getCurrentTemperature();
      const power = this.calculatePower();
      
      if (temp > 1000) return 'meltdown'; 
      if (temp > 750) return 'critical'; 
      if (temp > 600 || power > 1200) return 'danger'; 
      if (temp > 450 || power > 900) return 'warning'; 
      return 'safe';
    } catch (error) {
      console.error('Error in getSafetyStatus:', error);
      return 'safe'; 
    }
  }

  isMeltdown() {
    return this.meltdownProgress >= 100;
  }

  isCritical() {
    try {
      return this.getCurrentTemperature() > 750;
    } catch (error) {
      console.error('Error in isCritical:', error);
      return false; 
    }
  }

  reset() {
    try {
      this.controlRodFraction = 0.5;
      this.ambientTemp = 300; 
      this.powerHistory = [];
      this.temperatureHistory = [];
      this.reactivityHistory = [];
      this.timeHistory = [];
      this.cumulativePower = 0;
      this.startTime = Date.now() / 1000;
      this.criticalTempDelay = 0;
      this.highPowerDelay = 0;
      this.meltdownProgress = 0;
      this.isMeltdownInProgress = false;
      this.meltdownPhase = 'none';
    } catch (error) {
      console.error('Error in reset:', error);
    }
  }

  hasReachedPowerGoal() {
    return this.cumulativePower >= this.powerGoal;
  }

  getGameStats() {
    try {
      return {
        cumulativePower: this.cumulativePower,
        powerGoal: this.powerGoal,
        progress: (this.cumulativePower / this.powerGoal) * 100,
        timeElapsed: (Date.now() / 1000) - this.startTime
      };
    } catch (error) {
      console.error('Error in getGameStats:', error);
      return { cumulativePower: 0, powerGoal: this.powerGoal, progress: 0, timeElapsed: 0 };
    }
  }

  getHistoryData() {
    return {
      power: this.powerHistory,
      temperature: this.temperatureHistory,
      reactivity: this.reactivityHistory,
      time: this.timeHistory
    };
  }

  getSafeState(time) {
    return {
      power: 0,
      temperature: this.ambientTemp,
      keff: 0.5,
      reactivity: -0.5,
      cumulativePower: this.cumulativePower || 0,
      powerGoal: this.powerGoal,
      timeElapsed: time - this.startTime,
      meltdownProgress: 0,
      isMeltdownInProgress: false,
      meltdownPhase: 'none'
    };
  }
}

export const getTemperatureColor = (temp) => {
  const normalized = Math.min(1, (temp - 300) / 1700);
  const red = Math.min(255, normalized * 255);
  const blue = Math.max(0, 255 - normalized * 255);
  const green = Math.max(0, 100 - normalized * 100);
  return `rgb(${red}, ${green}, ${blue})`;
};

export const getPowerColor = (power) => {
  const normalized = Math.min(1, power / 1000);
  const intensity = Math.floor(normalized * 255);
  return `rgb(${intensity}, ${intensity}, 255)`;
};

export const getReactivityColor = (reactivity) => {
  if (reactivity < -0.1) return '#ff4757'; 
  if (reactivity > 0.1) return '#2ed573'; 
  return '#ffa502'; 
}; 