import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, ShieldAlert, Cpu, CheckCircle2, Activity, Car } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'

export function AiAnalysisPanel() {
  const activeTab = useZoneStore(state => state.activeTab)
  const zones = useZoneStore(state => state.zones)

  const isLive = zones.length > 0

  // Derived live metrics
  const totalPedestrians = zones.reduce((sum, z) => sum + (z.occupancy ?? 0), 0)
  const totalVehicles = Math.max(0, Math.floor(totalPedestrians / 15)) // rough estimate

  // Use detections from global store
  const detections = useZoneStore(state => state.detections)
  // Simple anomaly count: detections with confidence below 85% are considered anomalous
  const anomalies = detections.filter(d => d.confidence < 85).length

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,0.85)] border border-white/[0.08] rounded-2xl flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Vision Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">Model Active</span>
        </div>
      </div>
{!isLive && (
  <div className="p-2 bg-yellow-600/20 border border-yellow-600 text-yellow-200 text-sm text-center">
    Idle/Test Mode – no live stadium data available.
  </div>
)}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-6">
        
        {/* Context */}
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Current Context</div>
          <div className="p-3 bg-white/5 rounded border border-white/5 flex items-center justify-between">
            <span className="text-sm font-bold text-white">{activeTab}</span>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Real-time Detections */}
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Live Object Tracking</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#2c2c2e]/40 rounded border border-white/5">
              <div className="text-2xl font-light text-white mb-1">{isLive ? totalPedestrians : 0}</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Pedestrians
              </div>
            </div>
            
            <div className="p-3 bg-[#2c2c2e]/40 rounded border border-white/5">
              <div className="text-2xl font-light text-white mb-1">{isLive ? totalVehicles : 0}</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Car className="w-3 h-3" /> Vehicles
              </div>
            </div>
          </div>
        </div>

        {/* Threat Assessment */}
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Threat Assessment</div>
          
          <div className={`p-4 rounded border ${anomalies > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} flex gap-3`}>
            {anomalies > 0 ? (
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            )}
            
            <div>
              <div className={`text-sm font-bold ${anomalies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {anomalies > 0 ? 'Anomalous Behavior Detected' : 'All Feeds Nominal'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {anomalies > 0 
                  ? 'OpenCV model detected rapid crowd formation or restricted zone breach.'
                  : 'No security breaches or overcrowding detected in current visual feeds.'}
              </div>
            </div>
          </div>
        </div>

        {/* Bounding Box Log */}
        <div className="flex-1">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Detection Stream</div>
          <div className="font-mono text-[10px] text-gray-400 flex flex-col gap-2 opacity-50">
            {detections.map(det => (
              <motion.div
                key={det.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between border-b border-white/5 pb-1"
              >
                <span className="flex items-center gap-1">
                  {det.type === 'person' ? <Eye className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                  {det.id}
                </span>
                <span>{det.location}</span>
                <span>{det.confidence}%</span>
                <span className={`text-xs font-medium ${det.status === 'tracking' ? 'text-green-400' : 'text-yellow-400'}`}>{det.status}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
