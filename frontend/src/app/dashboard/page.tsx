'use client'

import { useEffect } from 'react'
import { KpiHeader } from '@/components/KpiHeader'
import { Sidebar } from '@/components/Sidebar'
import { useZoneStore } from '@/store/useZoneStore'
import { CommandCenterWorkspace } from '@/components/workspaces/CommandCenterWorkspace'
import { InfrastructureWorkspace } from '@/components/workspaces/InfrastructureWorkspace'
import dynamic from 'next/dynamic'

import { MobileDashboard } from '@/components/workspaces/MobileDashboard'
import { useIsMobile } from '@/hooks/useMediaQuery'

const ScenarioComparison = dynamic(() => import('@/components/ScenarioComparison').then(m => m.ScenarioComparison), { ssr: false })
const ImpactReportPanel = dynamic(() => import('@/components/ImpactReportPanel').then(m => m.ImpactReportPanel), { ssr: false })

export default function DashboardOS() {
  const { setZones, addLog, setActiveIncident, setIsConnected, activeTab, startSimulation, stopSimulation } = useZoneStore()
  const isMobile = useIsMobile()

  useEffect(() => {
    let ws: WebSocket, t: NodeJS.Timeout
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws/telemetry')
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
    <main className="w-screen h-screen overflow-hidden bg-black text-white flex flex-col font-sans">
      <div className="shrink-0 z-20"><KpiHeader /></div>
      <div className="flex-1 grid grid-cols-[240px_1fr] gap-4 p-4 min-h-0 min-w-0 overflow-hidden relative z-10">
        <div className="h-full overflow-hidden flex flex-col min-w-0"><Sidebar /></div>
        <div className="flex-1 h-full min-h-0 min-w-0 overflow-hidden relative">
          {['CCTV & Surveillance', 'Facility Systems (BMS)', 'Platform Settings'].includes(activeTab) ? <InfrastructureWorkspace /> : <CommandCenterWorkspace />}
        </div>
      </div>
      <ScenarioComparison />
      <ImpactReportPanel />
    </main>
  )
}
