'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Cpu, ShieldCheck } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'

interface Message { id: string; sender: 'ai' | 'user'; text: string; action?: string }

const PROMPTS = ['Gate 3 congestion', 'Section 112 medical', 'Suspicious package', 'Weather impact', 'Grid power outage', 'VIP Motorcade Arrival', 'Drone Airspace Intrusion', 'Active Shooter Alert', 'Cyberattack on BMS', 'Structural Anomaly', 'Chemical Leak']

/**
 * Build a context-aware response by reading live simulation state from the store.
 * Returns { text, action }.
 */
function buildContextResponse(
  userText: string,
  store: ReturnType<typeof useZoneStore.getState>
): { text: string; action?: string } {
  const t = userText.toLowerCase()
  const { activeIncident, zones, coreLoad, networkLatency, systemStatus, predictions, bmsData } = store

  // ── helpers ─────────────────────────────────────────────────────────────────
  const gate3 = zones.find(z => z.id === 'zone_1')
  const sec112 = zones.find(z => z.id === 'zone_2')
  const concourseN = zones.find(z => z.id === 'zone_3')
  const criticalZones = zones.filter(z => z.status === 'critical')
  const warningZones = zones.filter(z => z.status === 'warning')

  const topPrediction = predictions[0]

  // ── Fire scenario ────────────────────────────────────────────────────────────
  if (activeIncident?.incident_type.includes('Fire') || t.includes('fire') || t.includes('evacuati')) {
    const occ = concourseN ? `${concourseN.occupancy}%` : 'unknown'
    const exit = concourseN && concourseN.occupancy > 50 ? 'Exits 12 and 14' : 'Primary Exit Alpha'
    return {
      text: `🔥 FIRE ALERT — Concourse North\n\nThermal anomaly confirmed. Current occupancy: ${occ}. System load: ${coreLoad.toFixed(0)}% (elevated). Recommended actions:\n\n1. Initiate dynamic evacuation toward ${exit} — estimated 2.8–3.4 min clearance.\n2. Lock turnstiles on Gate 3 (currently ${gate3?.occupancy ?? '–'}%) to prevent inbound crowd.\n3. Deploy Fire Safety Team Alpha to Sector 4 for local containment.\n4. Activate HVAC suppression protocol — current load: ${bmsData.hvacLoad.toFixed(0)}%.\n5. Broadcast PA announcement via Zone 3 speakers.\n\nNetwork latency: ${networkLatency.toFixed(1)} ms. BMS power: ${bmsData.powerUsage.toFixed(1)} kW.`,
      action: 'EVACUATION PROTOCOL ACTIVE',
    }
  }

  // ── Medical scenario ─────────────────────────────────────────────────────────
  if (activeIncident?.incident_type.includes('Medical') || t.includes('medical') || t.includes('section 112') || t.includes('ems')) {
    const occ = sec112 ? `${sec112.occupancy}%` : 'unknown'
    return {
      text: `🚑 MEDICAL EVENT — Section 112\n\nBiomedical alert in Row 14. Section occupancy: ${occ}. Adjacent sections are congested, impeding ingress.\n\nRecommended actions:\n\n1. Dispatch Medical Response Team Charlie from North Station (ETA ~42 s).\n2. Deploy Ushers 4 & 5 to clear aisle access through Section 113.\n3. Hold all turnstile inflow to Section 112–114 until scene is clear.\n4. Pre-position AED unit at concourse level 1.\n\nSystem status: ${systemStatus}. Core load: ${coreLoad.toFixed(0)}%.`,
      action: 'EMS PROTOCOL INITIATED',
    }
  }

  // ── Gate 3 / Overcrowding ────────────────────────────────────────────────────
  if (activeIncident?.incident_type.includes('Overcrowding') || t.includes('gate 3') || t.includes('overcrowd') || t.includes('crowd')) {
    const occ = gate3 ? `${gate3.occupancy}%` : 'unknown'
    const altZone = zones.find(z => z.id !== 'zone_1' && z.status === 'normal')
    const altName = altZone?.name ?? 'Gate 4'
    const altOcc = altZone ? `${altZone.occupancy}%` : 'available'
    return {
      text: `⚠️ OVERCROWDING — Gate 3\n\nCurrent occupancy: ${occ} — exceeds 90% threshold. Turnstile throughput elevated.\n\nRecommended actions:\n\n1. Open adjacent ${altName} immediately (currently ${altOcc} — capacity available).\n2. Deploy Crowd Control Unit Beta to Gate 3 outer plaza.\n3. Redirect all inbound ticketing apps to display ${altName} as preferred entry.\n4. Dispatch 2 security drones to Gate 3 for aerial crowd monitoring.\n5. Brief Gate 3 staff on dispersion script within 60 seconds.\n\nPrediction alert: "${topPrediction?.inference ?? 'N/A'}" — ${topPrediction?.probability ?? 0}% probability in ${topPrediction?.time_offset ?? 0}m.`,
      action: 'CROWD DISPERSION ACTIVE',
    }
  }

  // ── Suspicious package scenario ──────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('package') || t.includes('suspicious') || t.includes('package')) {
    return {
      text: `🛑 SECURITY ALERT — Suspicious Package\n\nUnattended bag detected by security cameras near Concourse South. Threat level: ELEVATED.\n\nRecommended actions:\n\n1. Establish a 50-meter isolation perimeter around the affected area.\n2. Dispatch EOD (Explosive Ordnance Disposal) Team to Concourse South.\n3. Reroute all inbound pedestrian traffic via West and North gates.\n4. Suspend nearby concession operations immediately.\n\nNetwork telemetry indicates normal camera feeds. Proceed with caution.`,
      action: 'SECURITY LOCKDOWN INITIATED',
    }
  }

  // ── Weather impact scenario ──────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('weather') || t.includes('weather') || t.includes('storm') || t.includes('lightning')) {
    return {
      text: `⛈ SEVERE WEATHER WARNING\n\nApproaching storm cell detected 8 miles out. Lightning strike probability: 85% within 15 minutes.\n\nRecommended actions:\n\n1. Issue shelter-in-place order for all open-air plazas.\n2. Halt open-air operations (e.g., roof access, outdoor parking shuttles).\n3. Increase HVAC ventilation in enclosed concourses to accommodate sudden ingress.\n4. Broadcast severe weather warning via PA and mobile apps.\n\nBMS Load: Grid power stable, but prepare for UPS transition.`,
      action: 'SEVERE WEATHER PROTOCOL',
    }
  }

  // ── Grid power outage scenario ───────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('power') || t.includes('outage') || t.includes('grid')) {
    return {
      text: `⚡ CRITICAL POWER OUTAGE — Sector 4 Grid\n\nMain utility feed failure detected. Backup generators engaged.\n\nRecommended actions:\n\n1. Verify UPS engagement across critical IT infrastructure (Current Load: ${coreLoad.toFixed(0)}%).\n2. Prioritize emergency lighting and PA systems over commercial HVAC (Current HVAC: ${bmsData.hvacLoad.toFixed(0)}%).\n3. Deploy maintenance crew to substation Alpha.\n4. Prepare for manual turnstile operation at Gate 3 and 4.\n\nSystem Status: Operating on backup power. Estimate 4 hours capacity.`,
      action: 'BACKUP POWER ENGAGED',
    }
  }

  // ── VIP Motorcade Arrival ────────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('vip') || t.includes('vip') || t.includes('motorcade')) {
    return {
      text: `🦅 VIP SECURE ARRIVAL — Protocol "Archangel"\n\nHigh-profile motorcade is 2 minutes from VIP Sub-Basement Entry. Threat vector scanning active.\n\nRecommended actions:\n\n1. Lock down freight elevators 1 and 2 exclusively for VIP transit.\n2. Dispatch Security Detail Delta to Sub-Basement Entry.\n3. Temporarily pause all deliveries at Loading Dock B for the next 15 minutes.\n4. Increase facial recognition sampling rate at Sector 1 concourses to maximum.\n\nStatus: Secure route established. Elevators holding at basement level.`,
      action: 'VIP PROTOCOL INITIATED',
    }
  }

  // ── Drone Airspace Intrusion ──────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('drone') || t.includes('drone') || t.includes('airspace')) {
    return {
      text: `🚁 AIRSPACE INTRUSION — Unauthorized UAV Detected\n\nRadar and optical sensors detect an unidentified quadcopter hovering over the open field at 400ft.\n\nRecommended actions:\n\n1. Activate RF signal jamming array in Sector 2 (Warning: Will degrade local WiFi by 15%).\n2. Dispatch Stadium Drone Intercept Unit (SDIU) to visually acquire target.\n3. Notify local aviation authorities and provide telemetry data.\n4. Alert on-field personnel to move toward covered dugouts.\n\nPrediction: Target is likely amateur footage, but carrying capacity is unknown. Assume hostile intent until neutralized.`,
      action: 'ANTI-DRONE MEASURES ACTIVE',
    }
  }

  // ── Active Shooter / Hostile Intruder ─────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('shooter') || activeIncident?.incident_type.toLowerCase().includes('hostile') || t.includes('shooter') || t.includes('hostile') || t.includes('intruder')) {
    return {
      text: `🚨 CRITICAL THREAT — Hostile Intruder Detected\n\nGunfire acoustics detected by IoT microphones near Concourse East, Gate 7.\n\nIMMEDIATE ACTIONS REQUIRED:\n\n1. INITIATE HARD LOCKDOWN for all suites and back-of-house areas.\n2. Dispatch automated dynamic digital signage to direct civilians AWAY from Gate 7.\n3. Trigger automated dispatch to Metro SWAT and provide live camera feeds.\n4. Drop heavy security shutters at Concourse East choke points.\n5. Cut lighting in affected corridors to disadvantage the intruder.\n\nSystem load: Max priority overridden. Live streaming 4K feeds directly to PD command center.`,
      action: 'HARD LOCKDOWN INITIATED',
    }
  }

  // ── Cyberattack on BMS ────────────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('cyber') || t.includes('cyber') || t.includes('hack') || t.includes('ransomware')) {
    return {
      text: `👾 CYBER INTRUSION DETECTED — BMS Network\n\nAnomalous external traffic attempting to inject commands into the HVAC and Turnstile control subnets.\n\nRecommended actions:\n\n1. ISOLATE Building Management System from external internet access (Air-gap protocol).\n2. Fallback turnstiles to localized authorization caching (will increase latency by 100ms).\n3. Revert HVAC controllers to manual analog override.\n4. Initiate automated honey-pot diversion to trace source IP (Origin suspected: Eastern Europe).\n\nAction required: Authorize complete network isolation to prevent ransomware deployment.`,
      action: 'AIR-GAP PROTOCOL ENGAGED',
    }
  }

  // ── Structural Anomaly ────────────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('structure') || t.includes('structural') || t.includes('seismic') || t.includes('earthquake') || t.includes('anomaly')) {
    return {
      text: `🏗️ STRUCTURAL INTEGRITY WARNING — Sector 3 Roof\n\nIoT strain gauges detect abnormal stress patterns exceeding 4.2% tolerance on load-bearing trusses.\n\nRecommended actions:\n\n1. Evacuate all personnel directly beneath Sector 3 immediately.\n2. Disengage heavy mechanical equipment on the roof to reduce dynamic load.\n3. Dispatch Engineering Team Echo for visual inspection.\n4. Trigger drone launch for thermal and structural scan of the affected trusses.\n\nRisk Assessment: Potential localized collapse if wind speeds exceed 40 mph.`,
      action: 'STRUCTURAL LOCKDOWN INITIATED',
    }
  }

  // ── Chemical Leak / HAZMAT ───────────────────────────────────────────────────
  if (activeIncident?.incident_type.toLowerCase().includes('chemical') || activeIncident?.incident_type.toLowerCase().includes('bio') || t.includes('chemical') || t.includes('hazmat') || t.includes('leak') || t.includes('gas')) {
    return {
      text: `☣️ BIO/CHEMICAL HAZARD DETECTED — Concourse West\n\nAir quality environmental sensors detect anomalous levels of Ammonia (NH3) vapor exceeding 50ppm.\n\nRecommended actions:\n\n1. Initiate negative-pressure HVAC protocol in Concourse West to contain vapor spread.\n2. Dispatch HAZMAT Response Team to isolated maintenance sector 4B.\n3. Reroute all civilian traffic to Concourse East immediately.\n4. Alert on-site medical staff for potential respiratory exposure triage.\n\nContainment Status: HVAC containment engaged. Plume expansion halted.`,
      action: 'HAZMAT PROTOCOL INITIATED',
    }
  }

  // ── General situation / assess ───────────────────────────────────────────────
  if (t.includes('assess') || t.includes('situation') || t.includes('status') || t.includes('overview') || t.includes('report')) {
    if (!activeIncident) {
      const normalCount = zones.filter(z => z.status === 'normal').length
      return {
        text: `✅ SYSTEM NOMINAL\n\nAll ${zones.length} zones reporting normal. ${normalCount} of ${zones.length} within operational thresholds.\n\nTelemetry: Core load ${coreLoad.toFixed(0)}% | Latency ${networkLatency.toFixed(1)} ms | Bandwidth ${store.bandwidth.toFixed(1)} Gbps.\n\nBMS: HVAC ${bmsData.hvacLoad.toFixed(0)}% | Power ${bmsData.powerUsage.toFixed(1)} kW | CO₂ ${bmsData.carbonEmissions.toFixed(2)} t/h.\n\nTop AI prediction: "${topPrediction?.inference ?? 'None'}" at ${topPrediction?.probability ?? 0}% probability.`,
      }
    }
    return {
      text: `🚨 ACTIVE INCIDENT: ${activeIncident.incident_type}\n\nSeverity: ${activeIncident.severity.toUpperCase()} | Zone: ${activeIncident.zone_name} | Confidence: ${(activeIncident.confidence * 100).toFixed(0)}%\n\n${activeIncident.explanation}\n\nRecommended: ${activeIncident.recommended_action}\n\nSystem load: ${coreLoad.toFixed(0)}% | Status: ${systemStatus}.`,
      action: activeIncident.severity === 'critical' ? 'CRITICAL RESPONSE REQUIRED' : 'MONITORING ACTIVE',
    }
  }

  // ── System health ────────────────────────────────────────────────────────────
  if (t.includes('health') || t.includes('telemetry') || t.includes('system') || t.includes('bms') || t.includes('power')) {
    return {
      text: `📊 SYSTEM HEALTH REPORT\n\nCore Load: ${coreLoad.toFixed(1)}% ${coreLoad > 80 ? '⚠ ELEVATED' : '✓ OK'}\nNetwork Latency: ${networkLatency.toFixed(2)} ms ${networkLatency > 10 ? '⚠ HIGH' : '✓ OK'}\nBandwidth: ${store.bandwidth.toFixed(1)} Gbps\n\nBMS:\n  HVAC Load: ${bmsData.hvacLoad.toFixed(0)}%\n  Power Usage: ${bmsData.powerUsage.toFixed(1)} kW\n  Carbon Emissions: ${bmsData.carbonEmissions.toFixed(2)} t/h\n\nZone Summary: ${criticalZones.length} critical, ${warningZones.length} warning, ${zones.length - criticalZones.length - warningZones.length} normal.\n\nOverall Status: ${systemStatus}.`,
    }
  }

  // ── Resolve / reset ──────────────────────────────────────────────────────────
  if (t.includes('resolve') || t.includes('fix') || t.includes('reset') || t.includes('clear')) {
    return {
      text: activeIncident
        ? `Initiating resolution for ${activeIncident.incident_type} in ${activeIncident.zone_name}. Re-routing crowd flow, standing down emergency teams, and restoring zone status to baseline. All KPIs will normalise within 60–90 seconds.`
        : 'No active incidents detected. All zones are nominal. Digital twin is operating at baseline parameters.',
      action: activeIncident ? 'RESOLVING INCIDENT' : 'SYSTEM NOMINAL',
    }
  }

  // ── Gate-specific free-form queries ──────────────────────────────────────────
  const matchedZone = zones.find(z => t.includes(z.name.toLowerCase()))
  if (matchedZone) {
    const statusColor = matchedZone.status === 'critical' ? '🔴' : matchedZone.status === 'warning' ? '🟡' : '🟢'
    return {
      text: `${statusColor} ${matchedZone.name}\n\nOccupancy: ${matchedZone.occupancy}% (baseline ${matchedZone.baseline}%)\nStatus: ${matchedZone.status.toUpperCase()}\n\n${matchedZone.status !== 'normal' ? `⚠ This zone is above normal threshold. Consider redistributing inbound traffic to adjacent zones.` : `Zone is operating within expected parameters. No action required.`}`,
    }
  }

  // ── Fallback with context ────────────────────────────────────────────────────
  return {
    text: `ArenaOS Copilot is processing your query against the live digital twin.\n\nCurrent status: ${systemStatus} | Active incident: ${activeIncident ? activeIncident.incident_type : 'None'} | Core load: ${coreLoad.toFixed(0)}%.\n\nTry asking: "Assess current situation", "Gate 3 status", "Recommend evacuation", or "System health" for live data-driven analysis.`,
  }
}

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    sender: 'ai',
    text: 'ArenaOS Core Intelligence online. I have access to live stadium telemetry, zone occupancy, and incident feeds. Ask me to assess a situation or recommend an action.',
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const triggerBackend = async (endpoint: string, payload?: object) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      })
    } catch (e) {
      setBackendAvailable(false)
      console.warn('Backend unreachable.', e)
    }
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text }])
    setInput('')
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 500))

    // Read live simulation state at send time
    const storeState = useZoneStore.getState()
    const { text: res, action } = buildContextResponse(text, storeState)

    // Side-effect: trigger backend for actionable incidents
    const t = text.toLowerCase()
    if (t.includes('gate 3') || t.includes('overcrowd')) {
      triggerBackend('trigger', { incident_type: 'Gate 3 Overcrowding' })
    } else if (t.includes('medical') || t.includes('section 112') || t.includes('ems')) {
      triggerBackend('trigger', { incident_type: 'Section 112 Medical Event' })
    } else if (t.includes('fire') || t.includes('evacuati')) {
      triggerBackend('trigger', { incident_type: 'Concourse North Fire Alarm' })
    } else if (t.includes('suspicious') || t.includes('package')) {
      triggerBackend('trigger', { incident_type: 'Suspicious Package' })
    } else if (t.includes('weather') || t.includes('storm') || t.includes('lightning')) {
      triggerBackend('trigger', { incident_type: 'Severe Weather Warning' })
    } else if (t.includes('power') || t.includes('outage') || t.includes('grid')) {
      triggerBackend('trigger', { incident_type: 'Power Outage' })
    } else if (t.includes('vip') || t.includes('motorcade')) {
      triggerBackend('trigger', { incident_type: 'VIP Motorcade Arrival' })
    } else if (t.includes('drone') || t.includes('airspace')) {
      triggerBackend('trigger', { incident_type: 'Drone Airspace Intrusion' })
    } else if (t.includes('shooter') || t.includes('hostile') || t.includes('intruder')) {
      triggerBackend('trigger', { incident_type: 'Hostile Intruder' })
    } else if (t.includes('cyber') || t.includes('hack') || t.includes('ransomware')) {
      triggerBackend('trigger', { incident_type: 'Cyber Intrusion' })
    } else if (t.includes('structure') || t.includes('structural') || t.includes('seismic') || t.includes('earthquake') || t.includes('anomaly')) {
      triggerBackend('trigger', { incident_type: 'Structural Anomaly' })
    } else if (t.includes('chemical') || t.includes('hazmat') || t.includes('leak') || t.includes('gas')) {
      triggerBackend('trigger', { incident_type: 'Chemical Leak' })
    } else if (t.includes('resolve') || t.includes('reset') || t.includes('clear')) {
      triggerBackend('resolve')
    }

    setIsTyping(false)
    const aiId = (Date.now() + 1).toString()
    setMessages(p => [...p, { id: aiId, sender: 'ai', text: '', action }])

    // Speak the response
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(res)
      window.speechSynthesis.speak(utterance)
    }

    // Type-writer effect
    for (let i = 1; i <= res.length; i++) {
      setMessages(p => {
        const n = [...p]
        n[n.length - 1] = { ...n[n.length - 1], text: res.slice(0, i) }
        return n
      })
      await new Promise(r => setTimeout(r, 10))
    }
  }

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,0.85)] border border-white/[0.08] rounded-2xl backdrop-blur-xl flex flex-col font-sans overflow-hidden shadow-2xl">
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="relative"><Cpu className="w-3 h-3 text-accent" /><span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full animate-ping" /></div>
          <div><h2 className="text-xs font-bold text-white uppercase tracking-wider">ArenaOS Copilot</h2><p className="text-[9px] text-accent font-mono uppercase tracking-widest leading-none mt-0.5">Context-Aware Intelligence</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" role="list" aria-label="Copilot messages">
        {messages.map(m => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`} role="listitem">
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${m.sender === 'user' ? 'bg-white/5 border-white/20 text-gray-300' : 'bg-accent/10 border-accent/30 text-accent'}`}>
              {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 max-w-[85%] whitespace-pre-wrap ${m.sender === 'user' ? 'bg-accent/10 border border-accent/20 text-white rounded-lg rounded-tr-none text-[11px]' : 'bg-black/40 border border-white/[0.08] text-gray-300 rounded-lg rounded-tl-none font-mono leading-relaxed text-[10px]'}`}>
                {m.text}
              </div>
              {m.action && (
                <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[8px] font-mono text-green-400 uppercase tracking-widest">
                  <ShieldCheck className="w-2.5 h-2.5" />{m.action}
                </div>
              )}
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

      {!backendAvailable && (
        <div role="alert" className="px-3 py-1.5 bg-yellow-600/20 border-t border-yellow-600/30 text-yellow-300 text-[9px] font-mono text-center">
          Backend unavailable — operating in offline simulation mode.
        </div>
      )}

      <div className="p-3 border-t border-white/[0.08] bg-black/40 shrink-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {PROMPTS.map(p => (
            <button
              type="button"
              key={p}
              onClick={() => handleSend(p)}
              className="text-[8px] font-mono text-gray-400 uppercase border border-white/[0.08] bg-white/5 px-1.5 py-0.5 rounded-sm hover:bg-accent/15 hover:text-accent hover:border-accent/30 transition-all duration-200 whitespace-nowrap"
              aria-label={`Send prompt: ${p}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about any zone, gate, or incident..."
            className="w-full bg-[#030305]/80 border border-white/[0.08] focus:border-accent/50 rounded-lg py-2 pl-4 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
          />
          <button type="button" onClick={() => handleSend(input)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-accent transition-colors" aria-label="Send command">
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
