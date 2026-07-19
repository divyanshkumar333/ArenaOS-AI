import React from 'react'
import { ActivityLog } from '@/components/ActivityLog'
import { TelemetryFeed } from '@/components/TelemetryFeed'
import { AICopilot } from '@/components/AICopilot'
import { MultiAgentPanel } from '@/components/MultiAgentPanel'
import { IncidentPanel } from '@/components/IncidentPanel'
import { ExecutivePanel } from '@/components/ExecutivePanel'
import { DemoControlsPanel } from '@/components/DemoControlsPanel'
import { useZoneStore } from '@/store/useZoneStore'

export function CommandCenterWorkspace() {
  const activeIncident = useZoneStore(state => state.activeIncident)

  return (
    <>
      {/* Floating Right Panel (AI Copilot & Swarm) */}
      <div className="absolute top-0 right-0 w-[360px] h-full flex flex-col gap-6 font-sans pointer-events-none">
        {activeIncident ? (
          <div className="pointer-events-auto h-full flex flex-col">
            <IncidentPanel />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-h-0 pointer-events-auto">
              <AICopilot />
            </div>
            <div className="h-[260px] shrink-0 border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] rounded-[26px] bg-gradient-to-b from-white/[0.03] to-transparent bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col relative min-h-0 pointer-events-auto">
              <MultiAgentPanel />
            </div>
          </>
        )}
      </div>

      {/* Floating Left Column: Executive Panel & Incident History */}
      <div className="absolute bottom-0 left-0 w-[340px] h-full pt-[80px] pb-6 flex flex-col gap-4 justify-end pointer-events-none">
        
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
    </>
  )
}
