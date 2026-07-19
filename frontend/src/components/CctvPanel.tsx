'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, AlertTriangle, Scan, Play } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

// High-tech AI Computer Vision Simulator for CCTV feeds
function SurveillanceCanvas({ camId, name, isTarget, activeIncident, severity }: {
  camId: string;
  name: string;
  isTarget: boolean;
  activeIncident: any;
  severity: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const width = canvas.width = 400
    const height = canvas.height = 250

    // Generate mock target entities that float around the specific section
    const targets = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      w: 18 + Math.random() * 10,
      h: 36 + Math.random() * 15,
      label: i === 2 ? 'OBJECT' : i === 3 ? 'VEHICLE' : 'HUMAN',
      conf: 87 + Math.random() * 12
    }))

    let scanY = 0

    const draw = () => {
      // 1. Clear background so the live video feed shows through
      ctx.clearRect(0, 0, width, height)

      // 2. Draw radar matrix grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 3. Draw Section Structural Wireframe (changes based on camera ID)
      ctx.strokeStyle = isTarget ? 'rgba(239, 68, 68, 0.15)' : 'rgba(10, 132, 255, 0.08)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (camId === 'CAM-01') {
        // Render Gate 3 Ingress Flow outline
        ctx.moveTo(80, 220); ctx.lineTo(80, 60); ctx.lineTo(320, 60); ctx.lineTo(320, 220)
        ctx.moveTo(200, 60); ctx.lineTo(200, 220)
        ctx.rect(120, 100, 160, 80)
      } else if (camId === 'CAM-02') {
        // Render 112 seating tiers
        for (let i = 0; i < 4; i++) {
          ctx.moveTo(30 + i * 20, 220 - i * 30)
          ctx.lineTo(370 - i * 20, 220 - i * 30)
        }
      } else if (camId === 'CAM-03') {
        // Render Concourse corridor perspective
        ctx.moveTo(50, 50); ctx.lineTo(150, 100); ctx.lineTo(150, 200); ctx.lineTo(50, 220)
        ctx.moveTo(350, 50); ctx.lineTo(250, 100); ctx.lineTo(250, 200); ctx.lineTo(350, 220)
        ctx.moveTo(150, 100); ctx.lineTo(250, 100)
        ctx.moveTo(150, 200); ctx.lineTo(250, 200)
      } else {
        // Render general VIP entrance outline
        ctx.rect(100, 60, 200, 140)
      }
      ctx.stroke()

      // 4. Update & Render AI Bounding Boxes
      targets.forEach((t, index) => {
        t.x += t.vx
        t.y += t.vy
        
        // Bounce off screen boundaries
        if (t.x < 20 || t.x > width - t.w - 20) t.vx *= -1
        if (t.y < 20 || t.y > height - t.h - 20) t.vy *= -1

        const activeColor = isTarget 
          ? (severity === 'critical' ? '#ef4444' : '#ffd60a')
          : '#30d158' // Green for nominal tracking

        // Add Thermal Blob if CAM-02
        if (camId === 'CAM-02') {
          const gradient = ctx.createRadialGradient(t.x + t.w/2, t.y + t.h/2, 0, t.x + t.w/2, t.y + t.h/2, Math.max(t.w, t.h));
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.5)');
          gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(t.x - 10, t.y - 10, t.w + 20, t.h + 20);
        }

        ctx.strokeStyle = activeColor
        ctx.lineWidth = 1.5

        // Draw bracket-style corners for a military-HUD appearance
        const len = 5
        // Top-Left corner
        ctx.beginPath(); ctx.moveTo(t.x, t.y + len); ctx.lineTo(t.x, t.y); ctx.lineTo(t.x + len, t.y); ctx.stroke()
        // Top-Right corner
        ctx.beginPath(); ctx.moveTo(t.x + t.w - len, t.y); ctx.lineTo(t.x + t.w, t.y); ctx.lineTo(t.x + t.w, t.y + len); ctx.stroke()
        // Bottom-Left corner
        ctx.beginPath(); ctx.moveTo(t.x, t.y + t.h - len); ctx.lineTo(t.x, t.y + t.h); ctx.lineTo(t.x + len, t.y + t.h); ctx.stroke()
        // Bottom-Right corner
        ctx.beginPath(); ctx.moveTo(t.x + t.w - len, t.y + t.h); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.lineTo(t.x + t.w, t.y + t.h - len); ctx.stroke()

        // Draw bounding box label text
        ctx.fillStyle = activeColor
        ctx.font = '7px monospace'
        ctx.fillText(`${t.label} [${t.conf.toFixed(1)}%]`, t.x + 2, t.y - 4)

        // Special UI for target 0 during an active incident (Identity Match)
        if (isTarget && activeIncident && index === 0 && camId !== 'CAM-02') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
          ctx.fillRect(t.x + t.w + 5, t.y - 10, 85, 36)
          ctx.strokeStyle = activeColor
          ctx.lineWidth = 1
          ctx.strokeRect(t.x + t.w + 5, t.y - 10, 85, 36)
          
          ctx.fillStyle = activeColor
          ctx.font = 'bold 7px monospace'
          ctx.fillText(severity === 'critical' ? 'THREAT MATCH' : 'POI MATCH', t.x + t.w + 10, t.y)
          ctx.fillStyle = 'white'
          ctx.fillText(`ID: ${activeIncident.id || 'UNK-99'}`, t.x + t.w + 10, t.y + 10)
          ctx.fillText(`PROB: ${(activeIncident.confidence * 100).toFixed(1)}%`, t.x + t.w + 10, t.y + 20)
          
          // Draw connecting line
          ctx.beginPath()
          ctx.moveTo(t.x + t.w, t.y + t.h/2)
          ctx.lineTo(t.x + t.w + 5, t.y + 10)
          ctx.stroke()
        }
      })

      // 5. Draw flashing targeting overlay on anomaly lock
      if (isTarget && activeIncident) {
        const pulse = Math.sin(Date.now() * 0.006) * 8 + 35
        const activeColor = severity === 'critical' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(234, 179, 8, 0.8)'
        
        ctx.strokeStyle = activeColor
        ctx.lineWidth = 2
        // Draw crosshair circles
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, pulse, 0, Math.PI * 2)
        ctx.stroke()

        // Outer brackets
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, pulse + 12, -Math.PI / 4, Math.PI / 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, pulse + 12, Math.PI * 3/4, Math.PI * 5/4)
        ctx.stroke()

        // Text alerts
        ctx.fillStyle = activeColor
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`CV_ALERT: ${activeIncident.incident_type.toUpperCase()}`, width / 2, height / 2 - pulse - 18)
        ctx.fillText(`SEVERITY: ${activeIncident.severity.toUpperCase()}`, width / 2, height / 2 + pulse + 22)
        ctx.textAlign = 'left' // Reset alignment
      }

      // 6. Scan line effect & static noise
      scanY = (scanY + 1.5) % height
      ctx.fillStyle = isTarget ? 'rgba(239, 68, 68, 0.08)' : 'rgba(10, 132, 255, 0.05)'
      ctx.fillRect(0, scanY - 2, width, 4)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(0, (scanY * 1.5) % height, width, 1.5)

      // 7. Tactical telemetry overlays
      const overlayColor = isTarget ? 'rgba(239, 68, 68, 0.9)' : 'rgba(10, 132, 255, 0.7)'
      ctx.fillStyle = overlayColor
      ctx.font = 'bold 8px monospace'
      if (Date.now() % 1000 < 500) {
        ctx.fillText(`REC ●`, 15, 22)
      } else {
        ctx.fillText(`REC`, 15, 22)
      }
      ctx.fillText(`PTZ TRK: P: +14.4° T: -12.1° Z: 2.4x`, 15, height - 12)
      
      // Density and Queue Metrics
      if (isTarget && activeIncident) {
        ctx.fillText(`DENSITY: ${activeIncident.severity.toUpperCase()} (${camId === 'CAM-01' ? '94' : '88'}%)`, 15, height - 32)
        ctx.fillText(`Q-LENGTH: ${camId === 'CAM-01' ? '382' : '14'} pax`, 15, height - 22)
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillText(`DENSITY: NOMINAL`, 15, height - 32)
        ctx.fillText(`Q-LENGTH: OK`, 15, height - 22)
      }

      // Flow direction arrows for Gate 3
      if (camId === 'CAM-01' && isTarget) {
        ctx.strokeStyle = overlayColor
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(160, 140)
        ctx.lineTo(190, 140)
        ctx.lineTo(185, 135)
        ctx.moveTo(190, 140)
        ctx.lineTo(185, 145)
        ctx.stroke()
        ctx.fillText(`FLOW: BACKUP`, 195, 143)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [isTarget, activeIncident, severity])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
}

