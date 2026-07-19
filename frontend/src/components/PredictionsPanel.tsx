'use client'

import { ShieldAlert, Cpu, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    setDisplayed('')
    const timer = setInterval(() => {
      setDisplayed(text.substring(0, i))
      i++
      if (i > text.length) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [text])
  return <span>{displayed}</span>
}

export function PredictionsPanel() {
  const predictions = useZoneStore(state => state.predictions)
  const authorizeAction = useZoneStore(state => state.authorizeAction)
  
  return (
    <div className="h-full w-full flex flex-col p-4 bg-transparent text-gray-300">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-accent" /> Copilot Inference Engine
        </h3>
        <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 animate-pulse">
          AWAITING AUTHORIZATION
        </span>
      </div>
      
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {predictions.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col p-3 rounded-lg border transition-all duration-300 ${
                p.resolved 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : p.severity === 'critical' 
                    ? 'bg-red-900/10 border-red-500/30' 
                    : 'bg-yellow-900/10 border-yellow-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    {p.resolved ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertTriangle className={`w-3 h-3 ${p.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${p.resolved ? 'text-green-500' : p.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {p.zone_name} (T+{p.time_offset}M)
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono flex flex-col items-end">
                  <span className={p.resolved ? 'text-green-400' : 'text-gray-300'}>{p.probability}% PROB</span>
                </div>
              </div>

              {!p.resolved ? (
                <div className="text-[9px] font-mono space-y-2.5 mt-1 border-l-2 border-white/10 pl-2">
                  <div>
                    <span className="text-gray-500">ANALYZING:</span>
                    {p.analyzing.map((a, idx) => (
                      <div key={idx} className="text-gray-400 ml-2 flex gap-1">
                        <span className="text-accent/50">›</span> <TypewriterText text={a} />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <span className="text-gray-500">INFERENCE:</span>
                    <div className="text-white ml-2"><TypewriterText text={p.inference} /></div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">ROOT CAUSE:</span>
                    <div className="text-gray-400 ml-2">{p.cause}</div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">DECISION SIMULATOR:</span>
                    <div className="space-y-1.5 mt-1.5">
                      {p.options?.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          onClick={() => authorizeAction(p.id, oIdx)}
                          className="bg-black/40 border border-white/10 p-2 rounded flex flex-col group hover:bg-accent/10 hover:border-accent/40 transition-all cursor-pointer"
                        >
                           <div className="flex justify-between items-center mb-1.5">
                             <span className="text-white text-[10px] font-bold group-hover:text-accent transition-colors">{opt.action}</span>
                             <span className="text-[8px] text-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                               [ AUTHORIZE ] <ArrowRight className="w-2.5 h-2.5" />
                             </span>
                           </div>
                           <div className="flex justify-between text-[8px] uppercase tracking-wider">
                              <span className="text-gray-500">Cost: <span className={opt.cost === 'High' ? 'text-red-400' : opt.cost === 'Medium' ? 'text-yellow-400' : 'text-green-400'}>{opt.cost}</span></span>
                              <span className="text-gray-500">Speed: <span className={opt.responseTime === 'Fast' ? 'text-green-400' : 'text-yellow-400'}>{opt.responseTime}</span></span>
                              <span className="text-gray-500">Risk Reduction: <span className="text-accent">{opt.riskReduction}%</span></span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-green-400 mt-2 flex items-center gap-2">
                  <span className="animate-pulse">●</span> THREAT NEUTRALIZED. NOMINAL OPERATIONS RESTORED.
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
