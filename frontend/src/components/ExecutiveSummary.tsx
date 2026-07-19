'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useZoneStore } from '@/store/useZoneStore'

export function ExecutiveSummary() {
  const demoStage = useZoneStore(state => state.demoStage)
  const isSummary = demoStage === 10

  const metrics = [
    { label: 'Response Time', value: '< 2.4s', highlight: true },
    { label: 'People Assisted', value: '4,102' },
    { label: 'Delay Prevented', value: '14 mins' },
    { label: 'Risk Reduction', value: '89.4%', highlight: true },
    { label: 'AI Confidence', value: '97.0%' },
  ]

  return (
    <AnimatePresence>
      {isSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[999] bg-[#050508]/90 backdrop-blur-3xl flex items-center justify-center font-mono pointer-events-auto"
        >
          <div className="flex flex-col items-center justify-center w-[800px]">
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-emerald-400 tracking-widest uppercase mb-2">
                Incident Successfully Prevented
              </h2>
              <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">
                Predictive Swarm Mitigation Executed
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 w-full mb-16">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.2, duration: 0.8 }}
                  className={`flex flex-col items-center justify-center p-6 border rounded-2xl bg-black/40 ${metric.highlight ? 'border-accent/30 shadow-[0_0_30px_rgba(10,132,255,0.15)]' : 'border-white/5'}`}
                >
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase mb-3 text-center">{metric.label}</span>
                  <span className={`text-3xl font-bold ${metric.highlight ? 'text-accent' : 'text-white'}`}>{metric.value}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5, duration: 2 }}
              className="flex flex-col items-center mt-8"
            >
              <div className="w-16 h-[1px] bg-white/20 mb-8" />
              <h1 className="text-xl font-bold text-white tracking-widest uppercase opacity-50">
                ArenaOS <span className="text-accent">AI</span>
              </h1>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
