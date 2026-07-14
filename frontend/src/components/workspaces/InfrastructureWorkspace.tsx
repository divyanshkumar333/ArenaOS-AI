import React from 'react'
import { useZoneStore } from '@/store/useZoneStore'
import dynamic from 'next/dynamic'
import { AiAnalysisPanel } from '@/components/AiAnalysisPanel'

const BmsPanel = dynamic(() => import('@/components/BmsPanel').then(m => m.BmsPanel), { ssr: false })
const CctvPanel = dynamic(() => import('@/components/CctvPanel').then(m => m.CctvPanel), { ssr: false })
const PlatformSettings = dynamic(() => import('@/components/PlatformSettings').then(m => m.PlatformSettings), { ssr: false })

export function InfrastructureWorkspace() {
  const activeTab = useZoneStore(state => state.activeTab)

  return (
    <div className="flex-1 h-full flex gap-4 min-h-0 overflow-hidden">
      
      {/* CENTER AREA: Infrastructure Grid (CCTV / BMS) */}
      <div className="flex-1 border border-white/5 rounded-xl bg-black overflow-hidden shadow-2xl relative min-h-0">
        {activeTab === 'CCTV & Surveillance' && <CctvPanel />}
        {activeTab === 'Facility Systems (BMS)' && <BmsPanel />}
        {activeTab === 'Platform Settings' && <PlatformSettings />}
      </div>

      {/* RIGHT AREA: AI Analysis Sidecar */}
      <div className="w-[360px] h-full shrink-0 flex flex-col min-h-0 shadow-2xl">
        <AiAnalysisPanel />
      </div>

    </div>
  )
}
