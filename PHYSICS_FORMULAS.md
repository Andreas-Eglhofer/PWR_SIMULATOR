## Overview
This document outlines the physics models and equations used in the Pressurized Water Reactor (PWR) simulator. The simulator hopes to communicate the essential dynamics of neutron chain reactions, thermal feedback, and engineered safety systems. While simplified, the models are grounded in real nuclear reactor physics to provide an educational while fun experience.
## Effective Multiplication Factor (k_eff)
**Formula:**
k_eff = 1 + rho_total
rho_total = rho_control + rho_temperature
Note: This linear approximation is valid for small deviations from criticality. The full reactivity definition is:
rho = (k_eff - 1) / k_eff
**Explanation:**
k_eff is the average number of neutrons from one fission event that go on to cause another fission.
rho_control is the reactivity change due to control rod insertion (neutron absorption).
rho_temperature represents thermal feedback — higher fuel temperature causes Doppler broadening, increasing neutron absorption and reducing reactivity.
**Simulation Impact:**
k_eff > 1: Supercritical — power increases.
k_eff = 1: Critical — power remains steady.
k_eff < 1: Subcritical — power decreases.
**Real‑World Connection:**
Reflects how control rods and temperature feedback manage reactivity in actual reactors.
## Reactor Power Output
**Formula:**
P_final = P_base * rod_power_factor
**Explanation:**
Power output evolves via neutron kinetics and reactivity feedback.
The simulator uses a simplified multiplier based on rod position.
In reality, power follows point‑kinetics equations involving delayed neutron fractions and time constants.
**Simulation Impact:**
Small rod movements can cause large, nonlinear power shifts.
Emphasizes the need for precise, gradual adjustments.
**Real‑World Connection:**
Real reactors are sensitive to small reactivity changes, especially near criticality.
## Core Temperature Calculation
**Formula:**
T_core = T_ambient + P_heating - cooling_effect - rod_insertion_effect
**Explanation:**
P_heating is proportional to reactor power (fission heat).
cooling_effect abstracts coolant flow and heat exchanger action.
rod_insertion_effect models reduced heat generation via negative reactivity.
**Simulation Impact:**
Higher power increases core temperature.
Rod insertion indirectly cools by suppressing fission.
Cooling systems stabilize temperatures.
**Real‑World Connection:**
Actual thermal‑hydraulic systems are complex; this captures the essential heat balance.
## Meltdown Progression
**Staged Model:**
Initiation – Safety margins begin to erode.
Escalation – Temperature and reactivity exceed control limits.
Critical – Damage accelerates (cladding failure, fuel damage).
Catastrophic – Full core meltdown.
**Explanation:**
SCRAM or control rod insertion can halt or reverse progression.
Urgency increases as stages advance.
**Simulation Impact:**
Players must act swiftly to avoid critical stages.
**Real‑World Connection:**
Simulates severe accident progression (cladding failure, hydrogen generation, potential containment breach).
## Reactivity Calculation
**Formula:**
rho = (k_eff - 1) / k_eff
**Explanation:**
rho > 0: Reactor is supercritical (increasing power).
rho = 0: Reactor is critical (steady power).
rho < 0: Reactor is subcritical (decreasing power).
**Simulation Impact:**
Real‑time reactivity readout guides player decisions.
**Real‑World Connection:**
Reactivity control is fundamental for safe reactor operation.
## SCRAM Function
**Explanation:**
SCRAM (Safety Control Rod Axe Man) is the emergency reactor shutdown.
Rapid full insertion of control rods drives k_eff far below 1.
Halts the fission chain reaction.
**Simulation Impact:**
Immediate shutdown to prevent or stop meltdown.
**Real‑World Connection:**
Essential safety feature; real reactors also manage decay heat post‑SCRAM (suggested addition).
## Safety Status Determination
**Explanation:**
Compares core temperature and power output to predefined thresholds.
Warning levels escalate as values approach limits:
Green: Safe
Yellow: Caution
Red: Danger
Flashing Red: Imminent meltdown
**Simulation Impact:**
Clear, escalating alerts drive proactive management.
**Real‑World Connection:**
Mimics control room alarm systems and human‑machine interfaces.
## Cumulative Power Tracking
**Explanation:**
Tracks total energy output over time (cumulative power).
Represents productivity, fuel burnup, and component aging.
Serves as a key victory/scoring metric.
**Simulation Impact:**
Encourages efficient, sustained operation.
**Real‑World Connection:**
Actual plants monitor MWd/kgU burnup for refueling and maintenance planning.
## Real‑World Physics Basis
Neutron chain reactions modeled via k_eff to reflect self‑sustaining fission.
Thermal feedback mechanisms captured by rho_temperature approximating Doppler broadening.
Reactivity control via control rods.
Delayed neutrons underlie time‑dependent kinetics and stability.
Staged accident progression mirrors real severe‑accident timelines.