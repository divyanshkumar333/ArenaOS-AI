'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Sparkles, ContactShadows, Environment, useGLTF, CameraControls, Html, shaderMaterial, QuadraticBezierLine, Text, CameraShake } from '@react-three/drei'
import { Play, Pause, Flame, RotateCcw, Compass, RotateCw, ZoomIn, ZoomOut, RefreshCw, Layers, Brain } from 'lucide-react'
import { EffectComposer, Bloom, Vignette, HueSaturation, Glitch, Scanline, ChromaticAberration, DepthOfField } from '@react-three/postprocessing'
import { useZoneStore, Zone } from '@/store/useZoneStore'
import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import type CameraControlsImpl from 'camera-controls'
import { DroneEntity } from '@/components/DroneEntity'
import { MedicalUnit } from '@/components/MedicalUnit'
import { SecurityUnit } from '@/components/SecurityUnit'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, BarChart3, XCircle } from 'lucide-react'
import { CrowdSystem } from '@/components/CrowdSystem'
import { VehicleSystem } from './VehicleSystem'
import { CrowdForecastChart } from '@/components/CrowdForecastChart'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { TimeMachineScrubber } from '@/components/TimeMachineScrubber'
import { FireEffect } from '@/components/FireEffect'

import { PredictionsPanel } from '@/components/PredictionsPanel'
const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  "zone_1": [180, 5, 0],    // Gate 3 (East Entrance)
  "zone_2": [-140, 15, 0],  // Section 112 (West Seating)
  "zone_3": [0, 5, -145],   // Concourse North (North Entrance)
  "zone_4": [-150, 25, 0],  // VIP Lounge (West Upper)
  "zone_5": [0, 5, 145],    // Gate 1 (South Entrance)
  "zone_6": [140, 15, 0],   // Section 115 (East Seating)
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
  const endPos: [number, number, number] = [0, 0, 145] // Nearest Exit (South Gate)

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

function GateModel({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }: { position: [number, number, number], rotation?: [number, number, number], scale?: [number, number, number] }) {
  // A futuristic "neon banana" themed gate structure
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Structural Arch */}
      <mesh position={[0, 9, 0]}>
        <boxGeometry args={[18, 18, 3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Hollow center for people to walk through */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[12, 12, 3.1]} />
        <meshBasicMaterial color="#000000" colorWrite={false} depthWrite={true} />
      </mesh>

      {/* Glowing Neon Banana Accents (Inner Ring) */}
      <mesh position={[-6.25, 6, 0]}>
        <boxGeometry args={[0.5, 12, 3.2]} />
        <meshBasicMaterial color="#ffe135" toneMapped={false} />
      </mesh>
      <mesh position={[6.25, 6, 0]}>
        <boxGeometry args={[0.5, 12, 3.2]} />
        <meshBasicMaterial color="#ffe135" toneMapped={false} />
      </mesh>
      <mesh position={[0, 12.25, 0]}>
        <boxGeometry args={[13, 0.5, 3.2]} />
        <meshBasicMaterial color="#ffe135" toneMapped={false} />
      </mesh>

      {/* Glass Turnstile Dividers */}
      <mesh position={[-3, 3, 0]}>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} roughness={0} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} roughness={0} />
      </mesh>
      <mesh position={[3, 3, 0]}>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} roughness={0} />
      </mesh>

      {/* Holographic Signage above */}
      <mesh position={[0, 15, 1.6]}>
        <planeGeometry args={[10, 2.5]} />
        <meshBasicMaterial color="#000000" opacity={0.8} transparent />
      </mesh>
      <Text position={[0, 15, 1.7]} fontSize={1.5} color="#ffe135" anchorX="center" anchorY="middle">
        GATE 3
      </Text>
      <Text position={[0, 14, 1.7]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
        SECURITY SCAN ACTIVE
      </Text>
    </group>
  )
}

