'use client'

import React, { useEffect, useState } from 'react'
import { useZoneStore } from '@/store/useZoneStore'
import { Users, ShieldAlert, TrendingUp, Clock, Zap, HeartPulse, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

function MiniSparkline({ color, data }: { color: string; data: number[] }) {
  if (data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((d - min) / range) * 80 - 10 // scale to fit nicely
      return `${x},${y}`
    })
    .join(' ')

  const safeColor = color.startsWith('rgba') ? '#0a84ff' : color;
  const gradId = `grad-${safeColor.replace('#', '')}`;

  return (
    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-30 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <filter id="spark-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={safeColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={safeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={safeColor}
        strokeWidth="1.8"
        points={points}
        vectorEffect="non-scaling-stroke"
        filter="url(#spark-glow)"
      />
      <polygon
        fill={`url(#${gradId})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  )
}

function AnimatedNumber({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  return (
    <motion.span
      key={String(value)}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {displayValue}
    </motion.span>
  )
}

export const KPICards = React.memo(function KPICards() {
  const zones = useZoneStore((state) => state.zones)
  const activeIncident = useZoneStore((state) => state.activeIncident)
  const bmsData = useZoneStore((state) => state.bmsData)
  const systemStatus = useZoneStore((state) => state.systemStatus)
  const telemetryHistory = useZoneStore((state) => state.telemetryHistory)

  // Calculations
  const totalOccupancyPercent = zones.length > 0 ? zones.reduce((acc, z) => acc + z.occupancy, 0) / zones.length : 0
  const actualAttendance = Math.round((totalOccupancyPercent / 100) * 50000)
  const zonesAtRisk = zones.filter(z => z.status === 'warning' || z.status === 'critical').length

  // Custom states
  const peakProb = activeIncident ? 92 : 82
  const responseTime = activeIncident ? '3.2 min' : '1.2 min'
  const energyUsage = Math.round(bmsData.powerUsage * 4) // mock percent

  const getHealthScore = () => {
    if (systemStatus === 'CRITICAL') return { score: '45%', status: 'CRITICAL', color: '#ef4444' }
    if (systemStatus === 'WARNING') return { score: '82%', status: 'WARNING', color: '#eab308' }
    return { score: '98%', status: 'EXCELLENT', color: 'rgba(255,255,255,0.4)' }
  }
  const health = getHealthScore()

  const cardData = [
    {
      title: 'Total Occupancy',
      value: `${Math.round(totalOccupancyPercent)}%`,
      subtext: `${actualAttendance.toLocaleString()} / 50,000`,
      trend: '+3.2%',
      isNeutralTrend: true,
      icon: Users,
      color: '#0a84ff',
      history: telemetryHistory.slice(-10)
    },
    {
      title: 'Zones at Risk',
      value: zonesAtRisk,
      subtext: zonesAtRisk > 0 ? `${zonesAtRisk} sectors flagged` : 'All zones stable',
      trend: zonesAtRisk > 0 ? `+${zonesAtRisk}` : '0',
      icon: ShieldAlert,
      color: zonesAtRisk > 0 ? '#ff453a' : '#0a84ff',
      history: Array(10).fill(zonesAtRisk)
    },
    {
      title: 'Predicted Peak',
      value: `${peakProb}%`,
      subtext: activeIncident ? 'In 10 min (Risk: High)' : 'In 35 min (Risk: Low)',
      trend: activeIncident ? '+12%' : 'stable',
      icon: TrendingUp,
      color: activeIncident ? '#ff453a' : '#0a84ff',
      history: Array(10).fill(0).map((_, i) => peakProb + Math.sin(i) * 2)
    },
    {
      title: 'Response Time',
      value: responseTime,
      subtext: activeIncident ? 'Dispatch Active' : 'Normal Standby',
      trend: activeIncident ? '+15%' : '-8%',
      icon: Clock,
      color: activeIncident ? '#ff9f0a' : '#0a84ff',
      history: Array(10).fill(0).map((_, i) => (activeIncident ? 3.2 : 1.2) + Math.cos(i) * 0.1)
    },
    {
      title: 'Energy Usage',
      value: `${energyUsage}%`,
      subtext: `${bmsData.powerUsage.toFixed(1)} MW Draw`,
      trend: '-2%',
      icon: Zap,
      color: '#0a84ff',
      history: Array(10).fill(0).map((_, i) => energyUsage + Math.sin(i) * 3)
    },
    {
      title: 'System Health',
      value: health.score,
      subtext: health.status,
      trend: 'optimal',
      icon: HeartPulse,
      color: health.color === 'rgba(255,255,255,0.4)' ? '#0a84ff' : health.color,
      history: Array(10).fill(0).map((_, i) => parseFloat(health.score) + Math.sin(i) * 0.5)
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full gap-3 pb-2">
      {cardData.map((c, i) => {
        return (
          <div
            key={i}
            className="relative flex flex-col p-3.5 bg-[rgba(10,10,12,0.4)] backdrop-blur-2xl border border-white/[0.04] rounded-xl overflow-hidden group transition-all duration-300 hover:border-white/10"
          >
            {/* Top border glow themed */}
            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: c.color }} />

            {/* Background Glow based on card theme */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at top, ${c.color} 0%, transparent 60%)` }}
            />

            <MiniSparkline color={c.color} data={c.history} />

            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-1.5">
                <c.icon size={7} className="text-white/60 transition-colors" />
                <span className="text-xs font-medium text-white/60">{c.title}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                <div className="relative flex h-1 w-1">
                  {c.color !== '#0a84ff' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: c.color }}></span>
                  )}
                  <span className="relative inline-flex rounded-full h-1 w-1" style={{ backgroundColor: c.color }}></span>
                </div>
              </div>
            </div>

            <div className={`flex items-baseline gap-2 ${i === 0 ? 'mt-2.5' : 'mt-1.5'} relative z-10`}>
              <h3 className={`font-sans tracking-tight text-white ${i === 0 ? 'text-4xl font-light' : 'text-xl font-light'}`}>
                <AnimatedNumber value={c.value} />
              </h3>

              {c.trend && c.trend !== 'stable' && c.trend !== 'optimal' && (
                <div className={`flex items-center text-[8px] font-mono font-bold px-1 rounded ${(c as any).isNeutralTrend ? 'text-white/60 bg-white/5' : c.trend.startsWith('+') ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'
                  }`}>
                  {c.trend.startsWith('+') ? <ArrowUpRight size={6.5} /> : <ArrowDownRight size={6.5} />}
                  {c.trend.replace(/^[+-]/, '')}
                </div>
              )}
            </div>

            <div className="mt-auto pt-2.5 relative z-10">
              <p className="text-[10px] font-medium text-white/50 border-t border-white/[0.08] pt-1.5">
                {c.subtext}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
})
