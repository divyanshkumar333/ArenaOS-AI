'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { Play, Pause, RotateCcw, FastForward, XCircle, Video } from 'lucide-react'

export function DemoControlsPanel() {
  const demoMode = useZoneStore(s => s.demoMode)
  const demoStage = useZoneStore(s => s.demoStage)
  const _demoTimer = useZoneStore(s => s._demoTimer)
  const isRecordingMode = useZoneStore(s => s.isRecordingMode)
  const setIsRecordingMode = useZoneStore(s => s.setIsRecordingMode)
  const runDemo = useZoneStore(s => s.runDemo)
  const pauseDemo = useZoneStore(s => s.pauseDemo)
  const resumeDemo = useZoneStore(s => s.resumeDemo)
  const stopDemo = useZoneStore(s => s.stopDemo)
  const skipScene = useZoneStore(s => s.skipScene)

  if (!demoMode && !isRecordingMode) {
    return null
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[rgba(10,10,12,0.6)] backdrop-blur-md border border-white/5 rounded-xl shadow-lg transition-opacity duration-300 w-full ${isRecordingMode && demoStage > 0 ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
      
      {!demoMode ? (
        <button onClick={runDemo} className="p-1.5 rounded hover:bg-white/10 text-white transition-colors" title="Start Demo">
          <Play className="w-3.5 h-3.5 text-accent" />
        </button>
      ) : _demoTimer ? (
        <button onClick={pauseDemo} className="p-1.5 rounded hover:bg-white/10 text-white transition-colors" title="Pause Demo">
          <Pause className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button onClick={() => resumeDemo()} className="p-1.5 rounded hover:bg-white/10 text-white transition-colors" title="Resume Demo">
          <Play className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

      <button onClick={() => { stopDemo(); runDemo(); }} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Restart Demo">
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <button onClick={skipScene} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Skip Scene">
        <FastForward className="w-3.5 h-3.5" />
      </button>
      
      <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

      <button onClick={stopDemo} className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Exit Demo">
        <XCircle className="w-3.5 h-3.5" />
      </button>

    </div>
  )
}
