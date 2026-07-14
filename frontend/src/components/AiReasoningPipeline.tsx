"use client"

import { useEffect, useState } from "react"
import { useZoneStore } from "@/store/useZoneStore"
import { motion } from "framer-motion"
import { Eye, Brain, Search, Lightbulb, Play, CheckCircle, Rocket, BarChart, GitMerge } from "lucide-react"

const STAGES = [
  { id: 'ANOMALY_DETECTED', label: 'Anomaly Detected', icon: Eye },
  { id: 'AI_ANALYZING', label: 'AI Analyzing', icon: Brain },
  { id: 'REASONING_COMPLETE', label: 'Reasoning Complete', icon: Search },
  { id: 'SCENARIO_SELECTION', label: 'Scenario Selection', icon: Lightbulb },
  { id: 'EXECUTING', label: 'Executing Plan', icon: Rocket }
]

export function AiReasoningPipeline() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)

  useEffect(() => {
    if (activeIncident) {
      setCurrentStageIndex(0)
      const t1 = setTimeout(() => setCurrentStageIndex(1), 100)
      const t2 = setTimeout(() => setCurrentStageIndex(2), 300)
      const t3 = setTimeout(() => setCurrentStageIndex(3), 450)
      const t4 = setTimeout(() => setCurrentStageIndex(4), 600)
      
      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      }
    } else {
      setCurrentStageIndex(-1)
    }
  }, [activeIncident])

  if (!activeIncident) return null

  return (
    <div className="h-full w-full bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <GitMerge size={14} className="text-accent" />
          <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-white">Reasoning Engine</h3>
        </div>
      </div>
      
      <div className="flex flex-col relative z-10 font-mono">
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/10 -z-10" />
        
        {STAGES.map((stage, i) => {
          const isActive = currentStageIndex === i
          const isCompleted = currentStageIndex > i
 
          return (
            <div key={stage.id} className="flex items-center gap-3 relative flex-1 min-h-[35px] group">
              <motion.div 
                animate={isActive ? {
                  scale: [1, 1.1, 1],
                  borderColor: ["rgba(10,132,255,0.3)", "rgba(10,132,255,1)", "rgba(10,132,255,0.3)"]
                } : {
                  scale: 1,
                  opacity: isCompleted ? 0.7 : 0.3,
                  borderColor: isCompleted ? "rgba(10,132,255,0.3)" : "rgba(255,255,255,0.1)"
                }}
                transition={isActive ? { repeat: Infinity, duration: 1.5 } : { duration: 0.5 }}
                className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 border-2 z-10 bg-[#06070a] ${
                  isActive ? "text-accent" :
                  isCompleted ? "text-accent/50" :
                  "text-gray-500/30"
                }`}
              >
                <stage.icon size={14} />
              </motion.div>
              
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-widest transition-colors duration-500 ${
                  isActive ? "text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" :
                  isCompleted ? "text-white/70" :
                  "text-gray-500/30"
                }`}>
                  {stage.label}
                </span>
                
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[8px] text-accent mt-0.5"
                  >
                    PROCESSING • <span className="animate-pulse">_</span>
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
