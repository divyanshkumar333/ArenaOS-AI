import React from 'react'
import { StadiumCanvas } from '@/components/StadiumCanvas'
import { BootSequenceOverlay } from '@/components/BootSequenceOverlay'
import { KPICards } from '@/components/KPICards'
import { PredictionsPanel } from '@/components/PredictionsPanel'
import { ActivityLog } from '@/components/ActivityLog'
import { TelemetryFeed } from '@/components/TelemetryFeed'
import { AICopilot } from '@/components/AICopilot'
import { MultiAgentPanel } from '@/components/MultiAgentPanel'
import { IncidentPanel } from '@/components/IncidentPanel'
import { useZoneStore } from '@/store/useZoneStore'

export function CommandCenterWorkspace() {
  const activeIncident = useZoneStore(state => state.activeIncident)

  return (
    <div className="flex-1 h-full overflow-y-auto pr-2 flex flex-col gap-5 min-w-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* TOP ROW: KPI Summary Row */}
      <div className="shrink-0">
        <KPICards />
      </div>

      {/* MIDDLE SECTION: Digital Twin and AI Controls */}
      <div className="flex gap-5 min-h-0 min-w-0 shrink-0">
        {/* Left Area: 3D Twin Map */}
        <div className="flex-1 h-[530px] relative border border-white/[0.04] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black/40 group">
          <BootSequenceOverlay />
          <StadiumCanvas />
        </div>

        {/* Right Area: AI Copilot & Swarm */}
        <div className="w-[380px] h-[530px] flex flex-col gap-4 shrink-0 font-sans">
          {activeIncident ? (
            /* During incident: full-height IncidentPanel (reasoning is inline) */
            <IncidentPanel />
          ) : (
            <>
              {/* Top Panel: Copilot chat */}
              <div className="flex-1 flex flex-col min-h-0">
                <AICopilot />
              </div>

              {/* Bottom Panel: AI Swarm */}
              <div className="flex-1 border border-white/[0.04] rounded-2xl bg-[rgba(10,10,12,0.6)] backdrop-blur-2xl overflow-hidden shadow-xl flex flex-col relative min-h-0">
                <MultiAgentPanel />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-25 pointer-events-none z-0">
                  <div className="w-10 h-10 rounded-full border border-dashed border-accent/60 animate-spin-slow mb-3" />
                  <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-accent/80">Swarm Standby</span>
                  <span className="font-mono text-[8px] tracking-wider text-gray-600 mt-1.5">Awaiting Triggers</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Auxiliary Analytical Panels */}
      <div className="flex flex-col gap-2.5 pb-4 shrink-0">
        <div className="text-[9px] uppercase font-mono tracking-widest text-gray-500 px-1">Analytical Auxiliary Systems</div>
        <div className="grid grid-cols-2 gap-5 h-[240px]">
          
          {/* Telemetry */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.04] bg-[rgba(10,10,12,0.4)] backdrop-blur-2xl shadow-lg">
            <TelemetryFeed />
          </div>

          {/* Activity Log */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.04] bg-[rgba(10,10,12,0.4)] backdrop-blur-2xl shadow-lg">
            <ActivityLog />
          </div>

        </div>
      </div>
    </div>
  )
}
