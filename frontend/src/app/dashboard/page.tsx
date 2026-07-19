'use client'

import { useEffect } from 'react'
import { KpiHeader } from '@/components/KpiHeader'
import { Sidebar } from '@/components/Sidebar'
import { useZoneStore } from '@/store/useZoneStore'
import { CommandCenterWorkspace } from '@/components/workspaces/CommandCenterWorkspace'
import { InfrastructureWorkspace } from '@/components/workspaces/InfrastructureWorkspace'
import { StadiumCanvas } from '@/components/StadiumCanvas'
import { BootSequenceOverlay } from '@/components/BootSequenceOverlay'
import { BootSequence } from '@/components/BootSequence'
import { ExecutiveSummary } from '@/components/ExecutiveSummary'
import { DemoControlsPanel } from '@/components/DemoControlsPanel'
import dynamic from 'next/dynamic'

import { MobileDashboard } from '@/components/workspaces/MobileDashboard'
import { useIsMobile } from '@/hooks/useMediaQuery'

const ScenarioComparison = dynamic(() => import('@/components/ScenarioComparison').then(m => m.ScenarioComparison), { ssr: false })
const ImpactReportPanel = dynamic(() => import('@/components/ImpactReportPanel').then(m => m.ImpactReportPanel), { ssr: false })

export default function DashboardOS() {
  const setZones = useZoneStore(s => s.setZones)
  const addLog = useZoneStore(s => s.addLog)
  const setActiveIncident = useZoneStore(s => s.setActiveIncident)
  const setIsConnected = useZoneStore(s => s.setIsConnected)
  const activeTab = useZoneStore(s => s.activeTab)
  const startSimulation = useZoneStore(s => s.startSimulation)
  const stopSimulation = useZoneStore(s => s.stopSimulation)
  const isRecordingMode = useZoneStore(s => s.isRecordingMode)
  const demoMode = useZoneStore(s => s.demoMode)
  const demoStage = useZoneStore(s => s.demoStage)
  const isMobile = useIsMobile()

  useEffect(() => {
    let ws: WebSocket, t: NodeJS.Timeout
    const connect = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      ws = new WebSocket(`${apiUrl.replace(/^http/, 'ws')}/ws/telemetry`)
      ws.onopen = () => setIsConnected(true)
      ws.onmessage = e => {
        const d = JSON.parse(e.data)
        if (d.type === 'telemetry') setZones(d.zones)
        else if (d.type === 'incident') {
          const inc = { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), ...d }
          setActiveIncident(inc); addLog(inc)
        }
      }
      ws.onerror = () => console.warn('WS error. Backend missing on 8000.')
      ws.onclose = () => { setIsConnected(false); t = setTimeout(connect, 2000) }
    }
    connect(); startSimulation()
    return () => { clearTimeout(t); ws?.close(); stopSimulation() }
  }, [setZones, addLog, setActiveIncident, setIsConnected, startSimulation, stopSimulation])

  if (isMobile) {
    return (
      <main className="w-screen h-[100dvh] overflow-hidden bg-black text-white flex flex-col font-sans">
        <MobileDashboard />
        <ScenarioComparison />
        <ImpactReportPanel />
      </main>
    )
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-black text-white relative font-sans">
      
      {/* Full-Screen 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <StadiumCanvas />
      </div>

      {/* HUD Overlays Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        <BootSequenceOverlay />
        <BootSequence />
        <ExecutiveSummary />

        
        {/* Top Header */}
        <div className={`shrink-0 pointer-events-auto z-20 transition-opacity duration-700 ${isRecordingMode && demoMode ? 'opacity-0' : 'opacity-100'}`}>
          <KpiHeader />
        </div>
        
        {/* Main Interface Grid */}
        <div className={`flex-1 flex min-h-0 relative py-6 pr-6 pl-2 gap-6 overflow-hidden z-10 transition-opacity duration-700 ${isRecordingMode && demoMode ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Floating Left Sidebar */}
          <div className="w-[220px] h-full overflow-hidden flex flex-col min-w-0 pointer-events-auto shrink-0 shadow-2xl rounded-[26px]">
            <Sidebar />
          </div>
          
          {/* Floating Right Workspaces */}
          <div className="flex-1 h-full min-h-0 min-w-0 overflow-hidden relative pointer-events-none">
            {['CCTV & Surveillance', 'Facility Systems (BMS)', 'Platform Settings'].includes(activeTab) ? <InfrastructureWorkspace /> : <CommandCenterWorkspace />}
          </div>

        </div>
      </div>

      <div className={`transition-opacity duration-700 ${isRecordingMode && demoMode ? 'opacity-0' : 'opacity-100'}`}>
        <ScenarioComparison />
        <ImpactReportPanel />
      </div>
    </main>
  )
}
