'use client'

import { LayoutGrid, Activity, Users, ShieldAlert, Settings, HardDrive, Radio, Layers, Brain, CloudRain, ShieldCheck, Zap, Speaker, Crosshair, Play, StopCircle } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'
import { useState, useEffect } from 'react'


export function Sidebar() {
  const systemStatus = useZoneStore(state => state.systemStatus)
  const activeItem = useZoneStore(state => state.activeTab)
  const setActiveItem = useZoneStore(state => state.setActiveTab)
  const coreLoad = useZoneStore(state => state.coreLoad)
  const networkLatency = useZoneStore(state => state.networkLatency)
  const bandwidth = useZoneStore(state => state.bandwidth)
  const activeIncident = useZoneStore(state => state.activeIncident)
  const demoMode = useZoneStore(state => state.demoMode)
  const runDemo = useZoneStore(state => state.runDemo)
  const stopDemo = useZoneStore(state => state.stopDemo)

  // Track elapsed seconds for progress bar
  const [demoElapsed, setDemoElapsed] = useState(0)
  useEffect(() => {
    if (!demoMode) { setDemoElapsed(0); return }
    const t = setInterval(() => setDemoElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [demoMode])

  const DEMO_DURATION = 150 // seconds
  const demoProgress = Math.min(100, Math.round((demoElapsed / DEMO_DURATION) * 100))

  // Phase label
  const demoPhase =
    demoElapsed < 20 ? 'Normal ops — crowd rising' :
      demoElapsed < 40 ? 'Gate 3 high flow detected' :
        demoElapsed < 75 ? 'Gate 3 overcrowding — drones dispatched' :
          demoElapsed < 115 ? 'Medical event — EMS en route' :
            demoElapsed < 150 ? 'KPIs peaking — stabilising' :
              'All clear'


  const menuItems = [
    { name: 'Overview', icon: LayoutGrid },
    { name: 'Incidents', icon: ShieldAlert },
    { name: 'Predictive Analytics', icon: Brain },
  ]

  const systemItems = [
    { name: 'CCTV & Surveillance', icon: Radio },
    { name: 'Facility Systems (BMS)', icon: HardDrive },
    { name: 'Platform Settings', icon: Settings },
  ]

  const triggerIncident = async (type: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_type: type })
      })
    } catch (e) {
      console.error("Failed to trigger", e)
    }
  }

  const handleSimulateClick = () => {
    // Cycles through the mock incidents
    const types = ['Gate 3 Overcrowding', 'Section 112 Medical Event', 'Concourse North Fire Alarm']
    const nextIndex = activeIncident ? (types.indexOf(activeIncident.incident_type) + 1) % types.length : 0
    triggerIncident(types[nextIndex])
  }

  const handleDroneDispatch = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("Deploying Autonomous Surveillance Drone Fleet to Sector 3.")
      u.rate = 1.05
      window.speechSynthesis.speak(u)
    }
  }

  const handleAnnouncement = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("Attention all personnel: ArenaOS is operating under Live Command Mode. Status is optimal.")
      u.rate = 1.05
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-[#101012]/80 to-transparent bg-black/40 backdrop-blur-3xl border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-[26px] p-4 overflow-y-auto no-scrollbar gap-3 text-gray-300">

      {/* 1. Command Center Navigation */}
      <div>
        <div className="text-sm font-medium text-white/60 mb-1 px-1">Command Center</div>
        <div className="space-y-0.5 mb-2">
          {menuItems.map((item) => {
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left ${isActive ? 'bg-accent/10 text-accent border border-accent/25 font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <item.icon className="w-3 h-3 shrink-0" />
                <span className="text-xs">{item.name}</span>
              </button>
            )
          })}
        </div>

        <div className="text-sm font-medium text-white/60 mb-1 px-1">Infrastructure</div>
        <div className="space-y-0.5">
          {systemItems.map((item) => {
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left ${isActive ? 'bg-accent/10 text-accent border border-accent/25 font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                <item.icon className="w-3 h-3 shrink-0" />
                <span className="text-xs">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. System Status */}
      <div className="border-t border-white/5 pt-2">
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="text-sm font-medium text-white/60">System Status</div>
          <span className="text-[8px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/20">OPERATIONAL</span>
        </div>

        <div className="space-y-1.5 font-mono text-[9px] tracking-wider">
          <ProgressBarSegmented label="Network" value={bandwidth} max={15} unit=" GB/s" />
          <ProgressBarSegmented label="Latency" value={networkLatency} max={20} unit=" ms" />
          <ProgressBarSegmented label="Uptime" value={99.983} max={100} unit="%" />
        </div>
      </div>

      {/* 3. Weather Feed */}
      <div className="border-t border-white/5 pt-2">
        <div className="text-sm font-medium text-white/60 mb-2 px-1">Weather Feed</div>

        <div className="bg-[rgba(28,28,30,0.4)] backdrop-blur-xl rounded-xl border border-white/[0.08] p-2.5 flex flex-col gap-2 font-sans transition-all duration-300 hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-6 h-6 text-accent animate-pulse" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-none">18°C</span>
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">Light Rain</span>
              </div>
            </div>
            <div className="flex flex-col items-end text-right font-mono text-[8px] text-gray-500 uppercase">
              <span>VISIBILITY</span>
              <span className="text-white font-bold">8.5 km</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-white/[0.08] pt-2 text-gray-400">
            <div>HUMIDITY: <span className="text-white font-bold">69%</span></div>
            <div>WIND: <span className="text-white font-bold">12 km/h</span></div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="border-t border-white/5 pt-2">
        <div className="text-sm font-medium text-white/60 mb-2 px-1">Quick Actions</div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSimulateClick}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/20 hover:bg-accent/10 rounded-lg border border-white/[0.08] hover:border-accent/30 transition-all duration-300 font-mono text-[9px] uppercase tracking-wider text-gray-300 active:scale-98 group"
          >
            <span>Simulate Anomaly</span>
            <ShieldAlert className="w-3 h-3 text-gray-500 group-hover:text-red-400 transition-colors" />
          </button>

          <button
            onClick={handleDroneDispatch}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/20 hover:bg-accent/10 rounded-lg border border-white/[0.08] hover:border-accent/30 transition-all duration-300 font-mono text-[9px] uppercase tracking-wider text-gray-300 active:scale-98 group"
          >
            <span>Drone Patrol</span>
            <Crosshair className="w-3 h-3 text-gray-500 group-hover:text-accent transition-colors" />
          </button>

          <button
            onClick={handleAnnouncement}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/20 hover:bg-accent/10 rounded-lg border border-white/[0.08] hover:border-accent/30 transition-all duration-300 font-mono text-[9px] uppercase tracking-wider text-gray-300 active:scale-98 group"
          >
            <span>Public Alert</span>
            <Speaker className="w-3 h-3 text-gray-500 group-hover:text-accent transition-colors" />
          </button>

          {/* ── Demo Mode ──────────────────────────────────────── */}
          <div className="mt-1 border-t border-white/5 pt-2">
            <button
              id="demo-mode-btn"
              onClick={() => demoMode ? stopDemo() : runDemo()}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 font-mono text-[9px] uppercase tracking-wider active:scale-98 group ${demoMode
                ? 'bg-accent/20 border-accent/40 text-accent animate-pulse'
                : 'bg-slate-900/20 hover:bg-accent/10 border-white/[0.08] hover:border-accent/30 text-gray-300'
                }`}
            >
              <span>{demoMode ? 'Stop Demo' : 'Demo Mode'}</span>
              {demoMode
                ? <StopCircle className="w-3 h-3 text-accent" />
                : <Play className="w-3 h-3 text-gray-500 group-hover:text-accent transition-colors" />
              }
            </button>

            {demoMode && (
              <div className="mt-2 px-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-mono text-accent/80 truncate pr-1">{demoPhase}</span>
                  <span className="text-[8px] font-mono text-gray-500 shrink-0">{demoElapsed}s / {DEMO_DURATION}s</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-1000"
                    style={{ width: `${demoProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressBarSegmented({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const blocks = 10;
  const activeBlocks = Math.min(blocks, Math.floor((value / max) * blocks));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-gray-400">
        <span>{label}</span>
        <span className="text-white font-bold">{value.toFixed(label === 'Uptime' ? 3 : 1)}{unit}</span>
      </div>
      <div className="flex gap-[2px] h-2 w-full bg-black/40 rounded-sm overflow-hidden p-0.5 border border-white/5">
        {Array.from({ length: blocks }).map((_, i) => {
          const isActive = i < activeBlocks;
          return (
            <div
              key={i}
              className={`flex-1 h-full rounded-[1px] transition-all duration-300 ${isActive ? 'bg-accent shadow-[0_0_4px_rgba(10,132,255,0.4)]' : 'bg-white/5'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
