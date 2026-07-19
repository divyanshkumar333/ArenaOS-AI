import { create } from 'zustand'

export type Status = 'normal' | 'warning' | 'critical'

export interface Zone {
  id: string
  name: string
  occupancy: number
  status: Status
  baseline: number
}

export interface Evidence {
  queueLength?: number
  averageWait?: number
  exitCapacity?: number
  predictedOverflow?: number
  supportingData?: string[]
}

export interface IncidentLog {
  id: string
  timestamp: string
  zone_id: string
  zone_name: string
  incident_type: string
  severity: string
  explanation: string
  recommended_action: string
  confidence: number
  evidence?: Evidence
}

export interface MitigationOption {
  action: string
  cost: 'Low' | 'Medium' | 'High'
  responseTime: 'Fast' | 'Medium' | 'Slow'
  riskReduction: number
}

export interface PredictedAnomaly {
  id: string
  zone_id: string
  zone_name: string
  time_offset: number // in minutes
  probability: number // 0-100
  severity: Status
  analyzing: string[]
  inference: string
  cause: string
  options: MitigationOption[]
  resolved: boolean
  evidence?: Evidence
}

export interface Resources {
  drones: number
  ambulances: number
  securityTeams: number
  maintenanceCrews: number
}

// Detection objects used across UI panels
export interface Detection {
  id: string
  type: 'person' | 'vehicle'
  location: string
  confidence: number // 0-100
  status: 'tracking' | 'lost'
}

export interface BmsData {
  hvacLoad: number
  powerUsage: number
  carbonEmissions: number
}

export interface Snapshot {
  timestamp: number
  zones: Zone[]
  activeIncident: IncidentLog | null
  coreLoad: number
  networkLatency: number
  bandwidth: number
  telemetryHistory: number[]
  predictions: PredictedAnomaly[]
  systemStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL',
  bmsData: BmsData,
  detections: Detection[],
}

interface ZoneState {
  zones: Zone[]
  logs: IncidentLog[]
  activeIncident: IncidentLog | null
  isConnected: boolean
  isMuted: boolean
  
  showDecisionMatrix: boolean
  setShowDecisionMatrix: (show: boolean) => void
  
  showImpactReport: boolean
  setShowImpactReport: (show: boolean) => void
  
  activeTab: string
  setActiveTab: (tab: string) => void
  
  // Simulated Live Telemetry
  coreLoad: number
  networkLatency: number
  bandwidth: number
  telemetryHistory: number[]
  predictions: PredictedAnomaly[]
  systemStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL'
  bmsData: BmsData
  
  // Historical Scrubbing
  liveZones: Zone[]
  liveActiveIncident: IncidentLog | null
  historicalSnapshots: Snapshot[]
  playbackMode: boolean
  playbackIndex: number
  setPlaybackMode: (mode: boolean) => void
  setPlaybackIndex: (index: number) => void
  
  predictiveTimeOffset: number
  setPredictiveTimeOffset: (offset: number) => void
  
  // New detection state
  detections: Detection[]
  setDetections: (dets: Detection[]) => void
  
  // Enterprise Operations
  resources: Resources
  setResources: (res: Partial<Resources>) => void
  incidentHistory: { time: string, log: string }[]
  addIncidentHistory: (log: string) => void
  
  // Predictive Authorizations
  authorizeAction: (anomalyId: string, optionIdx: number) => void
  
  cctvTakeover: string | null
  setCctvTakeover: (camId: string | null) => void
  
  setZones: (zones: Zone[]) => void
  addLog: (log: IncidentLog) => void
  setActiveIncident: (incident: IncidentLog | null) => void
  setIsConnected: (connected: boolean) => void
  toggleMute: () => void
  
  // Simulation Engine
  _simTimer: NodeJS.Timeout | null
  startSimulation: () => void
  stopSimulation: () => void

  // Demo Mode 2.0
  demoMode: boolean
  demoStage: number // 0 = idle, 1-10 = scenes
  demoTick: number
  isRecordingMode: boolean
  setIsRecordingMode: (mode: boolean) => void
  _demoTimer: NodeJS.Timeout | null
  runDemo: () => void
  pauseDemo: () => void
  resumeDemo: (isInitialStart?: boolean) => void
  stopDemo: () => void
  skipScene: () => void

