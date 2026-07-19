import { useZoneStore } from '@/store/useZoneStore'
import { Activity, ShieldCheck, Zap, DollarSign, Users } from 'lucide-react'

export function ExecutivePanel() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const predictions = useZoneStore(state => state.predictions)
  const resources = useZoneStore(state => state.resources)

  const activePredictions = predictions.filter(p => !p.resolved)
  const riskLevel = activeIncident ? 'CRITICAL' : activePredictions.length > 0 ? 'ELEVATED' : 'NOMINAL'
  const healthScore = activeIncident ? 72 : activePredictions.length > 0 ? 88 : 98

  return (
    <div className="w-full h-full flex flex-col p-4 bg-transparent text-gray-300">
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-blue-400" /> Executive Dashboard
        </h3>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border tracking-widest ${
          riskLevel === 'CRITICAL' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 
          riskLevel === 'ELEVATED' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 
          'text-green-400 bg-green-400/10 border-green-400/20'
        }`}>
          RISK: {riskLevel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[9px] text-gray-500 uppercase tracking-wider">Health</span>
               <ShieldCheck className="w-3 h-3 text-green-400" />
             </div>
             <div className="text-lg font-light text-white">{healthScore}%</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[9px] text-gray-500 uppercase tracking-wider">Satisfaction</span>
               <Users className="w-3 h-3 text-blue-400" />
             </div>
             <div className="text-lg font-light text-white">{healthScore - 2}%</div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Resource Utilization</div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Drones Available</span>
              <span className="text-accent">{resources.drones}/4</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Security Teams</span>
              <span className="text-white">{resources.securityTeams}/8</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Medical Units</span>
              <span className="text-white">{resources.ambulances}/2</span>
            </div>
          </div>
        </div>

        {/* Financial & Energy */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
             <div className="flex items-center gap-1.5 mb-1 text-[9px] text-gray-500 uppercase tracking-wider">
               <Zap className="w-3 h-3 text-yellow-400" /> Energy
             </div>
             <div className="text-xs text-white">4.2 MW</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
             <div className="flex items-center gap-1.5 mb-1 text-[9px] text-gray-500 uppercase tracking-wider">
               <DollarSign className="w-3 h-3 text-green-400" /> Impact
             </div>
             <div className="text-xs text-white">-$0k</div>
          </div>
        </div>
      </div>
    </div>
  )
}
