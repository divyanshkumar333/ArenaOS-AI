'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useState, useEffect } from 'react'

const TypewriterLog = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    setDisplayed('')
    const timer = setInterval(() => {
      setDisplayed(text.substring(0, i))
      i++
      if (i > text.length) clearInterval(timer)
    }, 30) // Speed of typing
    return () => clearInterval(timer)
  }, [text])
  return <span>{displayed}</span>
}

export function ActivityLog() {
  const history = useZoneStore((state) => state.incidentHistory)

  return (
    <div className="w-full h-full flex flex-col p-4 bg-transparent">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pointer-events-auto">
          <Terminal className="w-3.5 h-3.5 text-accent" /> Incident History
        </h3>
      </div>
      
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center font-mono text-[9px] text-accent/60 tracking-wider">
          <div className="flex items-center gap-1.5">
            <span>&gt; SYSTEM NOMINAL. NO INCIDENTS DETECTED.</span>
            <span className="w-1 h-3 bg-accent animate-pulse rounded-sm" />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col justify-start space-y-2 relative no-scrollbar">
        <AnimatePresence>
          {history.map((log, i) => {
            const isAuth = log.log.includes('AUTHORIZED')
            return (
              <motion.div
                layout
                key={i}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`text-[10px] font-mono bg-black/40 backdrop-blur-sm border-l-2 ${
                  isAuth ? 'border-accent text-accent' : 'border-gray-500 text-gray-300'
                } p-2 rounded-r pointer-events-auto`}
              >
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-gray-500">{log.time}</span>
                </div>
                <div className="">
                  <TypewriterLog text={log.log} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      )}
    </div>
  )
}