  // Cinematic Camera
  primaryDronePosition: [number, number, number] | null
  primaryDroneTarget: [number, number, number] | null
  setPrimaryDroneState: (pos: [number, number, number], target: [number, number, number]) => void
}

const DEFAULT_PREDICTIONS: PredictedAnomaly[] = [
  { 
    id: 'pred_gate3', zone_id: 'zone_1', zone_name: 'Gate 3 Ingress', time_offset: 14, probability: 92, severity: 'critical',
    analyzing: ['Crowd density: 88%', 'Ticket scans: +142/min', 'Weather: Clear'],
    inference: 'High probability of severe Gate 3 congestion.',
    cause: 'Simultaneous halftime movement converging on East Concourse.',
    evidence: {
      queueLength: 382,
      averageWait: 17,
      exitCapacity: 210,
      predictedOverflow: 6,
      supportingData: ['CCTV Feed: CAM-01', 'Gate Sensors: G3-A to G3-D', 'Historical Match Data', 'Ticket Scans']
    },
    options: [
      { action: 'Deploy Drone 2', cost: 'Low', responseTime: 'Fast', riskReduction: 61 },
      { action: 'Open Overflow Gate 4', cost: 'Medium', responseTime: 'Medium', riskReduction: 83 },
      { action: 'Deploy Security Team', cost: 'High', responseTime: 'Fast', riskReduction: 91 }
    ],
    resolved: false
  },
  { 
    id: 'pred_med', zone_id: 'zone_2', zone_name: 'Section 112', time_offset: 30, probability: 85, severity: 'warning',
    analyzing: ['Heatmap: High', 'Flow rate: Stagnant', 'Historical: 12% incident rate'],
    inference: 'Potential medical incident due to overcrowding in Section 112.',
    cause: 'Dense packing blocking aisle access.',
    options: [
      { action: 'Dispatch Med Cart', cost: 'Medium', responseTime: 'Fast', riskReduction: 75 },
      { action: 'Pre-deploy EMT Unit Alpha', cost: 'High', responseTime: 'Fast', riskReduction: 90 }
    ],
    resolved: false
  }
]

