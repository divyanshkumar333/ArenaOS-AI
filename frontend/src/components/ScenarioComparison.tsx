"use client"

import { useZoneStore } from "@/store/useZoneStore"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranch, Check, Zap, Clock, ShieldAlert, Users, Loader2 } from "lucide-react"
import { useState } from "react"

export function ScenarioComparison() {
  const { showDecisionMatrix, setShowDecisionMatrix, activeIncident } = useZoneStore()
  const [isResolving, setIsResolving] = useState(false)
  const setShowImpactReport = useZoneStore(state => state.setShowImpactReport)
  
  // Dynamic parsing from active incident variables
  const parseIncident = () => {
    if (!activeIncident) return null
    const type = activeIncident.incident_type.toLowerCase()
    const exp = activeIncident.explanation
    const action = activeIncident.recommended_action

    const probMatch = exp.match(/probability now (\d+)%/)
    const bottleneckProb = probMatch ? probMatch[1] : '92'

    const etaMatch = exp.match(/in ([\d.]+) minutes/)
    const etaMin = etaMatch ? parseFloat(etaMatch[1]) : 4.0

    const altMatch = action.match(/under (\d+)% capacity/)
    const altCap = altMatch ? altMatch[1] : '42'

    const secOccMatch = exp.match(/congested at (\d+)% and (\d+)%/)
    const secOcc = secOccMatch ? parseInt(secOccMatch[1]) : 92

    const medicalEtaMatch = action.match(/ETA (\d+)s/)
    const medicalEta = medicalEtaMatch ? parseInt(medicalEtaMatch[1]) : 45

    const fireOccMatch = exp.match(/occupancy is at (\d+)%/)
    const fireOcc = fireOccMatch ? parseInt(fireOccMatch[1]) : 45

    const evacMatch = exp.match(/time: ([\d.]+) minutes/) || action.match(/time: ([\d.]+) minutes/)
    const evacTime = evacMatch ? parseFloat(evacMatch[1]) : 3.2

    if (type.includes('gate') || type.includes('crowd') || type.includes('overcrowd')) {
      return {
        s1Evac: `${etaMin.toFixed(1)}m`,
        s1Density: `Critical (${bottleneckProb}%)`,
        s1Risk: `${bottleneckProb} / 100`,
        s1Cost: '$0',
        s1Outcome: 'Severe Crowd Crush',
        
        s2Evac: `${(etaMin * 0.35).toFixed(1)}m`,
        s2Density: `Safe (${altCap}%)`,
        s2Risk: `${Math.round(parseInt(bottleneckProb) * 0.15)} / 100`,
        s2Cost: '$$',
        s2Outcome: 'Safe Rerouting',

        s3Evac: 'N/A',
        s3Density: `High (85%)`,
        s3Risk: `${Math.round(parseInt(bottleneckProb) * 0.45)} / 100`,
        s3Cost: '$$$$',
        s3Outcome: 'High Panic Risk'
      }
    } else if (type.includes('medical')) {
      return {
        s1Evac: `>10m`,
        s1Density: `Congested (${secOcc}%)`,
        s1Risk: `80 / 100`,
        s1Cost: '$0',
        s1Outcome: 'Treatment Failure',

        s2Evac: `${medicalEta}s`,
        s2Density: `Safe (30%)`,
        s2Risk: `10 / 100`,
        s2Cost: '$$',
        s2Outcome: 'Rapid Ingress & Care',

        s3Evac: `${medicalEta * 2}s`,
        s3Density: `High (${secOcc - 5}%)`,
        s3Risk: `45 / 100`,
        s3Cost: '$$$',
        s3Outcome: 'Delayed Intervention'
      }
    } else {
      return {
        s1Evac: `>15m`,
        s1Density: `Core Load (${fireOcc}%)`,
        s1Risk: `95 / 100`,
        s1Cost: '$0',
        s1Outcome: 'Thermal Spread Risk',

        s2Evac: `${evacTime.toFixed(1)}m`,
        s2Density: `Safe (22%)`,
        s2Risk: `8 / 100`,
        s2Cost: '$$$',
        s2Outcome: 'Evacuation Complete',

        s3Evac: `${(evacTime * 1.8).toFixed(1)}m`,
        s3Density: `High (65%)`,
        s3Risk: `35 / 100`,
        s3Cost: '$$$$',
        s3Outcome: 'Slow Containment'
      }
    }
  }

  const executeResolution = async () => {
    setIsResolving(true)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    try {
      await fetch('http://localhost:8000/api/demo/resolve', { method: 'POST' })
      setTimeout(() => {
        setIsResolving(false)
        setShowDecisionMatrix(false)
        setShowImpactReport(true)
      }, 600)
    } catch (e) {
      console.error(e)
      setTimeout(() => {
        setIsResolving(false)
        setShowDecisionMatrix(false)
        setShowImpactReport(true)
      }, 600)
    }
  }

  if (!showDecisionMatrix) return null

  const stats = parseIncident()

  if (!activeIncident || !stats) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#06070a]/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-[500px] bg-[#111116]/95 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
            <GitBranch className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">No Active Scenarios</h2>
          <p className="text-sm text-gray-400">There are currently no active incidents requiring a decision matrix comparison. Trigger an anomaly to view comparative strategies.</p>
          <button 
            onClick={() => setShowDecisionMatrix(false)}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold tracking-wider"
          >
            Close
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-[900px] bg-[#1c1c1e]/95 border border-accent/30 rounded-2xl shadow-[0_0_50px_rgba(10,132,255,0.15)] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10 bg-[#1c1c1e]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
                <GitBranch className="text-accent" />
                Decision Matrix
              </h2>
              <p className="text-gray-400 text-sm mt-1">Awaiting operator selection to resolve critical anomaly.</p>
            </div>
            <button 
              onClick={() => setShowDecisionMatrix(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 p-6">
          
          {/* Strategy 1: Current */}
          <div className="p-5 flex flex-col gap-4 border border-white/10 bg-black/50 hover:bg-black/80 transition-colors rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono tracking-widest text-gray-500 mb-1">Baseline</span>
              <h3 className="text-lg font-bold text-white">Current Strategy</h3>
              <p className="text-xs text-gray-400 mt-1">Maintain current operational routing. Do nothing.</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <MetricRow icon={<Clock size={14}/>} label="Evacuation" value={stats.s1Evac} status="danger" />
              <MetricRow icon={<Users size={14}/>} label="Density" value={stats.s1Density} status="danger" />
              <MetricRow icon={<ShieldAlert size={14}/>} label="Risk Score" value={stats.s1Risk} status="danger" />
              <MetricRow icon={<Zap size={14}/>} label="Op Cost" value={stats.s1Cost} status="normal" />
            </div>
            <div className="mt-auto pt-4 border-t border-white/10">
              <span className="text-xs font-semibold text-red-500">Outcome: {stats.s1Outcome}</span>
            </div>
          </div>

          {/* Strategy 2: AI Recommended */}
          <motion.div 
            animate={{ boxShadow: ["0 0 0px rgba(10,132,255,0)", "0 0 20px rgba(10,132,255,0.3)", "0 0 0px rgba(10,132,255,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-5 flex flex-col gap-4 border-2 border-accent/50 bg-accent/5 hover:bg-accent/10 transition-colors relative overflow-hidden group rounded-xl"
          >
            <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-bl-lg">
              Recommended
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono tracking-widest text-accent mb-1">ArenaOS AI</span>
              <h3 className="text-lg font-bold text-white">Phased Rerouting</h3>
              <p className="text-xs text-gray-400 mt-1">Dispatch drone fleet and open overflow gates.</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <MetricRow icon={<Clock size={14}/>} label="Evacuation" value={stats.s2Evac} status="success" />
              <MetricRow icon={<Users size={14}/>} label="Density" value={stats.s2Density} status="success" />
              <MetricRow icon={<ShieldAlert size={14}/>} label="Risk Score" value={stats.s2Risk} status="success" />
              <MetricRow icon={<Zap size={14}/>} label="Op Cost" value={stats.s2Cost} status="warning" />
            </div>
            <div className="mt-auto pt-4 border-t border-white/10">
              <span className="text-xs font-semibold text-accent">Outcome: {stats.s2Outcome}</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
              <button
                onClick={executeResolution}
                disabled={isResolving}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full font-bold hover:bg-accent/80 transition-colors active:scale-95"
              >
                {isResolving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check size={16} /> Execute Strategy</>}
              </button>
            </div>
          </motion.div>

          {/* Strategy 3: Alternative */}
          <div className="p-5 flex flex-col gap-4 border border-white/10 bg-black/50 hover:bg-black/80 transition-colors rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono tracking-widest text-gray-500 mb-1">Alternative</span>
              <h3 className="text-lg font-bold text-white">Hard Lockdown</h3>
              <p className="text-xs text-gray-400 mt-1">Immediate halt of all ingress/egress. Dispatch security.</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <MetricRow icon={<Clock size={14}/>} label="Evacuation" value={stats.s3Evac} status="warning" />
              <MetricRow icon={<Users size={14}/>} label="Density" value={stats.s3Density} status="warning" />
              <MetricRow icon={<ShieldAlert size={14}/>} label="Risk Score" value={stats.s3Risk} status="warning" />
              <MetricRow icon={<Zap size={14}/>} label="Op Cost" value={stats.s3Cost} status="danger" />
            </div>
            <div className="mt-auto pt-4 border-t border-white/10">
              <span className="text-xs font-semibold text-yellow-500">Outcome: {stats.s3Outcome}</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

function MetricRow({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: 'normal' | 'success' | 'warning' | 'danger' }) {
  const colors = {
    normal: 'text-gray-500',
    success: 'text-accent',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  }
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        {icon} <span>{label}</span>
      </div>
      <span className={`font-mono font-semibold ${colors[status]}`}>{value}</span>
    </div>
  )
}
