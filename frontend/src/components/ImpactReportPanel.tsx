"use client"

import { useZoneStore } from "@/store/useZoneStore"
import { motion } from "framer-motion"
import { CheckCircle2, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react"

export function ImpactReportPanel() {
  const showImpactReport = useZoneStore(state => state.showImpactReport)
  const setShowImpactReport = useZoneStore(state => state.setShowImpactReport)
  const setActiveIncident = useZoneStore(state => state.setActiveIncident)
  
  if (!showImpactReport) return null;

  const handleClose = () => {
    setShowImpactReport(false)
    setActiveIncident(null) // Actually clear the incident and return to normal
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050510]/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-[560px] bg-[#0b0c10]/95 border border-white/[0.04] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans"
      >
        <div className="p-6 border-b border-white/[0.04] bg-[#07080a] flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
            <CheckCircle2 className="text-accent" size={18} />
            System Stabilized
          </h2>
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest border border-white/[0.04] px-2 py-0.5 rounded bg-black/40">
            Resolution Report
          </span>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <p className="text-xs text-gray-400 leading-relaxed">
            The AI-recommended routing strategy was successfully executed. The venue has returned to normal operational parameters.
          </p>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 flex flex-col gap-1.5 border border-white/[0.04] bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 flex items-center gap-1.5">
                <TrendingDown size={12} className="text-accent" /> Average Wait Time
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">↓ 42%</span>
                <span className="text-[10px] text-gray-600 line-through">14m 30s</span>
                <span className="text-[10px] font-bold text-accent">4m 10s</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5 border border-white/[0.04] bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 flex items-center gap-1.5">
                <TrendingDown size={12} className="text-accent" /> Crowd Congestion
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">↓ 68%</span>
                <span className="text-[10px] text-gray-600 line-through">Critical</span>
                <span className="text-[10px] font-bold text-accent">Safe</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5 border border-white/[0.04] bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-accent" /> Emergency Response
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">↑ 31%</span>
                <span className="text-[10px] text-gray-400">Efficiency Gain</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5 border border-white/[0.04] bg-black/20 rounded-xl">
              <span className="text-[9px] uppercase font-mono tracking-widest text-accent flex items-center gap-1.5">
                <ShieldCheck size={12} /> Venue Health
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-accent">98%</span>
                <span className="text-[10px] font-bold text-accent">OPTIMAL</span>
              </div>
            </div>

          </div>
          
          <button 
            onClick={handleClose}
            className="w-full mt-3 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(10,132,255,0.3)] active:scale-98 text-xs uppercase tracking-widest font-mono"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
