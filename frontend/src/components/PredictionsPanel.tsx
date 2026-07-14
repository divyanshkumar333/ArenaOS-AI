'use client'

import { TrendingUp, TrendingDown, Zap, ShieldAlert, Users, Activity } from 'lucide-react'
import { useZoneStore } from '@/store/useZoneStore'

const ICONS = {
  Users: Users,
  Activity: Activity,
  Zap: Zap
}

export function PredictionsPanel() {
  const predictions = useZoneStore(state => state.predictions)
  
  return (
    <div className="h-full w-full flex flex-col p-5 bg-transparent">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-2">
        <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-white/60" /> AI Predictions
        </h3>
        <span className="text-[10px] font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/20">LIVE</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-start space-y-2.5 overflow-y-auto no-scrollbar">
        {predictions.map((p, i) => {
          const IconComponent = ICONS[p.iconType] || Users;
          return (
            <div key={i} className="flex flex-col bg-black/40 p-2.5 rounded-lg border border-white/[0.05] transition-all duration-300 hover:bg-white/5 hover:border-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md bg-white/5 ${p.color} transition-colors duration-500`}>
                    <IconComponent className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-200 transition-colors duration-500">{p.label}</span>
                    <span className="text-[9px] font-mono text-gray-500 transition-colors duration-500">Forecast: {p.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-gray-200">{p.prob}%</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-500">Prob</span>
                  </div>
                  {p.trend === 'up' ? <TrendingUp className="w-3 h-3 text-red-400" /> : p.trend === 'down' ? <TrendingDown className="w-3 h-3 text-green-400" /> : <TrendingUp className="w-3 h-3 text-gray-500 rotate-90" />}
                </div>
              </div>
              
              {/* Micro probability progress bar */}
              <div className="w-full bg-white/5 h-[2px] rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${p.prob > 75 ? 'bg-[#ff453a]' : 'bg-accent'}`} 
                  style={{ width: `${p.prob}%` }} 
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