export const useZoneStore = create<ZoneState>((set, get) => ({
  zones: [],
  logs: [],
  activeIncident: null,
  detections: [],
  isConnected: false,
  isMuted: false,
  
  showDecisionMatrix: false,
  setShowDecisionMatrix: (show) => set({ showDecisionMatrix: show }),
  
  showImpactReport: false,
  setShowImpactReport: (show) => set({ showImpactReport: show }),
  
  activeTab: 'Overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  coreLoad: 35,
  networkLatency: 1.2,
  bandwidth: 8.4,
  telemetryHistory: Array(30).fill(35),
  predictions: DEFAULT_PREDICTIONS,
  systemStatus: 'OPTIMAL',
  bmsData: {
    hvacLoad: 42,
    powerUsage: 12.4,
    carbonEmissions: 2.1
  },
  
  // Historical Scrubbing
  liveZones: [],
  liveActiveIncident: null,
  historicalSnapshots: [],
  playbackMode: false,
  playbackIndex: 0,
  
  predictiveTimeOffset: 0,
  setPredictiveTimeOffset: (offset) => set({ predictiveTimeOffset: offset }),
  
  resources: { drones: 4, ambulances: 2, securityTeams: 8, maintenanceCrews: 3 },
  setResources: (res) => set(state => ({ resources: { ...state.resources, ...res } })),
  
  incidentHistory: [],
  addIncidentHistory: (log) => set(state => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    return { incidentHistory: [{ time, log }, ...state.incidentHistory] }
  }),
  
  primaryDronePosition: null,
  primaryDroneTarget: null,
  setPrimaryDroneState: (pos, target) => set({ primaryDronePosition: pos, primaryDroneTarget: target }),
  authorizeAction: (anomalyId, optionIdx) => set(state => {
    const p = state.predictions.find(a => a.id === anomalyId)
    if (p) {
      const action = p.options[optionIdx].action
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const log = `AUTHORIZED: ${action} for ${p.zone_name}`
      return {
        predictions: state.predictions.map(a => a.id === anomalyId ? { ...a, resolved: true, probability: 10, severity: 'normal' } : a),
        incidentHistory: [{ time, log }, ...state.incidentHistory]
      }
    }
    return state
  }),
  
  cctvTakeover: null,
  setCctvTakeover: (camId) => set({ cctvTakeover: camId }),
  
  setDetections: (detections) => set({ detections }),
  
  setPlaybackMode: (mode: boolean) => {
    if (!mode) {
      // Restore to live
      const state = get();
      const lastSnap = state.historicalSnapshots[state.historicalSnapshots.length - 1];
      if (lastSnap) {
        set({
          playbackMode: false,
          zones: state.liveZones,
          activeIncident: state.liveActiveIncident,
          detections: state.detections,
          coreLoad: lastSnap.coreLoad,
          networkLatency: lastSnap.networkLatency,
          bandwidth: lastSnap.bandwidth,
          telemetryHistory: lastSnap.telemetryHistory,
          predictions: lastSnap.predictions,
          systemStatus: lastSnap.systemStatus,
          bmsData: lastSnap.bmsData
        });
      } else {
        set({ playbackMode: false });
      }
    } else {
      // Enter playback mode
      set({ 
        playbackMode: true,
        playbackIndex: Math.max(0, get().historicalSnapshots.length - 1)
      });
    }
  },
  
  setPlaybackIndex: (index: number) => {
    const state = get();
    if (!state.playbackMode) return;
    
    const snap = state.historicalSnapshots[index];
    if (snap) {
      set({
        playbackIndex: index,
        zones: snap.zones,
        activeIncident: snap.activeIncident,
        detections: snap.detections,
        coreLoad: snap.coreLoad,
        networkLatency: snap.networkLatency,
        bandwidth: snap.bandwidth,
        telemetryHistory: snap.telemetryHistory,
        predictions: snap.predictions,
        systemStatus: snap.systemStatus,
        bmsData: snap.bmsData
      });
    }
  },
  
  _simTimer: null,

  // ── Cinematic Demo Mode 2.0 ────────────────────────────────────────────────────────────
  demoMode: false,
  demoStage: 0,
  demoTick: 0,
  isRecordingMode: false,
  setIsRecordingMode: (mode) => set({ isRecordingMode: mode }),
  _demoTimer: null,

  runDemo: () => {
    if (get().demoMode) return
    
    // Reset state before starting
    const st = get()
    st.setActiveIncident(null)
    st.setCctvTakeover(null)
    st.setPredictiveTimeOffset(0)
    st.setShowImpactReport(false)
    st.setShowDecisionMatrix(false)
    const baseZones = st.zones.map(z => ({ ...z, occupancy: z.baseline, status: 'normal' as const }))
    st.setZones(baseZones)
    set({ demoMode: true, demoStage: 1, demoTick: 0, incidentHistory: [] })

    get().resumeDemo(true)
  },

  pauseDemo: () => {
    const timer = get()._demoTimer
    if (timer) clearInterval(timer)
    set({ _demoTimer: null })
  },

  resumeDemo: (isInitialStart = false) => {
    if (!isInitialStart && get()._demoTimer) return // already running
    
    const mkIncident = (
      id: string, type: string, zoneId: string, zoneName: string,
      severity: string, confidence: number, explanation: string, action: string,
      evidence?: Evidence
    ): IncidentLog => ({
      id, timestamp: new Date().toISOString(), incident_type: type,
      zone_id: zoneId, zone_name: zoneName, severity, confidence, explanation,
      recommended_action: action, evidence
    })

    const timer = setInterval(() => {
      const state = get()
      if (!state.demoMode) {
        clearInterval(timer)
        return
      }

      const t = state.demoTick

      // ==========================================
      // PHASE 1: System Boot (0 - 15s)
      // ==========================================
      if (t === 0) {
        set({ demoStage: 1, systemStatus: 'OPTIMAL' })
        state.addIncidentHistory("ArenaOS Core Boot Sequence Initiated.")
      }
      if (t === 5) state.addIncidentHistory("Digital Twin Syncing... Connected.")
      if (t === 10) state.addIncidentHistory("Multi-Agent Swarm initialized. Awaiting triggers.")

      // ==========================================
      // PHASE 2: Normal Operations (15 - 30s)
      // ==========================================
      if (t === 15) {
        set({ demoStage: 2 })
        state.addIncidentHistory("Monitoring... All gates operating at nominal capacity.")
      }
      if (t === 22) state.addIncidentHistory("Weather clear. 68,000 attendees confirmed inside.")

      // ==========================================
      // PHASE 3: Incident 1 - Gate 3 Congestion (30 - 60s)
      // ==========================================
      if (t === 30) {
        set({ demoStage: 3 })
        state.addIncidentHistory("⚠ Crowd Agent detects density anomaly near Gate 3.")
        const rising = state.zones.map(z => z.id === 'zone_1' ? { ...z, occupancy: 78, status: 'warning' as const } : z)
        state.setZones(rising)
      }
      if (t === 38) {
        state.addIncidentHistory("AI ENGINE: Running predictive flow simulation...")
        const inc = mkIncident('demo_gate3_oc', 'Gate 3 Congestion', 'zone_1', 'Gate 3', 'warning', 0.85, 'Initial verification required. Dispatching Drone CAM-01.', 'Dispatching Drone')
        state.setActiveIncident(inc)
      }
      if (t === 45) {
        state.setCctvTakeover('CAM-01') // Drone flies in
      }
      if (t === 50) {
        const zones = state.zones.map(z => z.id === 'zone_1' ? { ...z, occupancy: 94, status: 'critical' as const } : z)
        state.setZones(zones)
        const inc = mkIncident(
          'demo_gate3_crit', 'Severe Overcrowding', 'zone_1', 'Gate 3', 'critical', 0.94, 
          'Historical match data combined with current crowd density indicates a 94% probability of congestion within the next 8 minutes.', 
          'Open Overflow Gate 4. Dispatch Security.',
          { queueLength: 382, averageWait: 17, exitCapacity: 210, predictedOverflow: 6, supportingData: ['CCTV', 'Gate Sensors', 'Historical Match Data', 'Weather'] }
        )
        state.setActiveIncident(inc)
        state.setPredictiveTimeOffset(8) // Future prediction UI
      }
      if (t === 56) {
        state.authorizeAction('pred_gate3', 1)
        state.setCctvTakeover(null)
      }
      if (t === 59) {
        const zones = state.zones.map(z => z.id === 'zone_1' ? { ...z, occupancy: 65, status: 'normal' as const } : z)
        state.setZones(zones)
        state.setActiveIncident(null)
        state.setPredictiveTimeOffset(0)
      }

      // ==========================================
      // PHASE 4: Incident 2 - Medical Emergency (60 - 90s)
      // ==========================================
      if (t === 62) {
        set({ demoStage: 4 })
        state.addIncidentHistory("⚠ Medical Agent detects biometric anomaly in Section 112.")
        const zones = state.zones.map(z => z.id === 'zone_2' ? { ...z, occupancy: 88, status: 'warning' as const } : z)
        state.setZones(zones)
      }
      if (t === 68) {
        state.setCctvTakeover('CAM-03') // View section
      }
      if (t === 73) {
        const inc = mkIncident(
          'demo_med_112', 'Medical Emergency', 'zone_2', 'Section 112', 'critical', 0.88, 
          'Biometric sensor anomalies and stagnant localized crowd flow indicate 88% probability of medical distress.', 
          'Dispatch EMT Unit Alpha. Clear aisle.',
          { averageWait: 2, supportingData: ['Heartrate IoT', 'Heatmap Stagnation'] }
        )
        state.setActiveIncident(inc)
      }
      if (t === 80) {
        state.addIncidentHistory("AUTHORIZED: EMT Unit Alpha dispatched. ETA 2 mins.")
        state.setCctvTakeover(null)
      }
      if (t === 88) {
        const zones = state.zones.map(z => z.id === 'zone_2' ? { ...z, occupancy: 40, status: 'normal' as const } : z)
        state.setZones(zones)
        state.setActiveIncident(null)
      }

      // ==========================================
      // PHASE 5: Incident 3 - Suspicious Package (90 - 115s)
      // ==========================================
      if (t === 92) {
        set({ demoStage: 5 })
        state.addIncidentHistory("⚠ Security Agent: Unattended object detected in Concourse North.")
      }
      if (t === 98) {
        const inc = mkIncident(
          'demo_sec_pack', 'Suspicious Package', 'zone_3', 'Concourse North', 'critical', 0.92, 
          'Object stationary for 14 minutes against moving crowd flow. Visual signature matches high-risk profile.', 
          'Lockdown zone. Dispatch Security Team 4.',
          { supportingData: ['CCTV ML Vision', 'Abandoned Object Model'] }
        )
        state.setActiveIncident(inc)
      }
      if (t === 105) {
        state.addIncidentHistory("Security Team 4 on site. Visual confirmation...")
      }
      if (t === 112) {
        state.addIncidentHistory("Object identified as abandoned backpack. Cleared.")
        state.setActiveIncident(null)
      }

      // ==========================================
      // PHASE 6: Incident 4 - Weather Event (115 - 140s)
      // ==========================================
      if (t === 117) {
        set({ demoStage: 6 })
        state.addIncidentHistory("☁ External Feed: Heavy precipitation detected.")
      }
      if (t === 125) {
        const inc = mkIncident(
          'demo_weather', 'Indoor Crowding Risk', 'zone_3', 'Concourse North', 'warning', 0.95, 
          'Incoming precipitation will shift 8,000 spectators to covered concourses within 4 minutes. High slip risk at exits.', 
          'Deploy janitorial staff. Increase HVAC extraction.',
          { predictedOverflow: 8000, supportingData: ['NOAA Radar', 'Historical Rain Behavior'] }
        )
        state.setActiveIncident(inc)
      }
      if (t === 132) {
        state.addIncidentHistory("AUTHORIZED: Adjusting HVAC. Rerouting crowd via digital signage.")
      }
      if (t === 138) {
        state.setActiveIncident(null)
      }

      // ==========================================
      // PHASE 7: Incident 5 - Power Fluctuation (140 - 165s)
      // ==========================================
      if (t === 142) {
        set({ demoStage: 7, systemStatus: 'CRITICAL', coreLoad: 95, networkLatency: 12.4 })
        state.addIncidentHistory("⚡ BMS Alert: Power drop detected in Sector 4.")
      }
      if (t === 148) {
        const inc = mkIncident(
          'demo_power', 'Transformer Overload', 'zone_1', 'Sector 4 Grid', 'critical', 0.99, 
          'Transformer load exceeded nominal threshold. Predictive load shedding required immediately to prevent cascade failure.', 
          'Reroute critical services to Backup Gen B.',
          { exitCapacity: 0, supportingData: ['BMS Grid Telemetry', 'Latency Spikes'] }
        )
        state.setActiveIncident(inc)
      }
      if (t === 155) {
        state.addIncidentHistory("AUTHORIZED: Load shedding engaged. Backup Gen B online.")
      }
      if (t === 162) {
        set({ systemStatus: 'OPTIMAL', coreLoad: 45, networkLatency: 1.5 })
        state.setActiveIncident(null)
      }

      // ==========================================
      // PHASE 8: Executive Summary (165 - 180s)
      // ==========================================
      if (t === 166) {
        set({ demoStage: 8 })
        state.addIncidentHistory("Demo Sequence Complete. Compiling Executive Summary...")
      }
      
      // End Demo
      if (t === 180) {
        state.stopDemo()
        return
      }

      set({ demoTick: t + 1 })
    }, 1000)

    set({ _demoTimer: timer })
  },

  skipScene: () => {
    const state = get()
    if (!state.demoMode) return
    const milestones = [0, 15, 30, 62, 92, 117, 142, 166, 180]
    for (let m of milestones) {
      if (state.demoTick < m) {
        set({ demoTick: m })
        break
      }
    }
  },

  stopDemo: () => {
    const timer = get()._demoTimer
    if (timer) clearInterval(timer)
    
    const st = get()
    st.setActiveIncident(null)
    st.setCctvTakeover(null)
    st.setPredictiveTimeOffset(0)
    st.setShowImpactReport(false)
    const baseZones = st.zones.map(z => ({ ...z, occupancy: z.baseline, status: 'normal' as const }))
    st.setZones(baseZones)
    set({ demoMode: false, demoStage: 0, demoTick: 0, _demoTimer: null, systemStatus: 'OPTIMAL' })
  },

  setZones: (zones) => set({ liveZones: zones, zones: get().playbackMode ? get().zones : zones }),
  addLog: (log) => set((state) => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logText = `🚨 INCIDENT: ${log.incident_type} in ${log.zone_name}. Recommended: ${log.recommended_action}`;
    return {
      logs: [log, ...state.logs],
      incidentHistory: [{ time, log: logText }, ...state.incidentHistory]
    };
  }),
  setActiveIncident: (incident) => {
    const previous = get().liveActiveIncident;
    set({ liveActiveIncident: incident, activeIncident: get().playbackMode ? get().activeIncident : incident });
    
    if (!incident && previous) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const logText = `✅ RESOLVED: ${previous.incident_type} in ${previous.zone_name} has been resolved.`;
      set((state) => ({
        incidentHistory: [{ time, log: logText }, ...state.incidentHistory]
      }));
    }
    
    // Play alert sound if transitioning to a new active incident
    if (incident && (!previous || previous.id !== incident.id) && !get().isMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          
          if (incident.severity === 'critical') {
            // Cinematic sub-drop bass hit + sweeping sawtooth alarm node
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(587.33, now); // D5
            osc1.frequency.exponentialRampToValueAtTime(110.00, now + 0.35); // Heavy pitch sweep down
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(45.00, now); // Sub-bass impact 45Hz
            osc2.frequency.exponentialRampToValueAtTime(30.00, now + 0.8);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(280, now);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.95);
            osc2.stop(now + 0.95);
          } else {
            // High-fidelity double chime radar ping (Linear/Apple style)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, now); // C5
            osc1.frequency.setValueAtTime(783.99, now + 0.08); // G5
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, now); // C6
            osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.15); // Sweep to G6
            
            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.6);
            osc2.stop(now + 0.6);
          }
        }
      } catch (e) {
        console.warn('AudioContext failed:', e);
      }
    }
  },
  setIsConnected: (connected) => set({ isConnected: connected }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  
  startSimulation: () => {
    if (get()._simTimer) return; // Already running
    
    const timer = setInterval(() => {
      const state = get();
      const isIncident = !!state.liveActiveIncident;
      const isCritical = state.liveActiveIncident?.severity === 'critical';
      
      // Correlated Telemetry Generation (using LIVE data)
      const baseLoad = isIncident ? (isCritical ? 85 : 65) : 35;
      const newLoad = Math.max(10, Math.min(100, baseLoad + (Math.random() * 10 - 5)));
      
      const baseLat = isIncident ? (isCritical ? 14.5 : 5.2) : 1.2;
      const newLat = Math.max(0.8, baseLat + (Math.random() * 2 - 1));
      
      const baseBand = isIncident ? 14.2 : 8.4; 
      const newBand = Math.max(2.0, baseBand + (Math.random() * 1.5 - 0.75));
      
      // We must track the live telemetry history separately from the displayed one
      // The displayed one is frozen if playbackMode is true
      // To simplify, we'll extract the last snapshot's telemetry history to append to
      const lastSnap = state.historicalSnapshots[state.historicalSnapshots.length - 1];
      const liveHistory = lastSnap ? lastSnap.telemetryHistory : state.telemetryHistory;
      const newHistory = [...liveHistory.slice(1), newLoad];
      
      let newPredictions = [...DEFAULT_PREDICTIONS];
      // Keep resolved states
      newPredictions = newPredictions.map(np => {
        const existing = state.predictions.find(p => p.id === np.id);
        return existing ? { ...np, resolved: existing.resolved, probability: existing.resolved ? 10 : np.probability, severity: existing.resolved ? 'normal' : np.severity } : np;
      });
      
      const newSysStatus = isCritical ? 'CRITICAL' : isIncident ? 'WARNING' : 'OPTIMAL';
      
      // Generate Detections based on active incident type
      let newDetections: Detection[] = [];
      if (state.liveActiveIncident) {
        const inc = state.liveActiveIncident;
        const baseLocation = inc.zone_name || 'Unknown';
        if (inc.incident_type.includes('Overcrowding')) {
          for (let i = 0; i < 5; i++) {
            newDetections.push({
              id: `person_${i}_${Date.now()}`,
              type: 'person',
              location: baseLocation,
              confidence: 80 + Math.random() * 20,
              status: 'tracking',
            });
          }
        } else if (inc.incident_type.includes('Medical')) {
          for (let i = 0; i < 2; i++) {
            newDetections.push({
              id: `person_med_${i}_${Date.now()}`,
              type: 'person',
              location: baseLocation,
              confidence: 85 + Math.random() * 10,
              status: 'tracking',
            });
          }
          newDetections.push({
            id: `vehicle_med_${Date.now()}`,
            type: 'vehicle',
            location: baseLocation,
            confidence: 90 + Math.random() * 5,
            status: 'tracking',
          });
        } else if (inc.incident_type.includes('Fire')) {
          for (let i = 0; i < 3; i++) {
            newDetections.push({
              id: `person_fire_${i}_${Date.now()}`,
              type: 'person',
              location: baseLocation,
              confidence: 75 + Math.random() * 20,
              status: 'tracking',
            });
          }
          for (let i = 0; i < 2; i++) {
            newDetections.push({
              id: `vehicle_fire_${i}_${Date.now()}`,
              type: 'vehicle',
              location: baseLocation,
              confidence: 88 + Math.random() * 8,
              status: 'tracking',
            });
          }
        }
      }
      
      // Simulate BMS Data
      const baseHvac = isIncident ? 85 : 42;
      const newHvac = Math.max(20, Math.min(100, baseHvac + (Math.random() * 8 - 4)));
      const basePower = isIncident ? 22.4 : 12.4;
      const newPower = Math.max(5, basePower + (Math.random() * 2 - 1));
      const baseCarbon = isIncident ? 3.8 : 2.1;
      const newCarbon = Math.max(1, baseCarbon + (Math.random() * 0.4 - 0.2));
      
      const newBmsData: BmsData = {
        hvacLoad: newHvac,
        powerUsage: newPower,
        carbonEmissions: newCarbon
      };
      
      const newSnapshot: Snapshot = {
        timestamp: Date.now(),
        zones: state.liveZones,
        activeIncident: state.liveActiveIncident,
        coreLoad: newLoad,
        networkLatency: newLat,
        bandwidth: newBand,
        telemetryHistory: newHistory,
        predictions: newPredictions,
        systemStatus: newSysStatus,
        bmsData: newBmsData,
        detections: newDetections
      };
      
      // Limit history to last 5 minutes (300 snapshots)
      const updatedHistory = [...state.historicalSnapshots, newSnapshot].slice(-300);
      
      if (!state.playbackMode) {
        set({
          historicalSnapshots: updatedHistory,
          coreLoad: newLoad,
          networkLatency: newLat,
          bandwidth: newBand,
          telemetryHistory: newHistory,
          predictions: newPredictions,
          systemStatus: newSysStatus,
          bmsData: newBmsData,
          detections: newDetections
        });
      } else {
        set({ historicalSnapshots: updatedHistory });
      }
      
    }, 1000);
    
    set({ _simTimer: timer });
  },
  
  stopSimulation: () => {
    const timer = get()._simTimer;
    if (timer) clearInterval(timer);
    set({ _simTimer: null });
  }
}))
