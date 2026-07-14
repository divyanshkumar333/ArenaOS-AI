'use client'

import { Activity, Wifi, Signal, Cpu } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'
import { motion } from 'framer-motion'

export function TelemetryFeed() {
  const coreLoad = useZoneStore(state => state.coreLoad)
  const networkLatency = useZoneStore(state => state.networkLatency)
  const bandwidth = useZoneStore(state => state.bandwidth)
  const history = useZoneStore(state => state.telemetryHistory)
  
  const metrics = [
    { name: 'Core Load', value: `${Math.round(coreLoad)}%`, icon: Cpu, isWarning: coreLoad > 75 },
    { name: 'Network', value: `${networkLatency.toFixed(1)}ms`, icon: Signal, isWarning: networkLatency > 10 },
    { name: 'Bandwidth', value: `${bandwidth.toFixed(1)} GB/s`, icon: Wifi, isWarning: bandwidth > 12 },
  ]
  
  return (
    <div className="h-full w-full flex flex-col p-5 bg-transparent">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-2">
        <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
          <Activity className="w-3 h-3 text-white/60" /> Live Telemetry
        </h3>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-1 h-3 bg-white/40 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-2">
        {metrics.map((m, i) => {
          const themeColor = m.isWarning ? '#ff453a' : '#0a84ff';
          return (
            <div key={i} className={`bg-black/40 rounded-lg border flex flex-col items-center justify-center p-2.5 relative overflow-hidden group transition-all duration-300 ${m.isWarning ? 'border-red-500/30' : 'border-white/[0.08] hover:border-white/20'}`}>
              {/* Top border indicator */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ backgroundColor: themeColor }} />
              <div className={`absolute inset-0 bg-gradient-to-t ${m.isWarning ? 'from-[#ff453a]/10' : 'from-accent/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <m.icon className={`w-3 h-3 mb-2 transition-colors duration-500 ${m.isWarning ? 'text-red-400' : 'text-gray-400 group-hover:text-accent'}`} />
              <span className={`text-sm font-mono font-bold transition-colors duration-500 ${m.isWarning ? 'text-[#ff453a]' : 'text-gray-200 group-hover:text-white'}`}>{m.value}</span>
              <span className="text-[9px] uppercase tracking-wider text-white/50 mt-1">{m.name}</span>
            </div>
          )
        })}
      </div>
      
      <div className="mt-3 h-14 bg-black/40 rounded-lg border border-white/[0.08] relative overflow-hidden flex items-end p-1">
        <div className="w-full flex items-end justify-between h-full gap-[2px]">
          {history.map((val, i) => {
            const isLatest = i === history.length - 1;
            const barColor = val > 75 ? 'bg-[#ff453a] shadow-[0_0_6px_rgba(255,69,58,0.4)]' : val > 50 ? 'bg-[#ffd60a] shadow-[0_0_6px_rgba(255,214,10,0.4)]' : 'bg-accent/60 shadow-[0_0_4px_rgba(10,132,255,0.25)]';
            return (
              <motion.div 
                key={i}
                className={`w-full rounded-t-[1px] relative ${barColor} ${isLatest ? 'opacity-100' : 'opacity-65'}`}
                initial={false}
                animate={{ height: `${val}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
              >
                {isLatest && (
                  <div className={`absolute top-0 right-0 w-full h-1 blur-[3px] ${val > 75 ? 'bg-[#ff453a]' : val > 50 ? 'bg-[#ffd60a]' : 'bg-accent'}`} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
