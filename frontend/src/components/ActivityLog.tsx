'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'

export function ActivityLog() {
  const logs = useZoneStore((state) => state.logs)

  return (
    <div className="w-full h-full flex flex-col p-5 bg-transparent">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.08]">
        <h3 className="text-sm font-medium text-white/60 flex items-center gap-2 pointer-events-auto">
          <Terminal className="w-3 h-3 text-white/60" /> Activity Log
        </h3>
      </div>
      
      {logs.length === 0 ? (
        <div className="flex-grow flex items-center justify-center font-mono text-[9px] text-accent/60 tracking-wider">
          <div className="flex items-center gap-1.5">
            <span>&gt; MONITORS ACTIVE. AWAITING INTRUSION TELEMETRY</span>
            <span className="w-1 h-3 bg-accent animate-pulse rounded-sm" />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-2 relative">
        {/* List of Logs */}
        
        <AnimatePresence>
          {logs.slice(0, 10).map((log, i) => {
            const isCritical = log.severity === 'critical'
            const isResolved = log.severity === 'resolved'
            let color = 'text-gray-400'
            if (isCritical) color = 'text-red-400'
            else if (log.severity === 'warning') color = 'text-yellow-400'
            else if (isResolved) color = 'text-green-400'

            return (
              <motion.div
                layout
                key={log.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1 - (i * 0.1), y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`text-xs font-mono bg-black/40 backdrop-blur-sm border-l-2 ${
                  isCritical ? 'border-red-500' : isResolved ? 'border-green-500' : 'border-yellow-500'
                } p-3 rounded-r pointer-events-auto`}
              >
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={color}>{log.zone_name}</span>
                </div>
                <div className="text-gray-300">
                  {log.explanation}
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
