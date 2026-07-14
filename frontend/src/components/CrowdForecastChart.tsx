"use client"

import { useZoneStore } from "@/store/useZoneStore"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Activity } from "lucide-react"

const mockForecast = [
  { time: '18:00', actual: 45, predicted: 42 },
  { time: '18:15', actual: 50, predicted: 48 },
  { time: '18:30', actual: 65, predicted: 62 },
  { time: '18:45', actual: 78, predicted: 75 },
  { time: '19:00', actual: 85, predicted: 82 },
  { time: '19:15', actual: 92, predicted: 88 },
  { time: '19:30', actual: 95, predicted: 90 },
  { time: '19:45', actual: 98, predicted: 92 },
  { time: '20:00', actual: 100, predicted: 95 },
  { time: '20:15', actual: 95, predicted: 90 },
  { time: '20:30', actual: 80, predicted: 75 },
  { time: '20:45', actual: 60, predicted: 55 },
  { time: '21:00', actual: 40, predicted: 35 },
]

export function CrowdForecastChart() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const isResolving = useZoneStore(state => state.showImpactReport) 
  
  // Create a reveal effect or dynamic change based on incident presence
  const chartData = mockForecast.map((point, index) => {
    let actual = point.actual;
    const predicted = point.predicted;

    // Simulate an anomaly spike when an incident is active
    if (activeIncident && index > 6) {
      actual += 15;
    }
    
    // Simulate resolution drop
    if (isResolving && index > 6) {
      actual -= 20;
    }

    return {
      time: point.time,
      actual: index <= 8 ? actual : undefined, // Reveal up to 'now'
      predicted: predicted
    }
  })

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-950/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl relative">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-accent animate-pulse" />
          <h3 className="font-bold text-[10px] tracking-[0.2em] uppercase text-gray-400">Crowd Density Forecast</h3>
        </div>
        <p className="text-[9px] text-accent font-mono tracking-widest">AI_MODEL_V4</p>
      </div>
      
      <div className="flex-1 w-full relative z-10 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0a84ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b90a0" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8b90a0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
              dy={5}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{ background: 'rgba(18,18,20,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '9px', fontFamily: 'monospace' }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="predicted" 
              stroke="#8b90a0" 
              strokeWidth={1}
              fillOpacity={1} 
              fill="url(#colorPredicted)"
              name="AI Forecast"
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#0a84ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorActual)"
              name="Actual Density"
              isAnimationActive={true}
              animationDuration={500}
              activeDot={{ r: 4, fill: '#0a84ff', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
