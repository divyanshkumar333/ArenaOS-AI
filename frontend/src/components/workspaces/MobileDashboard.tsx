import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useZoneStore } from '@/store/useZoneStore'
import dynamic from 'next/dynamic'
// @ts-ignore
const StadiumCanvas = dynamic(() => import('@/components/StadiumCanvas').then(mod => mod.default as React.ComponentType), { ssr: false })
import { BootSequenceOverlay } from '@/components/BootSequenceOverlay'
import { KPICards } from '@/components/KPICards'
import { IncidentPanel } from '@/components/IncidentPanel'
import { AICopilot } from '@/components/AICopilot'
import { TelemetryFeed } from '@/components/TelemetryFeed'
import { ActivityLog } from '@/components/ActivityLog'
import { Sidebar } from '@/components/Sidebar'
import { Activity, Wifi, Signal, Cpu, Menu, X } from 'lucide-react'
import '../AmbientAnimations.css'
import { ArenaLogo } from '@/components/ArenaLogo'

// BottomSheet slides up from the bottom covering 85% of the screen.
// Using top-[15%] instead of fixed inset-0 + h-[80vh] so height is always correct.
const BottomSheet = ({
  title,
  id,
  activeSheet,
  setActiveSheet,
  children,
}: {
  title: string
  id: string
  activeSheet: string | null
  setActiveSheet: (s: string | null) => void
  children: React.ReactNode
}) => (
  <AnimatePresence>
    {activeSheet === id && (
      <motion.div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setActiveSheet(null);
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-x-0 bottom-0 top-[12%] z-50 flex flex-col bg-black/95 backdrop-blur-xl"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">{title}</h2>
          <button
            onClick={() => setActiveSheet(null)}
            className="p-2 bg-white/5 rounded-full text-white/60 active:text-white"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 pb-24">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Sidebar memoized above
export function MobileDashboard() {
  const zones = useZoneStore((state) => state.zones);
  const gate3Occupancy = zones.find(z => z.id === 'zone_1')?.occupancy || 0;
  const activeIncident = useZoneStore((state) => state.activeIncident)
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  return (
    <>
      {/* Floating holographic markers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="holo-marker" style={{ top: '20%', left: '30%' }} />
        <div className="holo-marker" style={{ top: '50%', left: '70%' }} />
        <div className="holo-marker" style={{ top: '80%', left: '40%' }} />
      </div>
      <div className="relative w-full h-full bg-black flex flex-col overflow-hidden">

      {/* Mobile Top Bar */}
      <div className="absolute top-0 left-0 w-full z-40 px-4 py-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full pointer-events-auto">
          <ArenaLogo size={16} className="text-accent" animate />
          <span className="font-bold text-xs tracking-widest text-white">
            ARENA<span className="text-accent">OS</span>
          </span>
        </div>

        {activeIncident && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(10,10,12,0.85)] border border-accent/30 p-2.5 rounded-lg text-[9px] font-mono text-accent uppercase whitespace-nowrap shadow-2xl backdrop-blur-xl flex flex-col gap-0.5 min-w-[120px] holo-flicker"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Incident
          </motion.div>
        )}
      </div>

      {/* Full-screen 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <BootSequenceOverlay />
        <StadiumCanvas />
      </div>

      {/* Horizontally scrollable KPI strip */}
      <div className="absolute top-14 left-0 w-full z-30 pointer-events-auto overflow-x-auto snap-x snap-mandatory px-4 pb-2"
        style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 w-max">
          <KPICards />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="absolute bottom-0 left-0 w-full z-40 bg-black/85 backdrop-blur-xl border-t border-white/[0.08] pb-safe px-2 pt-2 flex justify-around items-center"
        aria-label="Mobile navigation"
      >
        {/* Digital Twin */}
        <button
          onClick={() => setActiveSheet(null)}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${!activeSheet ? 'bg-accent/10 text-accent border border-accent/25 font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          aria-label="Digital Twin view"
        >
          <div className={`radar-sweep ${gate3Occupancy > 80 ? 'gate-marker-pulse' : ''}`}>
            <Signal className="w-5 h-5" />
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono">Twin</span>
        </button>

        {/* AI Copilot */}
        <button
          onClick={() => setActiveSheet('copilot')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${activeSheet === 'copilot' ? 'text-accent bg-accent/10' : 'text-gray-500'
            }`}
          aria-label="AI Copilot"
        >
          <div className="relative">
            <Cpu className="w-5 h-5" />
            {activeIncident && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono">Copilot</span>
        </button>

        {/* Live Telemetry */}
        <button
          onClick={() => setActiveSheet('telemetry')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${activeSheet === 'telemetry' ? 'text-accent bg-accent/10' : 'text-gray-500'
            }`}
          aria-label="Live telemetry"
        >
          <Wifi className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-mono">Sensors</span>
        </button>

        {/* Sidebar / Menu */}
        <button
          onClick={() => setActiveSheet('menu')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${activeSheet === 'menu' ? 'text-accent bg-accent/10' : 'text-gray-500'
            }`}
          aria-label="Navigation menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-mono">Menu</span>
        </button>
      </nav>

      {/* Bottom Sheets */}
      <BottomSheet
        id="copilot"
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        title={activeIncident ? 'Incident Response' : 'AI Copilot'}
      >
        {activeIncident ? <IncidentPanel /> : <AICopilot />}
      </BottomSheet>

      <BottomSheet
        id="telemetry"
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        title="Live Telemetry"
      >
        <div className="h-full w-full flex flex-col p-5 bg-transparent telemetry-feed-marquee">
          <div className="h-64 border border-white/[0.04] rounded-xl overflow-hidden bg-black/40">
            <TelemetryFeed />
          </div>
          <div className="h-64 border border-white/[0.04] rounded-xl overflow-hidden bg-black/40">
            <ActivityLog />
          </div>
        </div>
      </BottomSheet>

      {/* Sidebar navigation as a bottom sheet */}
      <BottomSheet
        id="menu"
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        title="Command Center"
      >
        <Sidebar />
      </BottomSheet>
    </div>
  </> )
}
