'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Volume2, VolumeX, Clock } from 'lucide-react'
import Link from 'next/link'
import { ArenaLogo } from './ArenaLogo'

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(value)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const animation = animate(count, value, { duration: 0.5 })
    return () => animation.stop()
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
}

export function KpiHeader() {
  const zones = useZoneStore((state) => state.zones)
  const activeIncident = useZoneStore((state) => state.activeIncident)
  const isConnected = useZoneStore((state) => state.isConnected)
  const isMuted = useZoneStore((state) => state.isMuted)
  const toggleMute = useZoneStore((state) => state.toggleMute)

  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      // Display format: HH:MM:SS
      setTimeStr(d.toTimeString().split(' ')[0])
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const totalOccupancy = zones.reduce((acc, zone) => acc + zone.occupancy, 0)
  const avgOccupancy = zones.length > 0 ? Math.round(totalOccupancy / zones.length) : 0
  const warningZones = zones.filter(z => z.status === 'warning').length
  const criticalZones = zones.filter(z => z.status === 'critical').length

  return (
    <div className="w-full h-16 bg-gradient-to-r from-black/60 to-[rgba(10,10,12,0.4)] backdrop-blur-3xl border-b border-white/[0.08] shadow-[inset_0_-1px_15px_rgba(255,255,255,0.015)] flex items-center px-6 justify-between relative select-none z-50">
      
      {/* Left side Logo & Title */}
      <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative flex items-center justify-center w-9 h-9 bg-accent/[0.04] border border-accent/[0.12] rounded-lg group-hover:scale-105 transition-all group-hover:bg-accent/[0.08] group-hover:border-accent/[0.2]">
          <ArenaLogo size={20} className="text-accent z-10" animate />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-sans font-bold text-lg tracking-tight text-white transition-colors">ArenaOS AI</span>
          </div>
          <span className="text-[10px] text-white/60 leading-none">Intelligent Venue OS</span>
        </div>
      </Link>

      {/* Center Operation Mode & Clock — hidden on mobile */}
      <div className="hidden md:flex items-center space-x-6">
        {/* Operation Mode Badge */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/[0.08] px-3 py-1.5 rounded-full">
          <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest">Operation Mode</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-medium text-white">Live Command</span>
          </div>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/[0.08] px-3 py-1.5 rounded-full font-mono text-[11px] text-white/80">
          <Clock className="w-3 h-3 text-white/60" />
          <span>{timeStr}</span>
          <span className="text-white/40">IST</span>
        </div>
      </div>
      
      {/* Right side Stats — hidden on mobile */}
      <div className="hidden md:flex items-center space-x-6 text-[12px] text-white/60">
        
        <div className="flex flex-col items-end">
          <span className="text-[10px]">Avg Occupancy</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-white font-medium text-sm"><AnimatedNumber value={avgOccupancy} />%</span>
            <span className="text-accent text-[10px]">+3.2%</span>
          </div>
        </div>
        
        <div className="w-[1px] h-6 bg-white/[0.08]" />
 
        <div className="flex flex-col items-end">
          <span className="text-[10px]">Warnings</span>
          <div className="relative inline-flex items-center mt-0.5">
            <span className={`font-medium text-sm ${warningZones > 0 ? "text-[#ffd60a]" : "text-white"}`}>
              <AnimatedNumber value={warningZones} />
            </span>
          </div>
        </div>
 
        <div className="w-[1px] h-6 bg-white/[0.08]" />
        
        <div className="flex flex-col items-end">
          <span className="text-[10px]">Critical</span>
          <div className="relative inline-flex items-center mt-0.5">
            <span className={`font-medium text-sm ${criticalZones > 0 ? "text-[#ff453a]" : "text-white"}`}>
              <AnimatedNumber value={criticalZones} />
            </span>
          </div>
        </div>
 
        <div className="w-[1px] h-6 bg-white/[0.08]" />
        
        <div className="flex flex-col items-end">
          <span className="text-[10px]">Active Incident</span>
          <span className={`font-medium text-sm mt-0.5 ${activeIncident ? (activeIncident.severity === 'critical' ? "text-[#ff453a]" : "text-[#ffd60a]") : "text-white/40"}`}>
            {activeIncident ? activeIncident.incident_type : "None"}
          </span>
        </div>
 
        <div className="w-[1px] h-6 bg-white/[0.08]" />
 
        {/* Audio Toggle & Avatar */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleMute} 
            className="text-white/60 hover:text-white transition-colors p-2 bg-white/5 border border-white/[0.08] rounded-full hover:bg-white/10"
            title={isMuted ? "Unmute Narration" : "Mute Narration"}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
          
          <div className="w-8 h-8 rounded-full border border-white/[0.08] overflow-hidden flex items-center justify-center bg-white/5 text-white/80 font-medium text-[11px]">
            OP
          </div>
        </div>
      </div>
    </div>
  )
}
