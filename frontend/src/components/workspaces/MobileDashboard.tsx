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
import { Activity, ShieldAlert, Radar, Bot, Settings, ChevronUp, X } from 'lucide-react'
import { ArenaLogo } from '@/components/ArenaLogo'

export function MobileDashboard() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  // Full-screen Bottom Sheet Component
  const BottomSheet = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <AnimatePresence>
      {activeSheet === id && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl pb-20"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08] shrink-0 bg-black/50">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">{title}</h2>
            <button onClick={() => setActiveSheet(null)} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative w-full h-full bg-black flex flex-col overflow-hidden">
      
      {/* Mobile Top Bar */}
      <div className="absolute top-0 left-0 w-full z-40 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full pointer-events-auto">
          <ArenaLogo size={16} className="text-accent" animate />
          <span className="font-bold text-xs tracking-widest text-white">ARENA<span className="text-accent">OS</span></span>
        </div>
        
        {activeIncident && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-auto flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Incident
          </motion.div>
        )}
      </div>

      {/* Main 3D Canvas (Full Screen) */}
      <div className="absolute inset-0 z-0">
        <BootSequenceOverlay />
        <StadiumCanvas />
      </div>

      {/* Floating Swipeable KPIs */}
      <div className="absolute top-16 left-0 w-full z-30 pointer-events-auto overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 pb-4">
        <div className="flex gap-3 w-max">
          <KPICards />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 w-full z-40 bg-black/80 backdrop-blur-xl border-t border-white/[0.08] pb-safe px-2 py-2 flex justify-around items-center">
        
        <button onClick={() => setActiveSheet(null)} className={`flex flex-col items-center gap-1 p-2 transition-colors ${!activeSheet ? 'text-accent' : 'text-gray-500'}`}>
          <Radar className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-mono">Twin</span>
        </button>

        <button onClick={() => setActiveSheet('copilot')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeSheet === 'copilot' ? 'text-accent' : 'text-gray-500'}`}>
          <div className="relative">
            <Bot className="w-5 h-5" />
            {activeIncident && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono">Copilot</span>
        </button>

        <button onClick={() => setActiveSheet('telemetry')} className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeSheet === 'telemetry' ? 'text-accent' : 'text-gray-500'}`}>
          <Activity className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-mono">Sensors</span>
        </button>

      </div>

      {/* Bottom Sheets */}
      <BottomSheet id="copilot" title={activeIncident ? "Incident Response" : "AI Copilot"}>
        {activeIncident ? <IncidentPanel /> : <AICopilot />}
      </BottomSheet>

      <BottomSheet id="telemetry" title="Live Telemetry">
        <div className="flex flex-col gap-4 h-full">
          <div className="h-1/2 border border-white/[0.04] rounded-xl overflow-hidden bg-black/40"><TelemetryFeed /></div>
          <div className="h-1/2 border border-white/[0.04] rounded-xl overflow-hidden bg-black/40"><ActivityLog /></div>
        </div>
      </BottomSheet>

    </div>
  )
}