export function CctvPanel() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const cctvTakeover = useZoneStore(state => state.cctvTakeover)
  const setCctvTakeover = useZoneStore(state => state.setCctvTakeover)
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

  const bgImages: Record<string, string> = {
    'CAM-01': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    'CAM-02': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop',
    'CAM-03': 'https://images.unsplash.com/photo-1511241936306-69f3ea6718d0?q=80&w=600&auto=format&fit=crop',
    'CAM-04': 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?q=80&w=600&auto=format&fit=crop'
  }

  return (
    <div className="w-full h-full bg-[rgba(10,10,12,0.45)] p-6 flex flex-col font-sans select-none overflow-hidden backdrop-blur-2xl border border-white/[0.04] rounded-[26px]">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-accent animate-pulse" />
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
            border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-500'
          } : {
            border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-500'
          }
 
          return (
            <div key={cam.id} className={`relative bg-black border rounded-xl overflow-hidden flex flex-col group transition-all duration-300 ${isTarget ? `${c.border} shadow-[0_0_20px_rgba(239,68,68,0.15)]` : 'border-white/[0.08] hover:border-accent/20'}`}>
              <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none mix-blend-overlay z-10" />
              <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/[0.08] text-[8px] font-mono tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTarget ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-white font-bold">{cam.id}</span>
                  <span className="text-gray-400">· {cam.name}</span>
                </div>
                <div className="text-gray-500">{isTarget ? 'ALERT_STATE: TRUE' : 'FEED: NOMINAL'}</div>
              </div>
              
              <div className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity bg-black/40 backdrop-blur-sm ${cctvTakeover === cam.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                  onClick={() => setCctvTakeover(cctvTakeover === cam.id ? null : cam.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-accent/50 text-accent rounded hover:bg-accent hover:text-black transition-colors text-[9px] font-bold tracking-widest uppercase"
                >
                  {cctvTakeover === cam.id ? 'EXIT 3D VIEW' : 'SYNC LIVE 3D FEED'}
                </button>
              </div>

              <div className="flex-1 relative bg-[#030305] flex items-center justify-center overflow-hidden">
                <motion.img 
                  src={bgImages[cam.id]} 
                  className={`absolute inset-0 w-full h-full object-cover ${cam.id === 'CAM-02' ? 'grayscale contrast-150 invert opacity-60' : 'grayscale contrast-125 brightness-75 sepia-[.3] hue-rotate-[190deg] opacity-50'}`}
                  alt="Live Feed"
                  animate={{ 
                    x: [0, -2, 1, -1, 0, -8, -6, -8, 0], 
                    y: [0, 1, -1, 2, 0, -4, -3, -4, 0], 
                    scale: [1.05, 1.06, 1.05, 1.05, 1.05, 1.12, 1.12, 1.12, 1.05],
                  }}
                  transition={{ repeat: Infinity, duration: cam.id === 'CAM-01' ? 12 : 15, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-0 bg-white z-20 pointer-events-none mix-blend-overlay"
                  animate={{ opacity: [0, 0, 0.15, 0, 0.05, 0, 0] }}
                  transition={{ repeat: Infinity, duration: Math.random() * 3 + 2, times: [0, 0.4, 0.42, 0.44, 0.46, 0.48, 1] }}
                />
                <SurveillanceCanvas 
                  camId={cam.id} 
                  name={cam.name} 
                  isTarget={isTarget} 
                  activeIncident={activeIncident} 
                  severity={severity} 
                />
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
