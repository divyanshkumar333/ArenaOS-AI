import React, { useState } from 'react'
import { ActivityLog } from '@/components/ActivityLog'
import { TelemetryFeed } from '@/components/TelemetryFeed'
import { AICopilot } from '@/components/AICopilot'
import { MultiAgentPanel } from '@/components/MultiAgentPanel'
import { IncidentPanel } from '@/components/IncidentPanel'
import { ExecutivePanel } from '@/components/ExecutivePanel'
import { DemoControlsPanel } from '@/components/DemoControlsPanel'
import { useZoneStore } from '@/store/useZoneStore'
import { ChevronRight, ChevronLeft } from 'lucide-react'

export function CommandCenterWorkspace() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)

  return (
    <>
      {/* Right Panel Toggle (visible on tablet) */}
      <button
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        className="lg:hidden absolute top-1/2 -translate-y-1/2 right-0 z-40 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-l-lg pointer-events-auto text-white"
      >
        {rightPanelOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Floating Right Panel (AI Copilot & Swarm) */}
      <div className={`absolute top-0 right-0 w-[300px] lg:w-[360px] h-full flex flex-col gap-6 font-sans pointer-events-none transition-transform duration-300 ease-in-out z-30 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {activeIncident ? (
          <div className="pointer-events-auto h-full flex flex-col bg-black/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-l-[26px] lg:rounded-none">
            <IncidentPanel />
          </div>
        ) : (
          <div className="h-full flex flex-col gap-6 bg-black/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-l-[26px] lg:rounded-none">
            <div className="flex-1 flex flex-col min-h-0 pointer-events-auto">
              <AICopilot />
            </div>
            <div className="h-[260px] shrink-0 border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-[26px] bg-gradient-to-b from-white/[0.03] to-transparent bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col relative min-h-0 pointer-events-auto">
              <MultiAgentPanel />
            </div>
          </div>
        )}
      </div>

      {/* Left Panel Toggle (visible on tablet) */}
      <button
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        className="lg:hidden absolute top-1/2 -translate-y-1/2 left-0 z-40 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-r-lg pointer-events-auto text-white"
      >
        {leftPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Floating Left Column: Executive Panel & Incident History */}
      <div className={`absolute bottom-0 left-0 w-[280px] lg:w-[340px] h-full pt-[80px] pb-6 flex flex-col gap-4 justify-end pointer-events-none transition-transform duration-300 ease-in-out z-30 ${leftPanelOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="h-full flex flex-col gap-4 justify-end bg-black/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-r-[26px] lg:rounded-none">
          {/* Executive Dashboard */}
          <div className="shrink-0 h-[250px] rounded-[26px] overflow-hidden border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] bg-gradient-to-b from-white/[0.03] to-transparent bg-black/40 backdrop-blur-3xl shadow-2xl flex flex-col pointer-events-auto">
            <ExecutivePanel />
          </div>

          {/* Incident History / Activity Log */}
          <div className="flex-1 min-h-[150px] max-h-[200px] rounded-[26px] overflow-hidden border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] bg-gradient-to-b from-white/[0.03] to-transparent bg-black/40 backdrop-blur-3xl shadow-2xl flex flex-col pointer-events-auto">
            <ActivityLog />
          </div>

          {/* Demo Controls */}
          <div className="pointer-events-auto shrink-0 pb-2">
            <DemoControlsPanel />
          </div>
        </div>
      </div>
    </>
  )
}
