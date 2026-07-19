'use client'

import { useEffect } from 'react'
import { useZoneStore } from '@/store/useZoneStore'

export function DemoController() {
  const runDemo = useZoneStore(state => state.runDemo)
  const stopDemo = useZoneStore(state => state.stopDemo)
  const demoMode = useZoneStore(state => state.demoMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        if (demoMode) {
          stopDemo()
        } else {
          runDemo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [demoMode, runDemo, stopDemo])

  return null
}
