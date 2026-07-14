import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, ShieldAlert, Cpu, CheckCircle2, Activity } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'

export function AiAnalysisPanel() {
  const activeTab = useZoneStore(state => state.activeTab)
  
  // Simulated stats for the active view
  const [stats, setStats] = useState({ faces: 0, vehicles: 0, anomalies: 0 })

  useEffect(() => {
    // Randomly fluctuate stats to make the UI look alive
    const interval = setInterval(() => {
      setStats({
        faces: Math.floor(Math.random() * 45) + 10,
        vehicles: Math.floor(Math.random() * 12) + 2,
        anomalies: Math.random() > 0.8 ? 1 : 0
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

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
              <div className="text-2xl font-light text-white mb-1">{stats.faces}</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Pedestrians
              </div>
            </div>
            
            <div className="p-3 bg-[#2c2c2e]/40 rounded border border-white/5">
              <div className="text-2xl font-light text-white mb-1">{stats.vehicles}</div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" /> Vehicles
              </div>
            </div>
          </div>
        </div>

        {/* Threat Assessment */}
        <div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Threat Assessment</div>
          
          <div className={`p-4 rounded border ${stats.anomalies > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} flex gap-3`}>
            {stats.anomalies > 0 ? (
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            )}
            
            <div>
              <div className={`text-sm font-bold ${stats.anomalies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.anomalies > 0 ? 'Anomalous Behavior Detected' : 'All Feeds Nominal'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.anomalies > 0 
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
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex justify-between border-b border-white/5 pb-1"
              >
                <span>[ID_{Math.floor(Math.random()*9000)+1000}] Person</span>
                <span>{Math.floor(Math.random()*20 + 80)}% CONF</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
