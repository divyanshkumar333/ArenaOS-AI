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
  const { activeIncident, isMuted } = useZoneStore()
  const setShowImpactReport = useZoneStore(state => state.setShowImpactReport)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sequenceStep, setSequenceStep] = useState(0) // 0=loading, 1=running, 2=ready to execute
  const [reasoningStage, setReasoningStage] = useState(-1)
  const [isResolving, setIsResolving] = useState(false)
  const [resolveText, setResolveText] = useState('Execute')

  // Keep track of audio ticks so we don't trigger duplicates
  const lastPlayedStage = useRef(-1)

  // Custom step info mapper based on active incident data
  const getStageInfo = (stageIndex: number) => {
    if (!activeIncident) return { title: '', detail: '' }
    const type = activeIncident.incident_type.toLowerCase()
    const exp = activeIncident.explanation
    const action = activeIncident.recommended_action

    // Extract dynamic variables from explanation text using regex
    const flowMatch = exp.match(/capacity by (\d+) people\/min/)
    const flowRate = flowMatch ? flowMatch[1] : '142'

    const probMatch = exp.match(/probability now (\d+)%/)
    const bottleneckProb = probMatch ? probMatch[1] : '92'

    const etaMatch = exp.match(/in ([\d.]+) minutes/)
    const etaMin = etaMatch ? etaMatch[1] : '4.0'

    const altMatch = action.match(/under (\d+)% capacity/)
    const altCap = altMatch ? altMatch[1] : '42'

    const secOccMatch = exp.match(/congested at (\d+)% and (\d+)%/)
    const sec111 = secOccMatch ? secOccMatch[1] : '92'
    const sec113 = secOccMatch ? secOccMatch[2] : '85'

    const medicalEtaMatch = action.match(/ETA (\d+)s/)
    const medicalEta = medicalEtaMatch ? medicalEtaMatch[1] : '45'

    const fireOccMatch = exp.match(/occupancy is at (\d+)%/)
    const fireOcc = fireOccMatch ? fireOccMatch[1] : '45'

    const windMatch = exp.match(/measured NE at (\d+)mph/)
    const windSpeed = windMatch ? windMatch[1] : '15'

    const evacMatch = exp.match(/time: ([\d.]+) minutes/) || action.match(/time: ([\d.]+) minutes/)
    const evacTime = evacMatch ? evacMatch[1] : '3.2'

    if (type.includes('gate') || type.includes('crowd') || type.includes('overcrowd')) {
      switch (stageIndex) {
        case 0: return { title: 'Computer Vision', detail: `CCTV Feed Gate 3: ${flowRate} people/min detected` }
        case 1: return { title: 'Crowd Density Analysis', detail: `Occupancy threshold breached. Overload detected.` }
        case 2: return { title: 'Risk Assessment', detail: `Bottleneck probability ${bottleneckProb}%. Critical congestion in ${etaMin}m.` }
        case 3: return { title: 'Strategy Generation', detail: `Evaluating redirect scenarios to Gate 4 (${altCap}% load).` }
        case 4: return { title: 'Optimal Strategy Selected', detail: `Deploy Crowd Control Unit Beta (${(activeIncident.confidence * 100).toFixed(0)}% Conf)` }
        default: return { title: '', detail: '' }
      }
    } else if (type.includes('medical')) {
      switch (stageIndex) {
        case 0: return { title: 'Computer Vision', detail: 'Section 112: Seating fall anomaly flagged' }
        case 1: return { title: 'Crowd Density Analysis', detail: `Sectors 111 (${sec111}%) and 113 (${sec113}%) congestion warning.` }
        case 2: return { title: 'Risk Assessment', detail: 'Standard physical response path blocked. Ingress delay warning.' }
        case 3: return { title: 'Strategy Generation', detail: `Calculating rescue team routes. Dispatch target: CHARLIE (ETA ${medicalEta}s).` }
        case 4: return { title: 'Optimal Strategy Selected', detail: `Deploy Medical Response Team Charlie (${(activeIncident.confidence * 100).toFixed(0)}% Conf)` }
        default: return { title: '', detail: '' }
      }
    } else {
      switch (stageIndex) {
        case 0: return { title: 'Computer Vision', detail: `Sector 4: Thermal spike. Regional load ${fireOcc}%.` }
        case 1: return { title: 'Environmental Sensors', detail: `Sensors active. Wind vector: NE at ${windSpeed}mph.` }
        case 2: return { title: 'Risk Assessment', detail: 'Smoke expansion risk flagged. Exit corridor 12 clear.' }
        case 3: return { title: 'Strategy Generation', detail: `Simulating evacuation routes. Target evacuation: ${evacTime} minutes.` }
        case 4: return { title: 'Optimal Strategy Selected', detail: `Deploy Fire Safety Team Alpha (${(activeIncident.confidence * 100).toFixed(0)}% Conf)` }
        default: return { title: '', detail: '' }
      }
    }
  }

  // Thinking / status bar messages
  const getThinkingMessage = (stageIndex: number) => {
    switch (stageIndex) {
      case 0: return 'Scanning CCTV feeds...'
      case 1: return 'Analyzing crowd flow and density...'
      case 2: return 'Running predictive bottleneck simulations...'
      case 3: return 'Comparing response strategies...'
      case 4: return 'Selecting optimal intervention...'
      default: return 'Awaiting telemetry stream...'
    }
  }

  // Orchestrate the pipeline timing to feel highly intelligent (1.2–1.5s total)
  useEffect(() => {
    if (!activeIncident) return
    setSequenceStep(0)
    setIsResolving(false)
    setResolveText('Execute')
    setReasoningStage(-1)
    lastPlayedStage.current = -1

    const timers = [
      setTimeout(() => { setSequenceStep(1); setReasoningStage(0) }, 150),
      setTimeout(() => { setReasoningStage(1) }, 350),
      setTimeout(() => { setReasoningStage(2) }, 650),
      setTimeout(() => { setReasoningStage(3) }, 950),
      setTimeout(() => { setReasoningStage(4) }, 1200),
      setTimeout(() => { setSequenceStep(2) }, 1400), // Ready to execute
    ]
    return () => timers.forEach(clearTimeout)
  }, [activeIncident])

  // Play audio ticks synchronized with pipeline progress
  useEffect(() => {
    if (reasoningStage > lastPlayedStage.current) {
      if (reasoningStage === 4) {
        playSynthSound('tick', isMuted)
      } else if (reasoningStage >= 0) {
        playSynthSound('hum', isMuted)
      }
      lastPlayedStage.current = reasoningStage
    }
  }, [reasoningStage, isMuted])

  // Speak explanation when ready
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel(); setIsSpeaking(false)

    if (activeIncident && !isMuted && sequenceStep === 2) {
      const u = new SpeechSynthesisUtterance(activeIncident.explanation)
      u.rate = 1.05
      u.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en') && /(UK English|Daniel|Samantha)/i.test(v.name)) || null
      u.onstart = () => setIsSpeaking(true)
      u.onend = u.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(u)
    }
    return () => window.speechSynthesis?.cancel()
  }, [activeIncident, isMuted, sequenceStep])

  const handleResolve = async () => {
    setResolveText('Strategy Approved.')
    setIsResolving(true)
    window.speechSynthesis?.cancel()
    playSynthSound('execute', isMuted)
    
    try {
      await fetch('http://localhost:8000/api/demo/resolve', { method: 'POST' })
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
      <div className={`backdrop-blur-xl border ${c.border} bg-[#0c0d12]/92 p-5 shadow-2xl rounded-xl relative overflow-hidden flex flex-col h-full`}>

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

        {/* AI Thinking Header / Status Bar */}
        <div className="mb-4 shrink-0 bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge size={12} className="text-accent animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/80">
              {getThinkingMessage(reasoningStage)}
            </span>
          </div>
          {reasoningStage < 4 && (
            <Loader2 className="w-3 h-3 animate-spin text-accent" />
          )}
        </div>

        {/* Left-to-right progress line */}
        <div className="w-full h-[1.5px] bg-white/[0.05] rounded-full mb-5 overflow-hidden shrink-0">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${Math.max(0, ((reasoningStage + 1) / 5) * 100)}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>

        {/* Pipeline / Reasoning Checklist Area */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent space-y-4 pr-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const info = getStageInfo(i)
            const completed = reasoningStage > i
            const processing = reasoningStage === i
            const pending = reasoningStage < i

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: pending ? 0.25 : 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3.5"
              >
                {/* State Indicator */}
                <div className="shrink-0 mt-0.5">
                  {completed && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-4 h-4 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent">
                      <span className="text-[9px] font-bold">✓</span>
                    </motion.div>
                  )}
                  {processing && (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="w-4 h-4 rounded-full border border-accent border-t-transparent flex items-center justify-center" />
                  )}
                  {pending && (
                    <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center text-gray-700">
                      <span className="text-[8px] font-mono">○</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[10px] font-mono uppercase tracking-wider ${processing ? 'text-accent font-bold' : 'text-gray-300'}`}>
                    {info.title}
                  </h4>
                  {(!pending) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-gray-400 mt-1 leading-relaxed"
                    >
                      {info.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Action Button & Dispatch Control */}
        <AnimatePresence>
          {sequenceStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-4 pt-3 border-t border-white/5 shrink-0"
            >
              <div className="flex items-center justify-between mb-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                <span>Verification State</span>
                {isSpeaking && (
                  <div className="flex items-center gap-1 text-accent">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Copilot Audio Streaming</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="flex-1 flex items-center justify-center space-x-2.5 bg-accent hover:bg-accent/80 active:scale-95 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all disabled:opacity-85 shadow-[0_0_20px_rgba(10,132,255,0.15)]"
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
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="flex-1 flex items-center justify-center space-x-2 bg-transparent hover:bg-white/5 active:scale-95 text-gray-400 border border-white/10 font-semibold text-xs py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
