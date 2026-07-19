'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useZoneStore } from '@/store/useZoneStore'
import { AlertTriangle, CheckCircle, XCircle, Volume2, Loader2, Eye, Brain, Search, Lightbulb, Rocket, GitMerge } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

// Synthesize high-fidelity sound effects using Web Audio API
const playSynthSound = (type: 'tick' | 'hum' | 'execute', isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    if (type === 'tick') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(980, now) // Clean high tick
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
    } else if (type === 'hum') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(75, now) // Low frequency pulse
      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.3)
    } else if (type === 'execute') {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(55, now)
      osc1.frequency.exponentialRampToValueAtTime(25, now + 0.7) // Deep impact sweep

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(110, now)
      osc2.frequency.exponentialRampToValueAtTime(45, now + 0.6)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.85)
      osc2.stop(now + 0.85)
    }
  } catch (e) {
    console.warn('Audio synthesis failed', e)
  }
}

export function IncidentPanel() {
  const activeIncident = useZoneStore(s => s.activeIncident)
  const isMuted = useZoneStore(s => s.isMuted)
  const setShowImpactReport = useZoneStore(state => state.setShowImpactReport)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sequenceStep, setSequenceStep] = useState(0) // 0=loading, 1=running, 2=ready to execute
  const [reasoningStage, setReasoningStage] = useState(-1)
  const [isResolving, setIsResolving] = useState(false)
  const [resolveText, setResolveText] = useState('Execute')

  // Keep track of audio ticks so we don't trigger duplicates
  const lastPlayedStage = useRef(-1)





  // Speak explanation when evidence is available
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel(); setIsSpeaking(false)

    if (activeIncident?.evidence && !isMuted) {
      const u = new SpeechSynthesisUtterance(activeIncident.explanation)
      u.rate = 1.05
      u.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en') && /(UK English|Daniel|Samantha)/i.test(v.name)) || null
      u.onstart = () => setIsSpeaking(true)
      u.onend = u.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(u)
    }
    return () => window.speechSynthesis?.cancel()
  }, [activeIncident, isMuted])

  const handleResolve = async () => {
    setResolveText('Strategy Approved.')
    setIsResolving(true)
    window.speechSynthesis?.cancel()
    playSynthSound('execute', isMuted)
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/resolve`, { method: 'POST' })
      setTimeout(() => {
        setIsResolving(false)
        setShowImpactReport(true)
      }, 700)
    } catch (e) {
      console.error(e)
      setTimeout(() => {
        setIsResolving(false)
        setShowImpactReport(true)
      }, 700)
    }
  }

  if (!activeIncident) return null

  const c = activeIncident.severity === 'critical'
    ? { border: 'border-red-900/40', bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' }
    : { border: 'border-yellow-900/40', bg: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]' }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="w-full flex flex-col pointer-events-auto h-full">
      <div className={`backdrop-blur-3xl border ${c.border} shadow-[inset_0_0_30px_rgba(255,255,255,0.015)] bg-gradient-to-br from-[#0c0d12]/95 to-[#1a1c23]/80 p-5 shadow-2xl rounded-[24px] relative overflow-hidden flex flex-col h-full`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className={`w-2 h-2 rounded-full animate-pulse ${c.bg} ${c.glow}`} />
            <h2 className={`font-sans font-black text-base tracking-widest uppercase ${c.text}`}>{activeIncident.incident_type}</h2>
          </div>
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
            ID: {activeIncident.zone_id}
          </div>
        </div>

        {/* Evidence Area */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent pr-1">
          {activeIncident.evidence ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col justify-center">
                   <span className="text-[8px] text-gray-500 uppercase font-mono mb-0.5">Queue Length</span>
                   <span className="text-sm font-bold text-white">{activeIncident.evidence.queueLength} <span className="text-[9px] text-gray-400 font-normal">pax</span></span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col justify-center">
                   <span className="text-[8px] text-gray-500 uppercase font-mono mb-0.5">Average Wait</span>
                   <span className="text-sm font-bold text-red-400">{activeIncident.evidence.averageWait} <span className="text-[9px] text-gray-400 font-normal">min</span></span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col justify-center">
                   <span className="text-[8px] text-gray-500 uppercase font-mono mb-0.5">Exit Capacity</span>
                   <span className="text-sm font-bold text-white">{activeIncident.evidence.exitCapacity} <span className="text-[9px] text-gray-400 font-normal">/min</span></span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col justify-center">
                   <span className="text-[8px] text-gray-500 uppercase font-mono mb-0.5">Predicted Overflow</span>
                   <span className="text-sm font-bold text-yellow-400">+{activeIncident.evidence.predictedOverflow} <span className="text-[9px] text-gray-400 font-normal">min</span></span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500 mb-2 block border-b border-white/10 pb-1">Supporting Data</span>
                <ul className="space-y-1.5 mt-2">
                  {activeIncident.evidence.supportingData?.map((data, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[10px] font-mono text-gray-300">
                      <span className="w-1 h-1 rounded-full bg-accent/50"></span> {data}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded">
                <span className="text-[9px] uppercase tracking-widest font-mono text-accent block mb-1">AI Conclusion</span>
                <p className="text-xs text-white/90 leading-relaxed font-sans">{activeIncident.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Aggregating Evidence...</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <AnimatePresence>
          {activeIncident.evidence && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-4 pt-3 border-t border-white/5 shrink-0"
            >
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="w-full flex items-center justify-center space-x-2.5 bg-accent hover:bg-accent/80 active:scale-95 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all disabled:opacity-85 shadow-[0_0_20px_rgba(10,132,255,0.15)] uppercase tracking-widest font-mono"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>{resolveText}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{resolveText}</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
