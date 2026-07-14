'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion } from 'framer-motion'
import { Camera, AlertTriangle, Scan } from 'lucide-react'
import { useState } from 'react'

export function CctvPanel() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const [cams] = useState([
    { id: 'CAM-01', name: 'Gate 3 Ingress Flow', zoneId: 'zone_1' },
    { id: 'CAM-02', name: 'Section 112 Seating', zoneId: 'zone_2' },
    { id: 'CAM-03', name: 'Concourse North Exit 12', zoneId: 'zone_3' },
    { id: 'CAM-04', name: 'VIP Suite Entrance', zoneId: 'zone_4' },
  ])

  const activeCamId = activeIncident 
    ? (activeIncident.zone_id === 'zone_1' ? 'CAM-01' 
     : activeIncident.zone_id === 'zone_2' ? 'CAM-02'
     : activeIncident.zone_id === 'zone_3' ? 'CAM-03' : 'CAM-04')
    : null

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,0.85)] p-6 flex flex-col font-sans select-none overflow-hidden backdrop-blur-xl rounded-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-accent" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">CCTV & Surveillance Matrix</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Multiplex Feed Control</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-gray-500 uppercase">
          {['FEED STATUS: OPTIMAL', 'AI CLASSIFIER: ACTIVE'].map((t, i) => (
            <div key={i} className="flex gap-1.5 bg-slate-900/40 border border-white/[0.08] px-2.5 py-1 rounded">
              <span>{t.split(':')[0]}:</span><span className="text-accent font-bold">{t.split(':')[1]}</span>
            </div>
          ))}
        </div>
      </div>
 
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {cams.map((cam) => {
          const isTarget = activeCamId === cam.id
          const severity = activeIncident?.severity || 'warning'
          const c = severity === 'critical' ? {
            border: 'border-red-500', border80: 'border-red-500/80', shadow: 'shadow-red-500/80', ring: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]', bg: 'bg-red-500', text: 'text-red-500'
          } : {
            border: 'border-yellow-500', border80: 'border-yellow-500/80', shadow: 'shadow-yellow-500/80', ring: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]', bg: 'bg-yellow-500', text: 'text-yellow-500'
          }
 
          return (
            <div key={cam.id} className={`relative bg-black border rounded-lg overflow-hidden flex flex-col group transition-all duration-300 ${isTarget ? `${c.border} ${c.ring}` : 'border-white/[0.08] hover:border-accent/20'}`}>
              <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none mix-blend-overlay z-10" />
              <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/[0.08] text-[8px] font-mono tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTarget ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-white font-bold">{cam.id}</span>
                  <span className="text-gray-400">· {cam.name}</span>
                </div>
                <div className="text-gray-500">{isTarget ? 'ALERT_STATE: TRUE' : 'FEED: NOMINAL'}</div>
              </div>

              <div className="flex-1 relative bg-[#030305] flex items-center justify-center overflow-hidden">
                {cam.id === 'CAM-01' ? (
                  <>
                    <img src="http://localhost:8000/api/video_feed" alt="Live camera feed demonstrating real-time computer vision crowd detection" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none mix-blend-overlay opacity-60" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-black" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
                    {isTarget && activeIncident ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`absolute inset-0 opacity-10 animate-pulse ${c.bg}`} />
                        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-[60%] h-[55%] border-2 bg-white/5 relative flex flex-col justify-end p-2 ${c.border80}`}>
                          {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map(pos => (
                            <div key={pos} className={`absolute w-3.5 h-3.5 ${pos} ${c.border}`} />
                          ))}
                          <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} className={`absolute left-0 right-0 h-[1.5px] shadow-lg z-10 ${c.bg} ${c.shadow}`} />
                          <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                            <AlertTriangle className={`w-2.5 h-2.5 ${c.text}`} /><span>ANOMALY_DET: {activeIncident.incident_type}</span>
                          </div>
                          <div className="absolute bottom-2 right-2 text-[7px] font-mono text-gray-400">CONF: {(activeIncident.confidence * 100).toFixed(1)}%</div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-25">
                        <Scan className="w-6 h-6 text-accent mb-1.5 animate-pulse" />
                        <span className="text-[7px] font-mono uppercase tracking-widest text-accent">Sec_Scan_Active</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between text-[7px] font-mono text-gray-500 uppercase tracking-widest">
                <span>FPS: 30.00</span><span>ENC: H.265 / {cam.id === 'CAM-02' ? 'THERMAL' : 'WIDE'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