function StadiumModel({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF('/models/modern_stadium_optimized.glb')

  const ref = useRef<THREE.Group>(null)

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
  return <primitive ref={ref} object={scene} scale={0.06} position={[-78, -2, 124]} />
}

function SunLighting({ isMobile }: { isMobile: boolean }) {
  const offset = useZoneStore(state => state.predictiveTimeOffset)
  const sunRef = useRef<THREE.DirectionalLight>(null)

  useFrame((state, delta) => {
    if (sunRef.current) {
      // Base time is roughly afternoon.
      // offset is 0 to 60 mins. Let's make 60 mins equal a 60 degree rotation!
      const targetAngle = -Math.PI / 4 - (offset / 60) * (Math.PI / 3)
      sunRef.current.position.x = THREE.MathUtils.lerp(sunRef.current.position.x, Math.cos(targetAngle) * 50, delta * 2)
      sunRef.current.position.y = THREE.MathUtils.lerp(sunRef.current.position.y, Math.sin(targetAngle) * 50 + 10, delta * 2)
      sunRef.current.position.z = THREE.MathUtils.lerp(sunRef.current.position.z, Math.sin(targetAngle) * 20, delta * 2)

      // Color shifts to orange/red at sunset
      const color = new THREE.Color()
      color.lerpColors(new THREE.Color('#fffaf0'), new THREE.Color('#ff7b00'), offset / 60)
      sunRef.current.color.copy(color)
      sunRef.current.intensity = 1.1 - (offset / 60) * 0.5
    }
  })

  return (
    <directionalLight
      ref={sunRef}
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
  )
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
 * Predictive AI Confidence Rings
 */
function ConfidenceRings() {
  const predictions = useZoneStore(state => state.predictions)
  const offset = useZoneStore(state => state.predictiveTimeOffset)

  return (
    <>
      {offset > 0 && predictions.filter(p => !p.resolved).map(p => {
        const pos = ZONE_POSITIONS[p.zone_id]
        if (!pos) return null
        return <ConfidenceRing key={p.id} pos={pos} severity={p.severity} />
      })}
    </>
  )
}

function ConfidenceRing({ pos, severity }: { pos: number[], severity: string }) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.getElapsedTime()
      const scale = 1.0 + (t * 0.8) % 2.0
      ringRef.current.scale.set(scale, scale, 1)
      if (ringRef.current.material) {
        (ringRef.current.material as any).opacity = (1.0 - scale / 2.0) * 0.6
      }
    }
  })

  const color = severity === 'critical' ? '#ef4444' : '#eab308'

  return (
    <mesh ref={ringRef} position={[pos[0], pos[1] + 1.2, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[25, 26.5, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
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
    <Html position={[0, 48, 0]} center style={{ pointerEvents: 'none' }}>
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
  const cctvTakeover = useZoneStore(state => state.cctvTakeover)
  const demoStage = useZoneStore(state => state.demoStage)
  
  // Persistent vectors for cinematic math to avoid garbage collection
  const dPos = useMemo(() => new THREE.Vector3(), [])
  const dTarget = useMemo(() => new THREE.Vector3(), [])
  const toTarget = useMemo(() => new THREE.Vector3(), [])
  const idealCameraPos = useMemo(() => new THREE.Vector3(), [])
  const offset = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!controlsRef.current) return

    const t = state.clock.getElapsedTime()
    const store = useZoneStore.getState()
    const dronePos = store.primaryDronePosition
    const droneTarget = store.primaryDroneTarget

    // Cinematic Drone Follow Mode (Stage 3)
    if (cctvTakeover === 'CAM-01' && demoStage === 3 && dronePos && droneTarget) {
      dPos.set(dronePos[0], dronePos[1], dronePos[2])
      dTarget.set(droneTarget[0], droneTarget[1], droneTarget[2])
      
      toTarget.copy(dTarget).sub(dPos).normalize()
      const bank = Math.sin(t * 1.5) * 4 // Slight banking
      
      // Rule of thirds framing: Behind, above, and off-center
      offset.set(25, 20 + bank, 0)
      
      idealCameraPos.copy(dPos)
        .addScaledVector(toTarget, -50)
        .add(offset)

      // Very fast smoothTime for tight tracking without robotics
      controlsRef.current.smoothTime = 0.5
      controlsRef.current.setLookAt(
        idealCameraPos.x, idealCameraPos.y, idealCameraPos.z,
        dTarget.x, dTarget.y - 5, dTarget.z,
        true
      )
      return
    }

    if (controlsRef.current.active) return

    // Background cinematic movement
    if (isOrbiting) {
      if (demoStage === 2) {
        // Stage 2 - Massive scale orbit & gentle parallax
        controlsRef.current.azimuthAngle += delta * 0.02
        controlsRef.current.polarAngle += Math.sin(t * 0.1) * 0.0001
      } else if (!activeIncident && demoStage === 0) {
        // Standard idle sway
        controlsRef.current.azimuthAngle += Math.sin(t * 0.15) * 0.0006
        controlsRef.current.polarAngle += Math.cos(t * 0.22) * 0.0003
      } else if (activeIncident && !cctvTakeover) {
        // Tension effect during un-scripted incidents
        controlsRef.current.azimuthAngle += Math.sin(t * 1.2) * 0.0003
        controlsRef.current.polarAngle += Math.cos(t * 1.8) * 0.00015
      }
    }
  })

  useEffect(() => {
    if (!controlsRef.current) return

    if (demoStage > 0) {
      if (demoStage === 1) {
        // Stage 1 - Boot: High above, descend through clouds, reveal gradually
        controlsRef.current.smoothTime = 0
        controlsRef.current.setLookAt(0, 1000, 0, 0, 0, 0, false)
        setTimeout(() => {
          controlsRef.current.smoothTime = 12.0 // Very slow cinematic descent
          controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
        }, 100)
      } else if (demoStage === 2) {
        // Stage 2 - Live Operations: Settle into slow orbit
        controlsRef.current.smoothTime = 5.0
        controlsRef.current.setLookAt(420, 180, 420, 0, -20, 0, true)
      } else if (demoStage === 3) {
        // Stage 3 - Drone Launch: Rotate toward affected gate before drone takes over
        if (!cctvTakeover) {
          controlsRef.current.smoothTime = 4.0
          controlsRef.current.setLookAt(350, 150, 150, 210, 5, 0, true)
        }
      } else if (demoStage === 4) {
        // Stage 4 - Investigation: Section 112 medical. Dolly-in slowly.
        controlsRef.current.smoothTime = 4.0 
        controlsRef.current.setLookAt(-80, 50, 60, -140, 10, 0, false)
        setTimeout(() => {
          controlsRef.current.smoothTime = 25.0 // Extremely slow dolly-in holding the shot
          controlsRef.current.setLookAt(-40, 20, 20, -140, 10, 0, true)
        }, 500)
      } else if (demoStage === 5) {
        // Stage 5 - Suspicious Package: Low height tracking for tension
        controlsRef.current.smoothTime = 5.0
        controlsRef.current.setLookAt(60, 12, -50, 0, 5, -155, false)
        setTimeout(() => {
          controlsRef.current.smoothTime = 30.0
          controlsRef.current.setLookAt(-20, 12, -80, 0, 5, -155, true)
        }, 500)
      } else if (demoStage === 6) {
        // Stage 6 - Resolution / Weather: Slowly rise, reveal stadium recovering
        controlsRef.current.smoothTime = 8.0
        controlsRef.current.setLookAt(280, 250, 280, 0, 0, 0, true)
      } else if (demoStage === 7) {
        // Stage 7 - Power Fluctuation: Tense, slightly off-axis
        controlsRef.current.smoothTime = 2.5
        controlsRef.current.setLookAt(200, 120, 280, -60, -10, -60, true)
      } else if (demoStage === 8) {
        // Final Scene: Very slow crane pull-back. Entire stadium visible.
        controlsRef.current.smoothTime = 15.0
        controlsRef.current.setLookAt(500, 400, 500, 0, 0, 0, true)
      } else if (demoStage === 9) {
        controlsRef.current.smoothTime = 4.0
        controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
      }
      return
    }

    if (cctvTakeover) {
      controlsRef.current.smoothTime = 1.2
      if (cctvTakeover === 'CAM-01') {
        controlsRef.current.setLookAt(270, 25, 40, 210, 5, 0, true)
      } else if (cctvTakeover === 'CAM-02') {
        controlsRef.current.setLookAt(-60, 15, 0, -140, 10, 0, true)
      } else if (cctvTakeover === 'CAM-03') {
        controlsRef.current.setLookAt(0, 15, -110, 0, 5, -155, true)
      } else {
        controlsRef.current.setLookAt(-80, 40, 0, -150, 30, 0, true)
      }
      return
    }

    if (activeIncident) {
      const zones = useZoneStore.getState().zones
      const zone = zones.find(z => z.id === activeIncident.zone_id)
      if (!zone) return
      const pos = ZONE_POSITIONS[zone.id] || [0, 0, 0]

      controlsRef.current.smoothTime = 1.5
      controlsRef.current.setLookAt(300, 240, 300, 0, 0, 0, true)
      
      const t1 = setTimeout(() => {
        if (!controlsRef.current) return
        controlsRef.current.smoothTime = 2.5 // Smooth ease-in
        if (activeIncident.zone_id === 'zone_1') {
          controlsRef.current.setLookAt(290, 60, 80, 210, 5, 0, true)
        } else if (activeIncident.zone_id === 'zone_2') {
          controlsRef.current.setLookAt(-40, 60, 80, -140, 10, 0, true)
        } else if (activeIncident.zone_id === 'zone_3') {
          controlsRef.current.setLookAt(60, 60, -70, 0, 5, -155, true)
        } else {
          controlsRef.current.setLookAt(pos[0] + 80, pos[1] + 60, pos[2] + 80, pos[0], pos[1], pos[2], true)
        }
      }, 1500)
      return () => clearTimeout(t1)
    } else {
      controlsRef.current.smoothTime = 1.5
      controlsRef.current.setLookAt(250, 180, 250, 0, 0, 0, true)
    }
  }, [activeIncident, cctvTakeover, controlsRef, demoStage])

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
  const predictiveTimeOffset = useZoneStore(state => state.predictiveTimeOffset)
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
    medical: true,
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
        drones: true,
        medical: true
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
      controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (controlsRef.current) {
      controlsRef.current.dolly(direction === 'in' ? 50 : -50, true)
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
        controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
      }
    } else if (activeView === 'Compare') {
      setShowDecisionMatrix(true)
      setActiveView('3D Twin')
    } else if (activeView === 'Timeline') {
      setPlaybackMode(!playbackMode)
      setActiveView('3D Twin')
    }
  }, [activeView, setShowDecisionMatrix, setPlaybackMode, playbackMode])

  const demoStage = useZoneStore(state => state.demoStage)

  useEffect(() => {
    if (!controlsRef.current) return
    
    // Smooth cinematic pan based on demo stage
    switch (demoStage) {
      case 1: // Boot
        controlsRef.current.smoothTime = 2.0
        controlsRef.current.setLookAt(500, 300, 500, 0, 0, 0, true)
        break
      case 2: // Normal operations
        controlsRef.current.smoothTime = 4.0 // Slow elegant pan
        controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
        break
      case 3: // Gate 3 detect
        controlsRef.current.smoothTime = 2.5
        controlsRef.current.setLookAt(
          ZONE_POSITIONS['zone_1'][0] + 80, 40, ZONE_POSITIONS['zone_1'][2] + 80, 
          ZONE_POSITIONS['zone_1'][0], 0, ZONE_POSITIONS['zone_1'][2], true
        )
        break
      case 4: // Medical Emergency 
        controlsRef.current.smoothTime = 2.5
        controlsRef.current.setLookAt(
          ZONE_POSITIONS['zone_2'][0] - 80, 60, ZONE_POSITIONS['zone_2'][2] - 80, 
          ZONE_POSITIONS['zone_2'][0], 0, ZONE_POSITIONS['zone_2'][2], true
        )
        break
      case 5: // Suspicious Package
        controlsRef.current.smoothTime = 2.0
        controlsRef.current.setLookAt(
          ZONE_POSITIONS['zone_3'][0], 90, ZONE_POSITIONS['zone_3'][2] + 100, 
          ZONE_POSITIONS['zone_3'][0], 0, ZONE_POSITIONS['zone_3'][2], true
        )
        break
      case 6: // Weather 
        controlsRef.current.smoothTime = 3.0
        controlsRef.current.setLookAt(100, 380, 100, 0, 0, 0, true)
        break
      case 7: // Power Outage
        controlsRef.current.smoothTime = 1.0 // Snappy cut
        controlsRef.current.setLookAt(-200, 150, -200, 0, 0, 0, true)
        break
      case 8: // Exec Summary
        controlsRef.current.smoothTime = 3.0
        controlsRef.current.setLookAt(350, 250, 350, 0, 0, 0, true)
        break
    }
  }, [demoStage])

  return (
    <div className="absolute inset-0 bg-[#050510] select-none">
      {/* Vanta CLOUDS background */}
      <div ref={vantaRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Canvas */}
      <Canvas dpr={isMobile ? [1, 1] : [1, 2]} camera={{ position: [350, 250, 350], fov: 45 }} shadows={!isMobile} gl={{ alpha: true, antialias: !isMobile }} style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <fog attach="fog" args={[systemStatus === 'CRITICAL' ? '#200000' : '#050510', 800, 1800]} />

        {/* Cinematic ambient and fill lights */}
        <ambientLight intensity={systemStatus === 'CRITICAL' ? 0.5 : 0.3} color={systemStatus === 'CRITICAL' ? '#ff453a' : '#4fd1c5'} />
        <hemisphereLight groundColor="#000000" color={systemStatus === 'CRITICAL' ? '#ef4444' : '#3b82f6'} intensity={systemStatus === 'CRITICAL' ? 0.5 : 0.35} />

        <SunLighting isMobile={isMobile} />

        {/* Cinematic Rim Lights */}
        {/* Add Crowd and Vehicle Simulations */}
        <CrowdSystem />
        <VehicleSystem />
        <directionalLight position={[-40, 20, -40]} intensity={0.6} color={systemStatus === 'CRITICAL' ? '#ff0000' : '#3b82f6'} />
        <directionalLight position={[40, 15, -40]} intensity={0.4} color={systemStatus === 'CRITICAL' ? '#ff453a' : '#4fd1c5'} />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.15} />

          <StadiumModel isMobile={isMobile} />

          {!isMobile && <ContactShadows resolution={256} scale={80} blur={2.0} opacity={0.6} far={8} color="#000000" />}

          {/* Grid disabled for realistic stadium */}

          {/* Gate 3 Structure */}
          <GateModel position={[ZONE_POSITIONS['zone_1'][0] + 30, ZONE_POSITIONS['zone_1'][1], ZONE_POSITIONS['zone_1'][2]]} rotation={[0, Math.PI / 2, 0]} scale={[2.5, 2.5, 2.5]} />

          {/* Exterior Ground Pad (Localized specifically for Gate 3 Crowd) */}
          <mesh position={[ZONE_POSITIONS['zone_1'][0] + 30, -0.4, ZONE_POSITIONS['zone_1'][2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[160, 160]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* Fire Effect for zone_3 */}
          <FireEffect />

          {layers.heatmap && <HeatmapFloor />}
          <EvacuationRoute />
          {layers.drones && [0, 1, 2, 3].map(i => <DroneEntity key={i} index={i} />)}
          {layers.medical && [0, 1].map(i => <MedicalUnit key={i} index={i} />)}
          {layers.medical && [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 180;
            return <SecurityUnit key={i} index={i} initialPosition={[radius * Math.cos(angle), 0, radius * Math.sin(angle)]} />
          })}

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
          <ConfidenceRings />
          <VirtualScoreboard />

          <ZoneMarkers layers={layers} onClick={handleMarkerClick} />
          <SceneController controlsRef={controlsRef} isOrbiting={isOrbiting} />
          {demoStage === 7 && <CameraShake maxPitch={0.01} maxRoll={0.01} maxYaw={0.01} pitchFrequency={1.5} rollFrequency={1.5} yawFrequency={1.5} />}
        </Suspense>

        {!isMobile && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom luminanceThreshold={0.97} intensity={0.25} mipmapBlur={false} />
            <Vignette offset={0.15} darkness={0.8} />
            {playbackMode ? (
              <>
                <HueSaturation saturation={-0.6} hue={-0.1} />
                <Scanline density={1.5} opacity={0.3} />
                <Glitch delay={[1.5, 3.5] as any} duration={[0.1, 0.3] as any} strength={[0.01, 0.05] as any} active={true} ratio={0.85} />
              </>
            ) : <></>}
            {predictiveTimeOffset > 0 ? (
              <>
                {/* Premium Temporal Grid effect (cyan shifted, scanlines) */}
                <HueSaturation saturation={-0.2} hue={0.3} />
                <Scanline density={2.0} opacity={0.15} />
              </>
            ) : <></>}
          </EffectComposer>
        )}
      </Canvas>



      {/* HUD overlay for counts */}
      <div className="absolute bottom-4 left-[272px] z-[80] bg-[rgba(0,0,0,0.5)] text-white px-2 py-1 rounded hidden" style={{ fontSize: '10px' }}>
        <div id="stats">
          {/* Placeholder – will be filled by CrowdSystem via window object */}
        </div>
      </div>
      {!isMobile && (
        <div className="absolute top-24 right-[400px] z-[80] flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex gap-2">
            {/* AI Predictions Toggle Button */}
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className={`flex items-center space-x-2 px-3 py-1.5 bg-[rgba(10,10,12,0.4)] backdrop-blur-2xl border rounded-xl text-gray-300 shadow-2xl hover:text-white transition-colors ${showPredictions ? 'border-accent/40 text-accent font-semibold' : 'border-white/[0.04]'}`}
            >
              <Brain className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px]">Predictions</span>
            </button>

            {/* Layers Toggle Button */}
            <button
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 bg-[rgba(10,10,12,0.4)] backdrop-blur-2xl border rounded-xl text-gray-300 shadow-2xl hover:text-white transition-colors ${isLayersOpen ? 'border-accent/40 text-accent font-semibold' : 'border-white/[0.04]'}`}
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
      {!isMobile && (
        <div className="absolute bottom-2 left-[632px] right-[408px] z-[80] pointer-events-none flex flex-col items-center gap-5">
          <TimeMachineScrubber />
          <OperationsConsole activeView={activeView} setActiveView={setActiveView} />
        </div>
      )}
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
      <div className="w-full max-w-2xl bg-[rgba(10,10,12,0.65)] backdrop-blur-3xl border border-white/[0.08] p-1.5 rounded-[24px] shadow-2xl flex items-center justify-between pointer-events-auto">
        <div className="grid grid-cols-6 w-full gap-2 text-center">
          {['3D Twin', '2D Map', 'Timeline', 'Scenarios', 'Analytics', 'Compare'].map(view => {
            const isActive = activeView === view
            return (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`py-2 px-3 text-[11px] font-mono tracking-wider uppercase rounded-xl transition-all border duration-300 min-w-0 truncate select-none ${isActive
                    ? 'bg-accent/20 border-accent/50 text-accent font-bold shadow-[0_0_15px_rgba(10,132,255,0.25)]'
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10'
                  }`}
              >
                {view}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)
