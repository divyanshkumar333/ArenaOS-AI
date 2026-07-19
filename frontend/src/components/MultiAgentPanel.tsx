'use client'

import { useState, useEffect } from 'react'
import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Eye, Users, ShieldAlert, Truck, Activity, ArrowDown, CheckCircle2 } from 'lucide-react'

const AGENT_TYPES = {
  CROWD: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  DRONE: { icon: Eye, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
  TRAFFIC: { icon: Truck, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  SECURITY: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  MEDICAL: { icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  COMMANDER: { icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
}

export function MultiAgentPanel() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const predictions = useZoneStore(state => state.predictions)
  const history = useZoneStore(state => state.incidentHistory)
  const [nodes, setNodes] = useState<any[]>([])

  // Dynamically generate the agent swarm workflow based on state
  useEffect(() => {
    let newNodes = []

    if (activeIncident?.id.includes('gate3')) {
      newNodes = [
        { id: '1', type: 'CROWD', title: 'Crowd Agent', action: `Detected ${activeIncident.incident_type}`, meta: `Confidence: ${(activeIncident.confidence * 100).toFixed(1)}%` },
        { id: '2', type: 'DRONE', title: 'Drone Agent', action: 'Visual confirmation secured.', meta: 'Feed: CAM-01' },
        { id: '3', type: 'TRAFFIC', title: 'Traffic Agent', action: 'Calculated alternate routes.', meta: 'Optimal: Gate 4' },
        { id: '4', type: 'SECURITY', title: 'Security Agent', action: 'Deployed to redirect flow.', meta: 'ETA: 1 min' },
      ]
    } else if (activeIncident?.id.includes('med_112')) {
      newNodes = [
        { id: '1', type: 'MEDICAL', title: 'Medical Agent', action: 'Biometric anomaly detected.', meta: `Confidence: ${(activeIncident.confidence * 100).toFixed(1)}%` },
        { id: '2', type: 'DRONE', title: 'Thermal Drone', action: 'Heat signature verified.', meta: 'Feed: CAM-03' },
        { id: '3', type: 'SECURITY', title: 'Security Agent', action: 'Clearing aisle path.', meta: 'ETA: 30s' },
        { id: '4', type: 'COMMANDER', title: 'Commander', action: 'EMT Unit Alpha dispatched.', meta: 'Status: En route' },
      ]
    } else if (activeIncident?.id.includes('sec_pack')) {
      newNodes = [
        { id: '1', type: 'SECURITY', title: 'Security Agent', action: 'Unattended object detected.', meta: `Confidence: ${(activeIncident.confidence * 100).toFixed(1)}%` },
        { id: '2', type: 'CROWD', title: 'Crowd Agent', action: 'Executing Zone Lockdown.', meta: 'Rerouting flow' },
        { id: '3', type: 'COMMANDER', title: 'Commander', action: 'Threat assessment elevated.', meta: 'Security Team 4' },
      ]
    } else if (activeIncident?.id.includes('weather')) {
      newNodes = [
        { id: '1', type: 'CROWD', title: 'Crowd Agent', action: 'Calculating weather impact.', meta: '8,000 displaced' },
        { id: '2', type: 'TRAFFIC', title: 'Traffic Agent', action: 'Updating digital signage.', meta: 'Routes adjusted' },
        { id: '3', type: 'COMMANDER', title: 'Commander', action: 'HVAC extraction increased.', meta: 'Humidity stabilized' },
      ]
    } else if (activeIncident?.id.includes('power')) {
      newNodes = [
        { id: '1', type: 'COMMANDER', title: 'Commander Agent', action: 'CRITICAL: Grid failure predicted.', meta: 'Sector 4' },
        { id: '2', type: 'SECURITY', title: 'Security Agent', action: 'Securing affected perimeters.', meta: 'Low visibility' },
        { id: '3', type: 'MEDICAL', title: 'Medical Agent', action: 'Verifying emergency life support.', meta: 'Nominal' },
        { id: '4', type: 'TRAFFIC', title: 'Traffic Agent', action: 'Initiating load shedding.', meta: 'Gen B Online' },
      ]
    }
    // Check if there's a resolved prediction (just authorized)
    else if (history.length > 0 && history[0].log.includes('AUTHORIZED')) {
      newNodes = [
        { id: '1', type: 'COMMANDER', title: 'Commander', action: 'Mitigation sequence authorized.', meta: 'Resolution active' },
        { id: '2', type: 'CROWD', title: 'Crowd Agent', action: 'Monitoring recovery.', meta: 'Nominal' },
        { id: '3', type: 'SECURITY', title: 'Security Agent', action: 'Standing by.', meta: 'Status: Idle' },
      ]
    }
    // Idle monitoring
    else {
      newNodes = [
        { id: '1', type: 'CROWD', title: 'Crowd Agent', action: 'Monitoring density...', meta: 'Nominal' },
        { id: '2', type: 'TRAFFIC', title: 'Traffic Agent', action: 'Monitoring flow...', meta: 'Nominal' },
        { id: '3', type: 'SECURITY', title: 'Security Agent', action: 'Patrolling...', meta: 'Nominal' },
        { id: '4', type: 'MEDICAL', title: 'Medical Agent', action: 'Standby.', meta: 'Nominal' },
        { id: '5', type: 'COMMANDER', title: 'Commander Agent', action: 'System Optimal.', meta: 'All systems green' }
      ]
    }

    setNodes([])
    const timers = newNodes.map((n, i) => setTimeout(() => {
      setNodes(prev => [...prev, n])
    }, i * 400)) // Faster animation for snappier UI

    return () => timers.forEach(clearTimeout)
  }, [activeIncident, history])

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col p-4 bg-transparent text-gray-300">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> Multi-Agent Swarm
        </h3>
        <span className="text-[9px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
          COLLABORATION MATRIX
        </span>
      </div>

      <div className="flex-1 flex flex-wrap gap-2 overflow-y-auto no-scrollbar pb-2 pt-1 items-start content-start">
        <AnimatePresence>
          {nodes.map((node, i) => {
            const AgentStyle = AGENT_TYPES[node.type as keyof typeof AGENT_TYPES]
            const Icon = AgentStyle.icon
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-[calc(50%-0.25rem)] flex flex-col p-2 rounded-xl border bg-black/40 ${AgentStyle.border} shadow-sm relative overflow-hidden group hover:bg-white/5 transition-all`}
              >
                {/* Top color bar indicator */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${AgentStyle.bg}`} />

                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1 rounded-lg ${AgentStyle.bg} ${AgentStyle.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${AgentStyle.color} truncate`}>{node.title}</span>
                  {node.type === 'COMMANDER' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto shrink-0" />
                  )}
                </div>

                <div className="text-[9px] text-white leading-tight mb-2 h-[22px] overflow-hidden">
                  {node.action}
                </div>

                <div className="mt-auto text-[8px] font-mono text-gray-500 flex justify-between items-center pt-1 border-t border-white/[0.05]">
                  <span className="truncate pr-1">{node.meta}</span>
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${AgentStyle.bg.replace('/10', '')} opacity-80`} />
                    <div className={`absolute w-3 h-3 rounded-full ${AgentStyle.bg.replace('/10', '')} animate-ping opacity-40`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
