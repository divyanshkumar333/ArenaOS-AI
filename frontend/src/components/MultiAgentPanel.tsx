import { useState, useEffect, useRef } from 'react'
import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, BrainCircuit, Eye, Truck, ShieldAlert, Fingerprint } from 'lucide-react'

export function MultiAgentPanel() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const isMuted = useZoneStore(state => state.isMuted)
  const setShowDecisionMatrix = useZoneStore(state => state.setShowDecisionMatrix)
  const [step, setStep] = useState(0)
  const [showOverride, setShowOverride] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [authProgress, setAuthProgress] = useState(0)
  const authIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!activeIncident) return
    setStep(0); setShowOverride(false); setIsResolving(false); setAuthProgress(0)
    const timers = [100, 300, 500, 700].map((d, i) => setTimeout(() => setStep(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [activeIncident])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (activeIncident && !isMuted && step === 3) {
      const u = new SpeechSynthesisUtterance(activeIncident.explanation)
      u.rate = 1.1; u.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en') && /(UK English|Daniel|Samantha)/i.test(v.name)) || null
      window.speechSynthesis.speak(u)
    }
    return () => window.speechSynthesis?.cancel()
  }, [activeIncident, isMuted, step])

  const handleAuthorize = () => {
    let p = 0
    authIntervalRef.current = setInterval(() => {
      p += 10; setAuthProgress(p)
      if (p >= 100) { clearInterval(authIntervalRef.current!); executeResolution() }
    }, 100)
  }

  const cancelAuthorize = () => { clearInterval(authIntervalRef.current!); setAuthProgress(0) }

  const executeResolution = async () => {
    setIsResolving(true); setShowOverride(false); window.speechSynthesis?.cancel()
    try { await fetch('http://localhost:8000/api/demo/resolve', { method: 'POST' }) } catch (e) { console.error(e) }
  }

  const agents = activeIncident ? [
    { s: 1, id: 'vision', border: 'border-blue-500', text: 'text-blue-400', iconText: 'text-blue-500', Icon: Eye, title: 'Vision Agent', desc: `Detected ${activeIncident.incident_type} in ${activeIncident.zone_name}.`, meta: `CONFIDENCE: ${(activeIncident.confidence * 100).toFixed(1)}%` },
    { s: 2, id: 'logistics', border: 'border-yellow-500', text: 'text-yellow-400', iconText: 'text-yellow-500', Icon: Truck, title: 'Logistics Agent', desc: 'Evaluating crowd density and egress routes... Impact estimated at high.', meta: 'STATUS: ROUTE_CALCULATED' },
    { s: 3, id: 'cmd', border: 'border-red-500', text: 'text-red-400', iconText: 'text-red-500', bg: 'bg-red-500/5', Icon: ShieldAlert, title: 'Command Agent Synthesis', desc: activeIncident.explanation, meta: `ACTION: ${activeIncident.recommended_action}`, isCmd: true }
  ] : []

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center"><BrainCircuit className="w-3 h-3 mr-2" />Agent Swarm</h2>
        {activeIncident && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>}
      </div>

      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="popLayout">
          {activeIncident && (
            <motion.div key={activeIncident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col flex-1 min-h-0 w-full relative">
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar min-h-0 pb-4">
                <AnimatePresence>
                  {agents.map(a => step >= a.s && (
                    <motion.div key={a.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`border-l-2 ${a.border} pl-3 py-1 relative ${a.bg || ''} ${a.isCmd ? 'rounded-r-md' : ''}`}>
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-[#111116] rounded-full flex items-center justify-center"><a.Icon className={`w-3 h-3 ${a.iconText}`} /></div>
                      <div className={`text-[9px] ${a.text} font-mono font-bold uppercase mb-1`}>{a.title}</div>
                      <div className={a.isCmd ? "text-sm text-white font-medium leading-relaxed" : "text-xs text-gray-300"}>{a.desc}</div>
                      <div className={a.isCmd ? "mt-2 text-xs font-semibold text-red-300 bg-red-500/10 p-2 rounded" : "text-[8px] font-mono text-gray-500 mt-1"}>{a.meta}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {step >= 4 && !showOverride && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
                    <button onClick={() => setShowDecisionMatrix(true)} disabled={isResolving} className="flex-1 flex items-center justify-center space-x-1.5 bg-accent hover:bg-accent/80 active:scale-95 text-white font-semibold text-[10px] sm:text-xs py-2 px-2 sm:px-4 rounded-md transition-all disabled:opacity-50">
                      {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /><span>Execute</span></>}
                    </button>
                    <button onClick={() => setShowOverride(true)} disabled={isResolving} className="flex-1 flex items-center justify-center space-x-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 active:scale-95 text-red-100 font-semibold text-[10px] sm:text-xs py-2 px-2 sm:px-4 rounded-md transition-all disabled:opacity-50">
                      <ShieldAlert className="w-3.5 h-3.5" /><span>Override</span>
                    </button>
                    <button onClick={executeResolution} disabled={isResolving} className="flex-1 flex items-center justify-center space-x-1.5 bg-transparent hover:bg-white/5 active:scale-95 text-gray-300 border border-white/20 font-semibold text-[10px] sm:text-xs py-2 px-2 sm:px-4 rounded-md transition-all">
                      <XCircle className="w-3.5 h-3.5" /><span>Dismiss</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showOverride && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md rounded border border-red-500/30 flex flex-col items-center justify-center p-4 text-center">
                    <ShieldAlert className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                    <h3 className="text-sm font-bold text-white mb-1">COMMANDER OVERRIDE</h3>
                    <p className="text-[10px] text-gray-400 mb-6">Authorization required to dispatch autonomous response.</p>
                    <button onPointerDown={handleAuthorize} onPointerUp={cancelAuthorize} onPointerLeave={cancelAuthorize} className="relative w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center text-accent hover:bg-accent/10 active:scale-95 transition-all overflow-hidden group select-none cursor-pointer">
                      <Fingerprint className="w-8 h-8 z-10" />
                      <div className="absolute bottom-0 left-0 w-full bg-accent/30 z-0 transition-all duration-100 ease-linear" style={{ height: `${authProgress}%` }} />
                    </button>
                    <div className="text-[8px] font-mono mt-2 text-accent uppercase tracking-widest">Hold to Authorize</div>
                    <button onClick={() => setShowOverride(false)} className="mt-6 text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
