import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, FastForward, Clock, Rewind } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'

export function TimeMachineScrubber() {
  const predictiveTimeOffset = useZoneStore(state => state.predictiveTimeOffset)
  const setPredictiveTimeOffset = useZoneStore(state => state.setPredictiveTimeOffset)
  
  const playbackMode = useZoneStore(state => state.playbackMode)
  const playbackIndex = useZoneStore(state => state.playbackIndex)
  const historicalSnapshots = useZoneStore(state => state.historicalSnapshots)
  const setPlaybackIndex = useZoneStore(state => state.setPlaybackIndex)
  const setPlaybackMode = useZoneStore(state => state.setPlaybackMode)
  const predictions = useZoneStore(state => state.predictions)

  const [speed, setSpeed] = useState<'1x' | '2x' | '4x'>('1x')

  const maxIndex = Math.max(0, historicalSnapshots.length - 1)

  // Handlers
  const handleTogglePlayback = () => {
    setPlaybackMode(!playbackMode)
  }

  const handleRewind = () => {
    if (playbackMode) {
      setPlaybackIndex(0)
    } else {
      setPredictiveTimeOffset(0)
    }
  }

  const handleForward = () => {
    if (playbackMode) {
      setPlaybackIndex(maxIndex)
    } else {
      setPredictiveTimeOffset(60)
    }
  }

  const isLive = !playbackMode && predictiveTimeOffset === 0

  return (
    <div className={`w-full max-w-2xl bg-[rgba(10,10,12,0.65)] backdrop-blur-3xl border rounded-[24px] p-3 shadow-2xl transition-all duration-300 pointer-events-auto ${
      playbackMode 
        ? 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)]' 
        : 'border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2 select-none">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
            playbackMode 
              ? 'bg-red-500/10 border-red-500/30 text-red-500' 
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}>
            {playbackMode ? <Rewind className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          </div>
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2">
              Simulation Control Center
              <span className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase animate-pulse select-none ${
                playbackMode 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-accent/20 text-accent border border-accent/30'
              }`}>
                {playbackMode ? 'HISTORICAL PLAYBACK' : 'LIVE PREDICTIVE ENGINE'}
              </span>
            </h3>
            <p className="text-[9px] text-gray-500 font-mono tracking-wider mt-0.5 uppercase">
              {playbackMode 
                ? (historicalSnapshots[playbackIndex] 
                    ? `SNAPSHOT ${playbackIndex + 1}/${historicalSnapshots.length} — ${new Date(historicalSnapshots[playbackIndex].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : 'NO HISTORICAL DATA')
                : (predictiveTimeOffset === 0 
                    ? "LIVE TELEMETRY ACTIVE" 
                    : `PREDICTIVE FORECAST: +${predictiveTimeOffset} MINS (${new Date(Date.now() + predictiveTimeOffset * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mb-0.5">Time Horizon</div>
          <div className={`font-mono text-xs font-bold ${!isLive ? (playbackMode ? 'text-red-400' : 'text-accent') : 'text-white'}`}>
            {playbackMode ? `T-${maxIndex - playbackIndex} SNAP` : `+${predictiveTimeOffset} MINS`}
          </div>
        </div>
      </div>

      {/* Timeline Slider Section */}
      <div className="relative pt-1 pb-3 px-1">
        <input 
          type="range" 
          min="0" 
          max={playbackMode ? maxIndex : 60} 
          step="1"
          value={playbackMode ? playbackIndex : predictiveTimeOffset}
          onChange={(e) => {
            if (playbackMode) {
              setPlaybackIndex(Number(e.target.value))
            } else {
              setPredictiveTimeOffset(Number(e.target.value))
            }
          }}
          className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer outline-none relative z-10 transition-all ${
            playbackMode 
              ? '[&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#ef4444]' 
              : '[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_#0a84ff]'
          } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full`}
        />
        
        {/* Timeline Progress Bar */}
        <div 
          className={`absolute top-2 left-1 h-1.5 rounded-l-full pointer-events-none z-0 transition-all ${
            playbackMode ? 'bg-red-500/50' : 'bg-accent/50'
          }`}
          style={{ 
            width: `calc(${
              playbackMode 
                ? (maxIndex > 0 ? (playbackIndex / maxIndex) * 100 : 0) 
                : (predictiveTimeOffset / 60) * 100
            }% - 8px)` 
          }}
        />

        {/* Timeline Tick Marks */}
        <div className="absolute top-2 left-0 right-0 h-1.5 flex justify-between px-1 pointer-events-none z-0">
          {(playbackMode 
            ? ['60m Ago', '45m Ago', '30m Ago', '15m Ago', 'LIVE'] 
            : ['LIVE', '+15m', '+30m', '+45m', '+60m']
          ).map((label, idx) => {
            const pct = idx * 25
            const isActive = playbackMode 
              ? (playbackIndex / Math.max(1, maxIndex)) * 100 >= pct 
              : (predictiveTimeOffset / 60) * 100 >= pct
            return (
              <div key={label} className="flex flex-col items-center relative -top-3">
                <div className={`w-[1px] h-2 mb-1 transition-colors ${
                  isActive 
                    ? (playbackMode ? 'bg-red-500' : 'bg-accent') 
                    : 'bg-white/20'
                }`} />
                <span className={`text-[8px] font-mono absolute top-4 transition-all whitespace-nowrap ${
                  isActive 
                    ? (playbackMode ? 'text-red-400 font-bold' : 'text-accent font-bold') 
                    : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Predictive Event Markers */}
        {!playbackMode && predictions.filter(p => !p.resolved).map(p => (
          <button
            key={p.id}
            onClick={() => setPredictiveTimeOffset(p.time_offset)}
            className={`absolute top-0 w-3 h-3 -mt-0.5 -ml-1.5 rounded-full border-2 border-[rgba(10,10,12,0.85)] flex items-center justify-center cursor-pointer transition-transform hover:scale-150 z-20 ${
              p.severity === 'critical' 
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' 
                : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
            }`}
            style={{ left: `${(p.time_offset / 60) * 100}%` }}
            title={`${p.zone_name}: ${p.inference}`}
          >
            <span className="absolute -top-4 text-[7px] font-bold text-white whitespace-nowrap bg-black/80 px-1 rounded border border-white/20">
              +{p.time_offset}m
            </span>
          </button>
        ))}
      </div>

      {/* Control Tools Row */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 mt-1">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRewind}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            title="Reset to Start"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleTogglePlayback}
            className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all text-[9px] font-mono font-bold ${
              playbackMode 
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            title={playbackMode ? "Exit Playback (Resume Live)" : "Pause Live (Enter Playback)"}
          >
            {playbackMode ? (
              <>
                <Play className="w-3 h-3" />
                <span>RESUME LIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>PAUSE TIMELINE</span>
              </>
            )}
          </button>

          <button 
            onClick={handleForward}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            title="Jump to End"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Playback Speed Selector */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5 text-[9px] font-mono select-none">
          <span className="text-gray-500 px-2 text-[8px] uppercase tracking-wider font-bold">Speed</span>
          {(['1x', '2x', '4x'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded-lg transition-all border ${
                speed === s 
                  ? (playbackMode 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 font-bold' 
                      : 'bg-accent/20 border-accent/40 text-accent font-bold') 
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right: Live Sync Return Button */}
        <div>
          {!isLive ? (
            <button
              onClick={() => {
                setPlaybackMode(false)
                setPredictiveTimeOffset(0)
              }}
              className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-[9px] font-mono font-bold tracking-wider hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse"
            >
              [ RETURN TO LIVE ]
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-xl text-[9px] font-mono text-green-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              <span>LIVE SYSTEM</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
