import React from 'react'
import { motion } from 'framer-motion'

interface ArenaLogoProps {
  className?: string
  size?: number
  animate?: boolean
}

export function ArenaLogo({ className = '', size = 24, animate = false }: ArenaLogoProps) {
  // A clean, monoline geometric arena bowl with a center dot
  // Represents: Stadium/Arena, Target/Focus, Command Center, and Digital Twin Layers

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Outer Stadium Bowl */}
      <rect x="2" y="5" width="20" height="14" rx="7" />
      
      {/* Inner Track / Telemetry Ring */}
      <rect x="6" y="8" width="12" height="8" rx="4" />
      
      {/* Intelligence Core / Pitch Center */}
      {animate ? (
        <motion.circle 
          cx="12" 
          cy="12" 
          r="1.5" 
          fill="currentColor" 
          stroke="none"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />
      ) : (
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      )}
    </svg>
  )
}
