'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Sparkles, ContactShadows, Environment, useGLTF, CameraControls, Html, shaderMaterial, QuadraticBezierLine } from '@react-three/drei'
import { Play, Pause, Flame, RotateCcw, Compass, RotateCw, ZoomIn, ZoomOut, RefreshCw, Layers, Brain } from 'lucide-react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useZoneStore, Zone } from '@/store/useZoneStore'
import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import type CameraControlsImpl from 'camera-controls'
import { DroneEntity } from '@/components/DroneEntity'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, BarChart3, XCircle } from 'lucide-react'
import { CrowdForecastChart } from '@/components/CrowdForecastChart'
import { useIsMobile } from '@/hooks/useMediaQuery'

import { PredictionsPanel } from '@/components/PredictionsPanel'
const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  "zone_1": [200, 2, 0],    // Gate 3 (East)
  "zone_2": [-100, 15, 0],  // Section 112 (West Seating)
  "zone_3": [0, 5, -240],   // Concourse North
  "zone_4": [-120, 35, 0],  // VIP Lounge (West Upper)
  "zone_5": [0, 2, 240],    // Gate 1 (South)
  "zone_6": [100, 15, 0],   // Section 115 (East Seating)
}

// 1. Custom Heatmap Shader
const HeatmapMaterial = shaderMaterial(
  { uTime: 0, uActivePos: new THREE.Vector3(0, 0, 0), uIntensity: 0 },
  // vertex shader
  `varying vec2 vUv;
   varying vec3 vPos;
   void main() {
     vUv = uv;
     vPos = (modelMatrix * vec4(position, 1.0)).xyz;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // fragment shader
  `varying vec2 vUv;
   varying vec3 vPos;
   uniform float uTime;
   uniform vec3 uActivePos;
   uniform float uIntensity;
   
   void main() {
     float dist = distance(vPos, vec3(uActivePos.x, 0.0, uActivePos.z));
     float strength = smoothstep(60.0, 0.0, dist); 
     
     vec3 baseColor = vec3(0.0, 0.3, 0.6); 
     vec3 hotColor = vec3(1.0, 0.0, 0.0);  
     vec3 finalColor = mix(baseColor, hotColor, strength);
     
     // Pulse wave
     float wave = sin(dist * 0.5 - uTime * 4.0) * 0.5 + 0.5;
     finalColor += wave * 0.2 * strength;
     
     float alpha = strength * 0.6 * uIntensity;
     gl_FragColor = vec4(finalColor, alpha);
   }`
)
extend({ HeatmapMaterial })

function HeatmapFloor() {
  const materialRef = useRef<any>(null)
  const activeIncident = useZoneStore(state => state.activeIncident)
  const targetPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime

      if (activeIncident) {
        materialRef.current.uIntensity = THREE.MathUtils.lerp(materialRef.current.uIntensity, 1.0, delta * 2)
        const pos = ZONE_POSITIONS[activeIncident.zone_id] || [0, 0, 0]
        targetPos.set(pos[0], pos[1], pos[2])
        materialRef.current.uActivePos.lerp(targetPos, delta * 3)
      } else {
        materialRef.current.uIntensity = THREE.MathUtils.lerp(materialRef.current.uIntensity, 0.0, delta * 2)
      }
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <planeGeometry args={[600, 600, 64, 64]} />
      {/* @ts-ignore */}
      <heatmapMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function EvacuationRoute() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const matRef = useRef<any>(null)

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.dashOffset -= 0.05
    }
  })

  if (!activeIncident || activeIncident.severity !== 'critical') return null

  const startPos = ZONE_POSITIONS[activeIncident.zone_id] || [0, 0, 0]
  const endPos: [number, number, number] = [0, 0, 280] // Nearest Exit (South Gate)

  return (
    <QuadraticBezierLine
      start={startPos}
      end={endPos}
      mid={[startPos[0] * 0.5, 30, startPos[2] * 0.5]}
      color="#ef4444"
      lineWidth={4}
      dashed={true}
      dashScale={20}
      dashSize={2}
      dashOffset={0}
      ref={matRef}
    />
  )
}

function StadiumModel({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF('/models/modern_stadium_optimized.glb')

  useEffect(() => {
    if (!isMobile) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene, isMobile]);

  // Centering the model based on its bounding box calculations
  return <primitive object={scene} scale={0.06} position={[-78, -2, 124]} />
}

/**
 * Breathing LED Ring around the pitch concourse
 */
function LedRibbon() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((state) => {
    if (matRef.current) {
      const t = state.clock.getElapsedTime()
      matRef.current.emissiveIntensity = 1.0 + Math.sin(t * 3.5) * 0.4
    }
  })
  return (
    <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[140, 142, 64]} />
      <meshStandardMaterial 
        ref={matRef} 
        color="#0a84ff" 
        emissive="#0a84ff" 
        emissiveIntensity={1.2} 
        transparent 
        opacity={0.65} 
      />
    </mesh>
  )
}

/**
 * Pulsing alert ring centered on active incident
 */
function ScanningRing() {
  const activeIncident = useZoneStore(state => state.activeIncident)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.getElapsedTime()
      const scale = 0.1 + (t * 1.5) % 3.0
      ringRef.current.scale.set(scale, scale, 1)
      if (ringRef.current.material) {
        (ringRef.current.material as any).opacity = (1.0 - scale / 3.0) * 0.7
      }
    }
  })

  if (!activeIncident) return null
  const pos = ZONE_POSITIONS[activeIncident.zone_id]
  if (!pos) return null

  const isCritical = activeIncident.severity === 'critical'
  const color = isCritical ? '#ff453a' : '#ff9f0a'

  return (
    <mesh ref={ringRef} position={[pos[0], pos[1] + 0.15, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0, 18, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/**
 * Floating digital twin diagnostic scoreboard
 */
function VirtualScoreboard() {
  const [data, setData] = useState({ score: 'OS_NOMINAL', status: 'Core State Active' })
  const activeIncident = useZoneStore(state => state.activeIncident)

  useEffect(() => {
    if (activeIncident) {
      setData({ score: 'WARNING_DETECTED', status: activeIncident.incident_type.toUpperCase() })
    } else {
      setData({ score: 'OS_NOMINAL', status: 'Core State Active' })
    }
  }, [activeIncident])

  return (
    <Html position={[0, 48, 0]} center>
      <div className="bg-[#0b0c10]/92 border border-white/[0.08] p-3 rounded-lg text-center font-mono shadow-2xl backdrop-blur-xl min-w-[170px] select-none pointer-events-none">
        <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Virtual Scoreboard</div>
        <div className={`text-xs font-bold tracking-wider ${activeIncident ? 'text-red-500 animate-pulse' : 'text-accent'}`}>{data.score}</div>
        <div className="text-[8px] text-white/50 mt-1 uppercase tracking-widest">{data.status}</div>
      </div>
    </Html>
  )
}

function ZoneMarkerInner({ zone, onClick, hovered, setHovered, pos }: { zone: Zone; onClick: (pos: [number, number, number]) => void; hovered: boolean; setHovered: (h: boolean) => void; pos: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const isCritical = zone.status === 'critical'
  const isWarning = zone.status === 'warning'
  const isVisible = isCritical || isWarning || hovered
  const color = isCritical ? '#ff453a' : isWarning ? '#ff9f0a' : '#0a84ff'

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      if (isCritical) {
        meshRef.current.scale.setScalar(1.0 + Math.sin(t * 12) * 0.2)
      } else if (isWarning) {
        meshRef.current.scale.setScalar(1.0 + Math.sin(t * 7) * 0.15)
      } else {
        meshRef.current.scale.setScalar(0.75 + Math.sin(t * 3) * 0.08)
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
      onClick={(e) => { e.stopPropagation(); onClick(pos) }}
    >
      <sphereGeometry args={[hovered ? 0.65 : 0.45, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isVisible ? 0.75 : 0.12}
        toneMapped={false}
      />
    </mesh>
  )
}

const ZoneMarker = React.memo(
  function ZoneMarker({ zone, onClick }: { zone: Zone, onClick: (pos: [number, number, number]) => void }) {
    const [hovered, setHovered] = useState(false)
    const pos = ZONE_POSITIONS[zone.id] || [0, 0, 0]

    const isCritical = zone.status === 'critical'
    const isWarning = zone.status === 'warning'
    const isVisible = isCritical || isWarning || hovered

    return (
      <group position={pos}>
        <ZoneMarkerInner zone={zone} onClick={onClick} hovered={hovered} setHovered={setHovered} pos={pos} />

        {/* Tooltip */}
        {isVisible && (
          <Html position={[0, 3, 0]} center style={{ pointerEvents: 'none' }}>
            <div className={`px-2 py-1 bg-black/85 backdrop-blur-md rounded border font-mono text-[9px] whitespace-nowrap transition-all duration-300 ${hovered ? 'scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)] -translate-y-1' : 'scale-100 shadow-md'} ${isCritical ? 'border-red-500 text-red-100' : isWarning ? 'border-yellow-500 text-yellow-100' : 'border-[#0a84ff] text-white'}`}>
              <div className="font-bold uppercase tracking-wider">{zone.name}</div>
              <div className="text-gray-400">Occ: <span className={isCritical ? 'text-red-400 font-bold' : ''}>{zone.occupancy}%</span></div>
            </div>
          </Html>
        )}
      </group>
    )
  },
  (prev, next) => prev.zone.occupancy === next.zone.occupancy && prev.zone.status === next.zone.status
)

function ZoneMarkers({ layers, onClick }: { layers: any; onClick: (pos: [number, number, number]) => void }) {
  const zones = useZoneStore(state => state.zones)
  return (
    <>
      {layers.sensors && zones.map(zone => (
        <ZoneMarker key={zone.id} zone={zone} onClick={onClick} />
      ))}
    </>
  )
}

function SceneController({ controlsRef, isOrbiting }: { controlsRef: any; isOrbiting: boolean }) {
  const activeIncident = useZoneStore(state => state.activeIncident)

  useFrame((state, delta) => {
    if (controlsRef.current && !controlsRef.current.active) {
      if (isOrbiting) {
        if (!activeIncident) {
          const t = state.clock.getElapsedTime()
          controlsRef.current.azimuthAngle += 0.012 * delta
          controlsRef.current.polarAngle += Math.sin(t * 0.4) * 0.0002
        } else {
          controlsRef.current.azimuthAngle += 0.04 * delta
        }
      }
    }
  })

  useEffect(() => {
    if (!controlsRef.current) return

    if (activeIncident) {
      const zones = useZoneStore.getState().zones
      const zone = zones.find(z => z.id === activeIncident.zone_id)
      if (!zone) return

      const pos = ZONE_POSITIONS[zone.id] || [0, 0, 0]
      
      // Step 1: Dramatic Swoop Out / Arena Overview
      controlsRef.current.smoothTime = 0.5
      controlsRef.current.setLookAt(280, 220, 280, 0, 0, 0, true)

      // Step 2: Cinematic dive-in rotation and close-up focus
      const t1 = setTimeout(() => {
        if (!controlsRef.current) return
        controlsRef.current.smoothTime = 1.3
        controlsRef.current.setLookAt(
          pos[0] + 55, pos[1] + 35, pos[2] + 55,
          pos[0], pos[1], pos[2],
          true
        )
      }, 700)

      return () => clearTimeout(t1)
    } else {
      controlsRef.current.smoothTime = 1.2
      controlsRef.current.setLookAt(250, 180, 250, 0, 0, 0, true)
    }
  }, [activeIncident, controlsRef])

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={8}
      maxDistance={1000}
      maxPolarAngle={Math.PI / 2 - 0.05}
      dollySpeed={0.5}
    />
  )
}

export function StadiumCanvas() {
  const systemStatus = useZoneStore(state => state.systemStatus)
  const activeIncident = useZoneStore(state => state.activeIncident)
  const [activeView, setActiveView] = useState('3D Twin')
  const isMobile = useIsMobile()

  // Layer Toggles
  const [layers, setLayers] = useState({
    occupancy: true,
    heatmap: true,
    flow: true,
    sensors: true,
    cctv: true,
    drones: true,
    grid: true,
    weather: false
  })

  // Automatically activate scanning layers when an incident occurs
  useEffect(() => {
    if (activeIncident) {
      setLayers(prev => ({
        ...prev,
        heatmap: true,
        sensors: true,
        drones: true
      }))
    }
  }, [activeIncident])

  // Camera settings
  const controlsRef = useRef<any>(null)
  const [isOrbiting, setIsOrbiting] = useState(true)
  const [isLayersOpen, setIsLayersOpen] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)

  // Vanta background
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    if (!vantaRef.current || vantaEffect.current) return
    let cancelled = false
    import('vanta/dist/vanta.clouds.min').then((mod) => {
      if (cancelled || !vantaRef.current) return
      vantaEffect.current = mod.default({
        el: vantaRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        backgroundColor: 0xffffff,
        skyColor: 0x68b8d7,
        cloudColor: 0xadc1de,
        cloudShadowColor: 0x183550,
        sunColor: 0xff9919,
        sunGlareColor: 0xff6633,
        sunlightColor: 0xff9933,
        speed: 0.0,
      })
    })
    return () => {
      cancelled = true
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  const handleCameraReset = () => {
    if (controlsRef.current) {
      controlsRef.current.smoothTime = 0.8
      controlsRef.current.setLookAt(250, 180, 250, 0, 0, 0, true)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (controlsRef.current) {
      controlsRef.current.dolly(direction === 'in' ? 5 : -5, true)
    }
  }

  const handleRotate = (amount: number) => {
    if (controlsRef.current) {
      controlsRef.current.rotate(amount, 0, true)
    }
  }

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleMarkerClick = (pos: [number, number, number]) => {
    if (controlsRef.current) {
      controlsRef.current.smoothTime = 0.6
      controlsRef.current.setLookAt(
        pos[0] + 12, pos[1] + 10, pos[2] + 12,
        pos[0], pos[1], pos[2],
        true
      )
    }
  }
  const setShowDecisionMatrix = useZoneStore(state => state.setShowDecisionMatrix)
  const setPlaybackMode = useZoneStore(state => state.setPlaybackMode)
  const playbackMode = useZoneStore(state => state.playbackMode)

  useEffect(() => {
    if (activeView === '2D Map') {
      if (controlsRef.current) {
        controlsRef.current.smoothTime = 1.0
        controlsRef.current.setLookAt(0.01, 380, 0, 0, 0, 0, true) // Zoomed in and rotated 90deg (aligns horizontal field)
      }
    } else if (activeView === '3D Twin') {
      if (controlsRef.current) {
        controlsRef.current.smoothTime = 1.0
        controlsRef.current.setLookAt(250, 180, 250, 0, 0, 0, true)
      }
    } else if (activeView === 'Compare') {
      setShowDecisionMatrix(true)
      setActiveView('3D Twin')
    } else if (activeView === 'Timeline') {
      setPlaybackMode(!playbackMode)
      setActiveView('3D Twin')
    }
  }, [activeView, setShowDecisionMatrix, setPlaybackMode, playbackMode])

  return (
    <div className="absolute inset-0 bg-[#050510] select-none">
      {/* Vanta CLOUDS background */}
      <div ref={vantaRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Canvas */}
      <Canvas dpr={isMobile ? [1, 1] : [1, 2]} camera={{ position: [250, 180, 250], fov: 38 }} shadows={!isMobile} gl={{ alpha: true, antialias: !isMobile }} style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <fog attach="fog" args={['#050510', 800, 1800]} />

        {/* Cinematic ambient and fill lights */}
        <ambientLight intensity={0.3} color="#4fd1c5" />
        <hemisphereLight groundColor="#000000" color="#3b82f6" intensity={0.35} />

        <directionalLight
          position={[20, 45, 20]}
          intensity={1.1}
          color="#fffaf0"
          castShadow={!isMobile}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0005}
        />

        {/* Cinematic Rim Lights */}
        <directionalLight position={[-40, 20, -40]} intensity={0.6} color="#3b82f6" />
        <directionalLight position={[40, 15, -40]} intensity={0.4} color="#4fd1c5" />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.15} />

          <StadiumModel isMobile={isMobile} />

          {!isMobile && <ContactShadows resolution={256} scale={80} blur={2.0} opacity={0.6} far={8} color="#000000" />}

          {layers.grid && (
            <Grid position={[0, -0.05, 0]} infiniteGrid fadeDistance={70} cellColor="#0a84ff" sectionColor="#003566" cellThickness={0.4} sectionThickness={0.8} />
          )}

          {layers.heatmap && <HeatmapFloor />}
          <EvacuationRoute />
          {layers.drones && <DroneEntity />}

          {/* Stadium Bowl Crowd Sparkles */}
          {layers.occupancy && (
            <Sparkles
              count={220}
              scale={[220, 15, 220]}
              position={[0, 12, 0]}
              size={1.6}
              speed={0.16}
              opacity={activeIncident ? 0.45 : 0.22}
              color={activeIncident ? (activeIncident.severity === 'critical' ? '#ff453a' : '#ff9f0a') : '#0a84ff'}
            />
          )}

          {/* Ambient Particles */}
          {layers.occupancy && (
            <Sparkles
              count={systemStatus === 'CRITICAL' ? 150 : 80}
              scale={50}
              size={systemStatus === 'CRITICAL' ? 1.5 : 1.0}
              speed={systemStatus === 'CRITICAL' ? 0.5 : 0.1}
              opacity={systemStatus === 'CRITICAL' ? 0.4 : 0.2}
              color={systemStatus === 'CRITICAL' ? '#ff453a' : systemStatus === 'WARNING' ? '#ff9f0a' : '#0a84ff'}
            />
          )}

          {/* High-tech Twin Overlays */}
          <LedRibbon />
          <ScanningRing />
          <VirtualScoreboard />

          <ZoneMarkers layers={layers} onClick={handleMarkerClick} />
          <SceneController controlsRef={controlsRef} isOrbiting={isOrbiting} />
        </Suspense>

        {!isMobile && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom luminanceThreshold={0.97} intensity={0.25} mipmapBlur={false} />
            <Vignette offset={0.15} darkness={0.8} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Floating HUD View Controls */}
      {!isMobile && (
        <div className="absolute top-4 left-4 z-[80] flex flex-col gap-1.5 p-1.5 bg-[rgba(18,18,20,0.7)] backdrop-blur-xl border border-white/[0.08] rounded-xl text-gray-300 shadow-2xl pointer-events-auto">
        <button
          onClick={() => setIsOrbiting(!isOrbiting)}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors border ${isOrbiting ? 'bg-accent/20 text-accent border-accent/30' : 'border-transparent bg-white/5 hover:bg-white/10 hover:text-white'}`}
          title={isOrbiting ? "Stop Auto-Orbit" : "Start Auto-Orbit"}
        >
          <Compass className="w-3 h-3" />
        </button>
        
        <div className="w-full h-[1px] bg-white/10 my-0.5" />

        <button onClick={() => handleRotate(0.5)} className="flex items-center justify-center p-2 rounded-lg border border-transparent bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Rotate Right">
          <RotateCw className="w-3 h-3" />
        </button>
        <button onClick={() => handleRotate(-0.5)} className="flex items-center justify-center p-2 rounded-lg border border-transparent bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Rotate Left">
          <RotateCcw className="w-3 h-3" />
        </button>
        <button onClick={() => handleZoom('in')} className="flex items-center justify-center p-2 rounded-lg border border-transparent bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Zoom In">
          <ZoomIn className="w-3 h-3" />
        </button>
        <button onClick={() => handleZoom('out')} className="flex items-center justify-center p-2 rounded-lg border border-transparent bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Zoom Out">
          <ZoomOut className="w-3 h-3" />
        </button>
        
        <div className="w-full h-[1px] bg-white/10 my-0.5" />

        <button onClick={handleCameraReset} className="flex items-center justify-center p-2 rounded-lg border border-transparent bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Reset View">
          <RefreshCw className="w-3 h-3" />
        </button>
        </div>
      )}

      {/* Floating HUD Diagnostic Layers & AI Predictions */}
      {!isMobile && (
        <div className="absolute top-4 right-4 z-[80] flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex gap-2">
          {/* AI Predictions Toggle Button */}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`flex items-center space-x-2 px-3 py-1.5 bg-[rgba(18,18,20,0.7)] backdrop-blur-xl border rounded-xl text-gray-300 shadow-2xl hover:text-white transition-colors ${showPredictions ? 'border-accent/40 text-accent font-semibold' : 'border-white/[0.08]'}`}
          >
            <Brain className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px]">Predictions</span>
          </button>

          {/* Layers Toggle Button */}
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 bg-[rgba(18,18,20,0.7)] backdrop-blur-xl border rounded-xl text-gray-300 shadow-2xl hover:text-white transition-colors ${isLayersOpen ? 'border-accent/40 text-accent font-semibold' : 'border-white/[0.08]'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">Layers</span>
          </button>
        </div>

        <AnimatePresence>
          {isLayersOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1.5 p-3.5 bg-[rgba(18,18,20,0.85)] backdrop-blur-xl border border-white/[0.08] rounded-xl text-gray-300 w-44 shadow-2xl"
            >
              {(Object.keys(layers) as Array<keyof typeof layers>).map(layerKey => (
                <div key={layerKey} className="flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-white/5 transition-colors">
                  <span className="text-white/80 font-medium text-[11px] capitalize">{layerKey}</span>
                  <button
                    onClick={() => toggleLayer(layerKey)}
                    className={`w-7 h-4 rounded-full p-0.5 transition-all duration-300 flex items-center border ${layers[layerKey] ? 'bg-accent/80 border-accent' : 'bg-transparent border-white/20'}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all ${layers[layerKey] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPredictions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-80 bg-[rgba(18,18,20,0.92)] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-1"
            >
              <div className="flex justify-between items-center px-3 py-2 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Predictions Matrix</span>
                <button
                  onClick={() => setShowPredictions(false)}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  <PredictionsPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mock Panels for unassigned views */}
      <AnimatePresence>
        {activeView === 'Scenarios' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[90] w-[600px] bg-[rgba(28,28,30,0.62)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 shadow-2xl flex flex-col gap-4 text-gray-300 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-accent" /> Scenario Library</h2>
              <button onClick={() => setActiveView('3D Twin')} className="text-gray-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                <h3 className="font-bold text-white text-sm mb-1">Evacuation Protocol Alpha</h3>
                <p className="text-xs text-gray-400">Standard tier 1 egress strategy for minor anomalies.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                <h3 className="font-bold text-white text-sm mb-1">Medical Fast-Track</h3>
                <p className="text-xs text-gray-400">Clears concourse paths for EMS vehicles and staff.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-accent/50 cursor-pointer transition-colors">
                <h3 className="font-bold text-white text-sm mb-1">Crowd Dispersion</h3>
                <p className="text-xs text-gray-400">Re-routes pedestrian flow from high-density gates.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg hover:border-red-500/50 cursor-pointer transition-colors">
                <h3 className="font-bold text-red-400 text-sm mb-1">Total Lockdown</h3>
                <p className="text-xs text-gray-400">Seals perimeters. Requires HITL Commander Override.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'Analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[90] w-[800px] h-[500px] bg-[rgba(28,28,30,0.62)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 shadow-2xl flex flex-col gap-4 text-gray-300 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> System Analytics</h2>
              <button onClick={() => setActiveView('3D Twin')} className="text-gray-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/40 p-4">
              <div className="w-full h-full relative">
                <CrowdForecastChart />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operations Console HUD Overlay */}
      {!isMobile && <OperationsConsole activeView={activeView} setActiveView={setActiveView} />}
    </div>
  )
}

const OperationsConsole = React.memo(
  function OperationsConsole({ activeView, setActiveView }: { activeView: string; setActiveView: (view: string) => void }) {
    const playbackMode = useZoneStore(state => state.playbackMode)
    const playbackIndex = useZoneStore(state => state.playbackIndex)
    const historicalSnapshots = useZoneStore(state => state.historicalSnapshots)
    const setPlaybackMode = useZoneStore(state => state.setPlaybackMode)
    const setPlaybackIndex = useZoneStore(state => state.setPlaybackIndex)

    const maxIndex = Math.max(0, historicalSnapshots.length - 1)

    const handleTogglePlayback = () => {
      setPlaybackMode(!playbackMode)
    }

    const handlePlaybackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!playbackMode) setPlaybackMode(true)
      setPlaybackIndex(Number(e.target.value))
    }

    const triggerIncident = async (type: string) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident_type: type })
        })
        if (!res.ok) throw new Error('API failed')
      } catch (e) {
        console.warn("Backend unavailable. Falling back to client-side simulation.", e)
        
        // Generate dynamic consistent parameters
        let occupancy = 90
        let confidence = 0.95
        let explanation = ''
        let recommended_action = ''
        let severity = 'warning'

        if (type === 'Gate 3 Overcrowding') {
          occupancy = Math.floor(Math.random() * (96 - 91 + 1)) + 91 // 91-96%
          const flowRate = Math.floor(120 + (occupancy - 90) * 7.5 + (Math.random() * 6 - 3)) // 128-158
          const prob = Math.min(99, Math.max(80, Math.floor(80 + (occupancy - 90) * 3 + (Math.random() * 4 - 2))))
          const eta = Math.floor(270 - (occupancy - 90) * 30 + (Math.random() * 20 - 10))
          const etaMin = (eta / 60).toFixed(1)
          confidence = parseFloat((0.94 + (occupancy - 90) * 0.01 + (Math.random() * 0.02 - 0.01)).toFixed(2))
          confidence = Math.min(0.99, Math.max(0.90, confidence))
          const altCapacity = Math.floor(Math.random() * (48 - 35 + 1)) + 35 // 35-48%

          explanation = `Crowd density increased 37% over the last 90 seconds. Turnstile throughput has exceeded expected capacity by ${flowRate} people/min. Bottleneck probability now ${prob}% with estimated critical congestion at Gate 3 in ${etaMin} minutes.`
          recommended_action = `Deploy Crowd Control Unit Beta to Gate 3. Redirect incoming traffic to Gate 4, which is currently operating under ${altCapacity}% capacity.`
          severity = 'warning'
        } else if (type === 'Section 112 Medical Event') {
          occupancy = Math.floor(Math.random() * (94 - 87 + 1)) + 87 // 87-94%
          const sec111 = occupancy + Math.floor(Math.random() * 4) + 1
          const sec113 = occupancy - (Math.floor(Math.random() * 5) + 3)
          const eta = Math.floor(Math.random() * (55 - 35 + 1)) + 35 // 35-55s
          confidence = parseFloat((0.92 + (Math.random() * 0.04 - 0.02)).toFixed(2))
          severity = 'critical'

          explanation = `Biomedical sensor alert triggered in Section 112 (Row 14). Surrounding seating sections 111 and 113 are congested at ${sec111}% and ${sec113}% occupancy respectively, impeding emergency ingress routes.`
          recommended_action = `Dispatch Medical Response Team Charlie from North Station (ETA ${eta}s). Send Usher Units 4 and 5 to clear physical aisle access through Section 113.`
        } else { // Concourse North Fire Alarm
          occupancy = Math.floor(Math.random() * (52 - 40 + 1)) + 40 // 40-52%
          const windSpeed = Math.floor(Math.random() * (18 - 10 + 1)) + 10 // 10-18mph
          const exitCap = Math.floor(Math.random() * (69 - 58 + 1)) + 58 // 58-69%
          const evacTime = (2.8 + (occupancy - 40) * 0.12 + (Math.random() * 0.4 - 0.2)).toFixed(1)
          confidence = parseFloat((0.96 + (Math.random() * 0.03 - 0.01)).toFixed(2))
          confidence = Math.min(0.99, Math.max(0.94, confidence))
          severity = 'critical'

          explanation = `Thermal anomaly detected in Sector 4 core. Region occupancy is at ${occupancy}%. Wind speed measured NE at ${windSpeed}mph. Primary evacuation exits 12 and 14 are clear and at ${exitCap}% capacity.`
          recommended_action = `Initiate dynamic Sector 4 evacuation protocol (Est. evacuation time: ${evacTime} minutes). Direct crowd paths toward Exits 12 and 14. Deploy Fire Safety Team Alpha to coordinate local containment.`
        }

        const incident = {
          id: type === 'Gate 3 Overcrowding' ? 'mock_gate3' : type === 'Section 112 Medical Event' ? 'mock_sec112' : 'mock_concourse',
          timestamp: new Date().toISOString(),
          incident_type: type,
          zone_id: type === 'Gate 3 Overcrowding' ? 'zone_1' : type === 'Section 112 Medical Event' ? 'zone_2' : 'zone_3',
          zone_name: type === 'Gate 3 Overcrowding' ? 'Gate 3' : type === 'Section 112 Medical Event' ? 'Section 112' : 'Concourse North',
          severity,
          confidence,
          explanation,
          recommended_action
        }
        
        const store = useZoneStore.getState()
        store.setActiveIncident(incident)
        store.addLog(incident)
        
        const updatedZones = store.zones.map(z => {
          if (z.id === incident.zone_id) {
            return { ...z, occupancy, status: incident.severity as any }
          }
          return z
        })
        store.setZones(updatedZones)
      }
    }

    const resetSimulation = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/demo/resolve`, { method: 'POST' })
      } catch (e) {
        console.warn("Backend unavailable. Resetting client-side simulation.")
        const store = useZoneStore.getState()
        store.setActiveIncident(null)
        store.setShowImpactReport(false)
        store.setShowDecisionMatrix(false)
        
        const baseZones = store.zones.map(z => {
          return { ...z, occupancy: z.baseline, status: 'normal' as const }
        })
        store.setZones(baseZones)
      }
    }

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '1') triggerIncident('Gate 3 Overcrowding')
        if (e.key === '2') triggerIncident('Section 112 Medical Event')
        if (e.key === '3') triggerIncident('Concourse North Fire Alarm')
        if (e.key === '0') resetSimulation()
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
      <div className="absolute bottom-4 left-4 right-4 z-[80] pointer-events-none">
        <div className="flex items-center justify-between bg-[rgba(28,28,30,0.62)] backdrop-blur-xl border border-white/[0.08] p-3 rounded-xl text-gray-300 font-mono text-[9px] gap-6 shadow-2xl overflow-x-auto no-scrollbar pointer-events-auto">

          {/* Left Section: Playback Scrubber (Timeline Analysis) */}
          <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-lg flex-1 max-w-[360px]">
            <span className="text-gray-300 font-bold shrink-0">Playback</span>
            {historicalSnapshots.length > 0 ? (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleTogglePlayback}
                  className={`p-1.5 rounded-full transition-all shrink-0 border ${playbackMode ? 'bg-white/10 text-white border-white/20' : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'}`}
                >
                  {playbackMode ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={maxIndex}
                  value={playbackMode ? playbackIndex : maxIndex}
                  onChange={handlePlaybackChange}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                />

                <button
                  onClick={() => setPlaybackMode(false)}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold shrink-0 uppercase tracking-widest border ${!playbackMode ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:text-white'}`}
                >
                  {!playbackMode ? 'LIVE' : 'SYNC'}
                </button>
              </div>
            ) : (
              <span className="text-[9px] text-gray-500 font-bold">AWAITING SNAPSHOTS...</span>
            )}
          </div>

          {/* Center Section: View Navigation Tabs */}
          <div className="flex bg-black/60 border border-white/10 p-1.5 rounded-lg gap-1.5 shrink-0">
            {['2D Map', '3D Twin', 'Scenarios', 'Timeline', 'Compare', 'Analytics'].map(view => {
              const isActive = activeView === view
              return (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3.5 py-1.5 rounded-md transition-all border ${isActive ? 'bg-white/10 text-white font-bold border-white/20' : 'border-transparent text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                >
                  {view}
                </button>
              )
            })}
          </div>

          {/* Right Section: Keyboard Simulator Controls */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-lg">
            <span className="text-gray-400 font-bold mr-2">Simulate</span>
            <button
              onClick={() => triggerIncident('Gate 3 Overcrowding')}
              className="flex items-center gap-1.5 hover:text-white hover:bg-white/10 transition-colors px-2.5 py-1 rounded-md border border-white/20 bg-white/5"
              title="Trigger Gate 3 Overcrowding [Key 1]"
            >
              <span className="text-accent font-bold">[1]</span>
              <span className="font-semibold text-gray-300">Gate 3</span>
            </button>
            <button
              onClick={() => triggerIncident('Section 112 Medical Event')}
              className="flex items-center gap-1.5 hover:text-white hover:bg-white/10 transition-colors px-2.5 py-1 rounded-md border border-white/20 bg-white/5"
              title="Trigger Medical Event [Key 2]"
            >
              <span className="text-accent font-bold">[2]</span>
              <span className="font-semibold text-gray-300">Medical</span>
            </button>
            <button
              onClick={() => triggerIncident('Concourse North Fire Alarm')}
              className="flex items-center gap-1.5 hover:text-white hover:bg-white/10 transition-colors px-2.5 py-1 rounded-md border border-white/20 bg-white/5"
              title="Trigger Fire Alarm [Key 3]"
            >
              <span className="text-accent font-bold">[3]</span>
              <span className="font-semibold text-gray-300">Fire</span>
            </button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors px-2.5 py-1 rounded-md border border-red-500/40 hover:border-red-500/80 bg-red-500/10 hover:bg-red-500/20 font-bold"
              title="Reset Simulation [Key 0]"
            >
              <span className="text-red-500/80 font-bold">[0]</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
)
