'use client'

import { useZoneStore } from '@/store/useZoneStore'
import { Settings, ShieldAlert, Cpu, Database, Save, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export function PlatformSettings() {
  const [model, setModel] = useState('meta/llama-3.3-70b-instruct')
  const [interval, setIntervalVal] = useState('1s')
  const [threshold, setThreshold] = useState(70)
  const [voiceAlerts, setVoiceAlerts] = useState(true)
  const [autoResolve, setAutoResolve] = useState(false)
  const [backupSync, setBackupSync] = useState(true)

  const handleSave = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("System parameters updated. AI thresholds synced.")
      u.rate = 1.05
      window.speechSynthesis.speak(u)
    }
  }

  const handleReset = () => {
    setModel('meta/llama-3.3-70b-instruct')
    setIntervalVal('1s')
    setThreshold(70)
    setVoiceAlerts(true)
    setAutoResolve(false)
    setBackupSync(true)
  }

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,0.85)] p-6 flex flex-col font-sans select-none overflow-y-auto no-scrollbar gap-6 backdrop-blur-xl rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <Settings className="w-4 h-4 text-accent" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Platform Config & Parameters</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Control Center Core Settings</p>
          </div>
        </div>
      </div>

      {/* Main forms split */}
      <div className="grid grid-cols-[1fr_360px] gap-6 min-h-0">
        
        {/* Form controls */}
        <div className="space-y-5">
          {/* Section 1: AI Model Configuration */}
          <div className="bg-slate-950/20 border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> AI Engine Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500">Inference Core Model</label>
                <select 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-accent/50 font-mono"
                >
                  <option value="meta/llama-3.3-70b-instruct">Llama 3.3 70B (NVIDIA NIM)</option>
                  <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B (NVIDIA NIM)</option>
                  <option value="arenaos-custom-v4">ArenaOS Core v4 (Local)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase text-gray-500">Telemetry Sync Interval</label>
                <select 
                  value={interval} 
                  onChange={(e) => setIntervalVal(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-accent/50 font-mono"
                >
                  <option value="1s">1.0 Seconds (Real-Time)</option>
                  <option value="3s">3.0 Seconds (Standard)</option>
                  <option value="5s">5.0 Seconds (Low Power)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Safety & Thresholds */}
          <div className="bg-slate-950/20 border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Safety Toggles & Alert Thresholds
            </h3>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
                <span>Occupancy Alert Threshold</span>
                <span className="text-white font-bold">{threshold}%</span>
              </div>
              <input 
                type="range" 
                min={50} 
                max={95} 
                value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-accent mt-1"
              />
              <span className="text-[8px] text-gray-600 font-mono uppercase mt-0.5">Triggers warning status when any zone occupancy exceeds this parameter.</span>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2 border-t border-white/[0.08] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-300">Voice Alerts (TTS)</span>
                  <span className="text-[8px] font-mono text-gray-500 mt-0.5">Vocalizes AI Agent synthesis logs</span>
                </div>
                <button 
                  onClick={() => setVoiceAlerts(!voiceAlerts)} 
                  className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 flex items-center ${voiceAlerts ? 'bg-accent' : 'bg-gray-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-black transition-all ${voiceAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-300">Autonomous Auto-Resolve</span>
                  <span className="text-[8px] font-mono text-gray-500 mt-0.5">Executes AI strategies without approval</span>
                </div>
                <button 
                  onClick={() => setAutoResolve(!autoResolve)} 
                  className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 flex items-center ${autoResolve ? 'bg-accent' : 'bg-gray-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-black transition-all ${autoResolve ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel Side */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950/20 border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2 mb-4">
                <Database className="w-3.5 h-3.5" /> Redundancy & Backups
              </h3>
              
              <div className="space-y-4 font-mono text-[9px] text-gray-500 uppercase">
                <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-white/[0.08]">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">Sync Primary Server</span>
                    <span className="mt-0.5 text-gray-500">Live DB Replication</span>
                  </div>
                  <button 
                    onClick={() => setBackupSync(!backupSync)} 
                    className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 flex items-center ${backupSync ? 'bg-accent' : 'bg-gray-800'}`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-black transition-all ${backupSync ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span>BACKUP NODE STATE:</span>
                  <span className="text-accent font-bold">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span>SSL CERTIFICATE:</span>
                  <span className="text-green-400 font-bold">VALID</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span>API LATENCY:</span>
                  <span className="text-white font-bold">4.2 ms</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/[0.08] pt-4 mt-6">
              <button 
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-transparent hover:bg-white/5 rounded-lg border border-white/[0.08] transition-all font-mono text-[9px] uppercase tracking-wider text-gray-400 active:scale-97"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>

              <button 
                onClick={handleSave}
                className="flex-[2] flex items-center justify-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent/80 rounded-lg text-white font-bold transition-all font-mono text-[9px] uppercase tracking-wider active:scale-97"
              >
                <Save className="w-3.5 h-3.5" /> Save Parameters
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
