'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Cpu, ShieldCheck } from 'lucide-react'

interface Message { id: string, sender: 'ai' | 'user', text: string, action?: string }

const PROMPTS = ["Analyze Gate 3 feed", "Status of Section 112", "Resolve active incident", "System reset"]

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([{ id: '1', sender: 'ai', text: 'ArenaOS Core Intelligence online. Standing by for spatial commands.' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const triggerBackend = async (endpoint: string, payload?: any) => {
    try { await fetch(`http://127.0.0.1:8000/api/demo/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload ? JSON.stringify(payload) : undefined }) } 
    catch { console.warn("Backend unreachable.") }
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text }])
    setInput(''); setIsTyping(true)

    await new Promise(r => setTimeout(r, 600))
    const t = text.toLowerCase()
    
    let res = "I am parsing your request against the live digital twin ontology. Currently, no structural anomalies match this query.", action: string | undefined
    if (t.includes('gate 3') || t.includes('analyze')) {
      res = "Analyzing Gate 3 telemetry... Anomalous volume detected. Triggering Crowd Dispersion protocols and dispatching drones to sector."
      triggerBackend('trigger', { incident_type: 'Gate 3 Overcrowding' }); action = "DISPATCHING DRONE SWARM"
    } else if (t.includes('section 112') || t.includes('medical')) {
      res = "Section 112 reports critical biomedical flags. Routing EMS Fast-Track and locking down adjacent turnstiles."
      triggerBackend('trigger', { incident_type: 'Section 112 Medical Event' }); action = "EMS PROTOCOL INITIATED"
    } else if (t.includes('resolve') || t.includes('fix')) {
      res = "Executing resolution protocols. Re-routing traffic and stabilizing sector density."
      triggerBackend('resolve'); action = "SYSTEM NOMINAL"
    } else if (t.includes('reset')) {
      res = "Flushing telemetry buffer and resetting digital twin to baseline."
      triggerBackend('reset'); action = "BASELINE RESTORED"
    }

    setIsTyping(false)
    const aiId = (Date.now() + 1).toString()
    setMessages(p => [...p, { id: aiId, sender: 'ai', text: '', action }])

    for (let i = 0; i <= res.length; i++) {
      setMessages(p => {
        const n = [...p]; n[n.length - 1].text = res.slice(0, i); return n
      })
      await new Promise(r => setTimeout(r, 15))
    }
  }

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,0.85)] border border-white/[0.08] rounded-2xl backdrop-blur-xl flex flex-col font-sans overflow-hidden shadow-2xl">
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="relative"><Cpu className="w-3 h-3 text-accent" /><span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full animate-ping" /></div>
          <div><h2 className="text-xs font-bold text-white uppercase tracking-wider">ArenaOS Copilot</h2><p className="text-[9px] text-accent font-mono uppercase tracking-widest leading-none mt-0.5">Agentic Interface</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map(m => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${m.sender === 'user' ? 'bg-white/5 border-white/20 text-gray-300' : 'bg-accent/10 border-accent/30 text-accent'}`}>
              {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 text-sm max-w-[85%] ${m.sender === 'user' ? 'bg-accent/10 border border-accent/20 text-white rounded-lg rounded-tr-none text-xs' : 'bg-black/40 border border-white/[0.08] text-gray-300 rounded-lg rounded-tl-none font-mono leading-relaxed text-[10px]'}`}>
                {m.text}
              </div>
              {m.action && <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[8px] font-mono text-green-400 uppercase tracking-widest"><ShieldCheck className="w-2.5 h-2.5" />{m.action}</div>}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-7 h-7 rounded-lg shrink-0 bg-accent/10 border border-accent/30 flex items-center justify-center text-accent"><Bot className="w-3 h-3" /></div>
            <div className="flex gap-1.5 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg rounded-tl-none">
              {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/[0.08] bg-black/40 shrink-0">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {PROMPTS.map(p => (
            <button key={p} onClick={() => handleSend(p)} className="text-[8px] font-mono text-gray-400 uppercase border border-white/[0.08] bg-white/5 px-2 py-0.5 rounded hover:bg-accent/15 hover:text-accent hover:border-accent/30 transition-all duration-200 whitespace-nowrap">{p}</button>
          ))}
        </div>
        <div className="relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend(input)} placeholder="Command..." className="w-full bg-[#030305]/80 border border-white/[0.08] focus:border-accent/50 rounded-lg py-2.5 pl-4 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none transition-all duration-300" />
          <button onClick={() => handleSend(input)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-accent transition-colors"><Send className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  )
}
