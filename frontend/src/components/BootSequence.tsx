'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useZoneStore } from '@/store/useZoneStore'
import { useEffect, useState } from 'react'

export function BootSequence() {
  const demoStage = useZoneStore(state => state.demoStage)
  const isBooting = demoStage === 1
  
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (isBooting) {
      setMessages([])
      const sequence = [
        { text: 'Initializing AI Systems...', delay: 500 },
        { text: 'Loading Digital Twin...', delay: 1200 },
        { text: 'Connecting CCTV...', delay: 2000 },
        { text: 'Connecting Sensors...', delay: 2800 },
        { text: 'Loading Multi-Agent Network...', delay: 3600 },
        { text: 'Mission Ready.', delay: 4500 }
      ]

      const timers = sequence.map(seq => 
        setTimeout(() => setMessages(prev => [...prev, seq.text]), seq.delay)
      )

      return () => timers.forEach(clearTimeout)
    }
  }, [isBooting])

  return (
    <AnimatePresence>
      {isBooting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[999] bg-[#050508] flex items-center justify-center font-mono pointer-events-auto"
        >
          <div className="flex flex-col items-center justify-center gap-8 w-[600px]">
            {/* ArenaOS Logo / Title */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl font-bold text-white tracking-widest uppercase">
                ArenaOS <span className="text-accent">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-2">
                Enterprise Stadium Operations Platform
              </p>
            </motion.div>

            {/* Terminal Boot Sequence */}
            <div className="w-full flex flex-col gap-2 mt-8 h-[160px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs uppercase tracking-widest ${i === messages.length - 1 ? 'text-accent font-bold mt-4' : 'text-gray-400'}`}
                >
                  <span className="opacity-50 mr-2">[SYSTEM]</span> {msg}
                </motion.div>
              ))}
              
              {/* Blinking cursor effect */}
              {messages.length > 0 && messages.length < 6 && (
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2 h-3 bg-white/50 mt-1"
                />
              )}
            </div>
            
            {/* Minimalist Progress Bar */}
            <div className="w-full h-[1px] bg-white/5 relative overflow-hidden mt-8">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_10px_#0a84ff]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
