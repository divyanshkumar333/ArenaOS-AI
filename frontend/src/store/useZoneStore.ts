import { create } from 'zustand'

export type Status = 'normal' | 'warning' | 'critical'

export interface Zone {
  id: string
  name: string
  occupancy: number
  status: Status
  baseline: number
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
}

export interface Prediction {
  label: string
  time: string
  prob: number
  trend: 'up' | 'down' | 'stable'
  iconType: 'Users' | 'Activity' | 'Zap'
  color: string
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
  predictions: Prediction[]
  systemStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL'
  bmsData: BmsData
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
  predictions: Prediction[]
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
  
  setZones: (zones: Zone[]) => void
  addLog: (log: IncidentLog) => void
  setActiveIncident: (incident: IncidentLog | null) => void
  setIsConnected: (connected: boolean) => void
  toggleMute: () => void
  
  // Simulation Engine
  _simTimer: NodeJS.Timeout | null
  startSimulation: () => void
  stopSimulation: () => void
}

const DEFAULT_PREDICTIONS: Prediction[] = [
  { label: 'Gate 4 Congestion', time: '+15m', prob: 22, trend: 'stable', iconType: 'Users', color: 'text-gray-400' },
  { label: 'Concourse A Flow', time: '+30m', prob: 14, trend: 'down', iconType: 'Activity', color: 'text-accent' },
  { label: 'Temp Anomaly Zone 2', time: '+1h', prob: 8, trend: 'stable', iconType: 'Zap', color: 'text-gray-400' },
]

export const useZoneStore = create<ZoneState>((set, get) => ({
  zones: [],
  logs: [],
  activeIncident: null,
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
  
  setZones: (zones) => set({ liveZones: zones, zones: get().playbackMode ? get().zones : zones }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  setActiveIncident: (incident) => {
    const previous = get().liveActiveIncident;
    set({ liveActiveIncident: incident, activeIncident: get().playbackMode ? get().activeIncident : incident });
    
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
      if (isIncident && state.liveActiveIncident?.incident_type.includes('Overcrowding')) {
        newPredictions[0] = { label: 'Gate 4 Overflow Risk', time: '+5m', prob: 94, trend: 'up', iconType: 'Users', color: 'text-red-500' };
        newPredictions[1] = { label: 'Concourse A Bottleneck', time: '+10m', prob: 88, trend: 'up', iconType: 'Activity', color: 'text-yellow-500' };
      } else if (isIncident && state.liveActiveIncident?.incident_type.includes('Medical')) {
        newPredictions[1] = { label: 'EMT Route Clear', time: 'LIVE', prob: 99, trend: 'stable', iconType: 'Activity', color: 'text-green-500' };
      } else if (isIncident && state.liveActiveIncident?.incident_type.includes('Fire')) {
        newPredictions = [
          { label: 'Evacuation Route N', time: 'LIVE', prob: 100, trend: 'up', iconType: 'Users', color: 'text-red-500' },
          { label: 'Ventilation Shift', time: '+1m', prob: 98, trend: 'up', iconType: 'Zap', color: 'text-yellow-500' },
          { label: 'Zone 3 Containment', time: '+5m', prob: 75, trend: 'down', iconType: 'Activity', color: 'text-orange-500' }
        ];
      } else {
        newPredictions = newPredictions.map(p => ({
          ...p,
          prob: Math.max(1, Math.min(99, p.prob + Math.floor(Math.random() * 5 - 2)))
        }));
      }
      
      const newSysStatus = isCritical ? 'CRITICAL' : isIncident ? 'WARNING' : 'OPTIMAL';
      
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
        bmsData: newBmsData
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
          bmsData: newBmsData
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
