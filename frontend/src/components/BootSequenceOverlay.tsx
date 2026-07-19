"use client"

import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function BootSequenceOverlay() {
  const { progress, active } = useProgress()
  const [bootPhase, setBootPhase] = useState(0)

  const phases = [
    "INITIALIZING DIGITAL TWIN...",
    "Loading geometry...",
    "Loading materials...",
    "Loading AI overlays...",
    "Synchronizing sensors...",
    "Connecting cameras...",
    "Digital Twin Ready"
  ]

  useEffect(() => {
    // Map the 0-100 progress to the boot phases smoothly
    if (active) {
      if (progress < 20) setBootPhase(0)
      else if (progress < 40) setBootPhase(1)
      else if (progress < 60) setBootPhase(2)
      else if (progress < 80) setBootPhase(3)
      else if (progress < 95) setBootPhase(4)
      else if (progress < 100) setBootPhase(5)
      else setBootPhase(6)
    } else {
      if (progress === 100) setBootPhase(6)
    }
  }, [progress, active])

  // Fallback auto-progression when not actively loading (e.g. cached or idle)
  useEffect(() => {
    if (!active && bootPhase < 6) {
      const timer = setInterval(() => {
        setBootPhase(p => {
          if (p >= 6) {
            clearInterval(timer)
            return 6
          }
          return p + 1
        })
      }, 400)
      return () => clearInterval(timer)
    }
  }, [active, bootPhase])

  const displayProgress = active ? progress : [0, 15, 35, 55, 75, 90, 100][bootPhase]

  return (
    <AnimatePresence>
      {(active || bootPhase < 6) && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
          className="absolute inset-0 z-[100] bg-[#06070a] flex flex-col items-center justify-center font-mono"
        >
          <div className="w-96">
            <div className="flex justify-between text-xs text-accent mb-2">
              <span>SYS.BOOT</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 w-full bg-accent/20 rounded-full overflow-hidden mb-8">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            {/* Logs Sequence */}
            <div className="flex flex-col gap-2 h-40 overflow-hidden text-sm">
              {phases.map((phase, i) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: bootPhase >= i ? (bootPhase === i ? 1 : 0.4) : 0,
                    x: bootPhase >= i ? 0 : -10
                  }}
                  className={bootPhase === i ? "text-accent animate-pulse" : "text-accent/40"}
                >
                  {bootPhase >= i ? `> ${phase}` : ""}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
