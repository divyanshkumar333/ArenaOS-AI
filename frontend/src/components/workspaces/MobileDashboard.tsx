import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useZoneStore } from '@/store/useZoneStore'
import { StadiumCanvas } from '@/components/StadiumCanvas'
import { BootSequenceOverlay } from '@/components/BootSequenceOverlay'
import { KPICards } from '@/components/KPICards'
import { IncidentPanel } from '@/components/IncidentPanel'
import { AICopilot } from '@/components/AICopilot'
import { TelemetryFeed } from '@/components/TelemetryFeed'
import { ActivityLog } from '@/components/ActivityLog'
import { Sidebar } from '@/components/Sidebar'
import { Activity, Radar, Bot, Menu, X } from 'lucide-react'
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
)

export function MobileDashboard() {
  const activeIncident = useZoneStore((state) => state.activeIncident)
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  return (
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
            className="bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-auto flex items-center gap-1"
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

      {/* Bottom Navigation Bar — 64px nominal height, safe-area below */}
      <nav
        className="absolute bottom-0 left-0 w-full z-40 bg-black/80 backdrop-blur-2xl border-t border-white/[0.06]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around items-center h-16 px-1">
          {/* Digital Twin */}
          <button
            onClick={() => setActiveSheet(null)}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all duration-200 ${
              !activeSheet ? 'text-accent' : 'text-white/35'
            }`}
            aria-label="Digital Twin view"
          >
            {!activeSheet && (
              <span className="absolute w-10 h-8 rounded-lg bg-accent/10 shadow-[0_0_12px_rgba(10,132,255,0.25)]" />
            )}
            <Radar className="relative w-5 h-5" strokeWidth={1.75} />
            <span className="relative text-[10px] font-medium tracking-wide">Twin</span>
          </button>

          {/* AI Copilot */}
          <button
            onClick={() => setActiveSheet('copilot')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all duration-200 ${
              activeSheet === 'copilot' ? 'text-accent' : 'text-white/35'
            }`}
            aria-label="AI Copilot"
          >
            {activeSheet === 'copilot' && (
              <span className="absolute w-10 h-8 rounded-lg bg-accent/10 shadow-[0_0_12px_rgba(10,132,255,0.25)]" />
            )}
            <span className="relative">
              <Bot className="w-5 h-5" strokeWidth={1.75} />
              {activeIncident && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </span>
            <span className="relative text-[10px] font-medium tracking-wide">Copilot</span>
          </button>

          {/* Live Telemetry */}
          <button
            onClick={() => setActiveSheet('telemetry')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all duration-200 ${
              activeSheet === 'telemetry' ? 'text-accent' : 'text-white/35'
            }`}
            aria-label="Live telemetry"
          >
            {activeSheet === 'telemetry' && (
              <span className="absolute w-10 h-8 rounded-lg bg-accent/10 shadow-[0_0_12px_rgba(10,132,255,0.25)]" />
            )}
            <Activity className="relative w-5 h-5" strokeWidth={1.75} />
            <span className="relative text-[10px] font-medium tracking-wide">Sensors</span>
          </button>

          {/* Menu */}
          <button
            onClick={() => setActiveSheet('menu')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all duration-200 ${
              activeSheet === 'menu' ? 'text-accent' : 'text-white/35'
            }`}
            aria-label="Navigation menu"
          >
            {activeSheet === 'menu' && (
              <span className="absolute w-10 h-8 rounded-lg bg-accent/10 shadow-[0_0_12px_rgba(10,132,255,0.25)]" />
            )}
            <Menu className="relative w-5 h-5" strokeWidth={1.75} />
            <span className="relative text-[10px] font-medium tracking-wide">Menu</span>
          </button>
        </div>
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
        <div className="flex flex-col gap-4">
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
  )
}
