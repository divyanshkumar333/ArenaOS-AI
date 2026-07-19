'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion } from 'framer-motion'
import { Wind, Zap, Factory, HardDrive, Radio, ShieldAlert, Cpu } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BmsPanel() {
  const bmsData = useZoneStore(state => state.bmsData)
  const systemStatus = useZoneStore(state => state.systemStatus)
  
  const isCritical = systemStatus === 'CRITICAL'
  const isWarning = systemStatus === 'WARNING'

  const [nodes, setNodes] = useState([
    { id: 'NODE-01', status: 'ONLINE', ping: '1ms', type: 'Edge Compute', ip: '10.54.12.101' },
    { id: 'NODE-02', status: 'ONLINE', ping: '2ms', type: 'AI Inference', ip: '10.54.12.102' },
    { id: 'NODE-03', status: 'ONLINE', ping: '3ms', type: 'Sensor Hub', ip: '10.54.12.103' },
    { id: 'NODE-04', status: 'ONLINE', ping: '1ms', type: 'BMS Gateway', ip: '10.54.12.104' },
    { id: 'NODE-05', status: 'DEGRADED', ping: '18ms', type: 'CCTV Cluster', ip: '10.54.12.105' },
  ])

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#121214]/90 to-[rgba(18,18,20,0.75)] p-6 flex flex-col font-sans select-none overflow-y-auto no-scrollbar gap-6 backdrop-blur-3xl shadow-[inset_0_0_30px_rgba(255,255,255,0.015)] border border-white/[0.08] rounded-2xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-accent" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Facility Management (BMS)</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Automation & Subsystems Telemetry</p>
          </div>
        </div>
        
        <span className="flex items-center space-x-2 text-[9px] font-mono font-bold bg-slate-900/40 border border-white/[0.08] px-2.5 py-1 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-yellow-500 animate-pulse' : 'bg-accent animate-pulse'}`} />
          <span className={isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-accent'}>BMS: {systemStatus}</span>
        </span>
      </div>

      {/* Main Content: Split layout */}
      <div className="grid grid-cols-[320px_1fr] gap-6 min-h-0">
        
        {/* Left Column: Environmental Metrics */}
        <div className="flex flex-col gap-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-gray-500 px-1">Environmental Vitals</div>
          
          <div className="flex-1 flex flex-col gap-3">
            {/* HVAC */}
            <BmsRow 
              icon={<Wind className="w-4 h-4 text-blue-400" />} 
              label="HVAC Load" 
              value={bmsData.hvacLoad} 
              unit="%" 
              isWarning={bmsData.hvacLoad > 80}
            />

            {/* Power Grid */}
            <BmsRow 
              icon={<Zap className="w-4 h-4 text-yellow-400" />} 
              label="Power Draw" 
              value={(bmsData.powerUsage / 30) * 100} 
              displayValue={`${bmsData.powerUsage.toFixed(1)} MW`}
              isWarning={bmsData.powerUsage > 25}
            />

            {/* Carbon */}
            <BmsRow 
              icon={<Factory className="w-4 h-4 text-green-400" />} 
              label="Emissions" 
              value={(bmsData.carbonEmissions / 5) * 100} 
              displayValue={`${bmsData.carbonEmissions.toFixed(2)} t/h`}
              isWarning={false}
              successTheme
            />
          </div>
        </div>

        {/* Right Column: Hardware Nodes Status */}
        <div className="flex flex-col gap-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-gray-500 px-1">Hardware Nodes Diagnostics</div>
          
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            {nodes.map(node => (
              <div 
                key={node.id} 
                className={`bg-slate-950/20 backdrop-blur-md rounded-xl border p-4 flex flex-col justify-between hover:border-accent/20 transition-all duration-300 ${
                  node.status === 'DEGRADED' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/[0.08]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">{node.type}</span>
                    <h4 className="text-sm font-bold text-white font-mono mt-1">{node.id}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold bg-black/40 border border-white/[0.08] px-2 py-0.5 rounded">
                    <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'ONLINE' ? 'bg-accent animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                    <span style={{ color: node.status === 'ONLINE' ? '#0a84ff' : '#ff9f0a' }}>{node.status}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/[0.08] pt-3 mt-4 text-[9px] font-mono text-gray-500">
                  <div className="flex flex-col">
                    <span>IP ADDRESS</span>
                    <span className="text-gray-300 font-bold mt-0.5">{node.ip}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span>LATENCY</span>
                    <span className="text-white font-bold mt-0.5">{node.ping}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function BmsRow({ icon, label, value, unit = "", displayValue, isWarning, successTheme }: any) {
  const blocks = 18;
  const activeBlocks = Math.floor((value / 100) * blocks);
  
  return (
    <div className="bg-slate-950/20 backdrop-blur-md rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between overflow-hidden relative transition-all duration-300 hover:border-accent/20 flex-1">
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center space-x-2 text-gray-400">
          {icon}
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">{label}</span>
        </div>
        <span className={`text-xs font-mono font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
          {displayValue || `${value.toFixed(1)}${unit}`}
        </span>
      </div>
      
      {/* Segmented Bar */}
      <div className="flex gap-[2px] h-2 w-full mt-4 z-10">
        {Array.from({ length: blocks }).map((_, i) => {
          const isActive = i < activeBlocks;
          const isWarningThreshold = i >= blocks * 0.7 && i < blocks * 0.9;
          const isDangerThreshold = i >= blocks * 0.9;
          
          let blockColor = "bg-white/5";
          if (isActive) {
            if (isWarning) blockColor = "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]";
            else if (successTheme) blockColor = "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]";
            else blockColor = "bg-accent shadow-[0_0_5px_rgba(10,132,255,0.4)]";
          } else {
            if (isDangerThreshold) blockColor = "bg-red-500/20";
            else if (isWarningThreshold) blockColor = "bg-yellow-500/20";
          }

          return (
            <div 
              key={i} 
              className={`flex-1 h-full rounded-[1px] transition-all duration-300 ${blockColor}`}
            />
          )
        })}
      </div>
      {isWarning && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
    </div>
  )
}
