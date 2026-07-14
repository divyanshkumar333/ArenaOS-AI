import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh } from 'three';
import { Html } from '@react-three/drei';
import { useZoneStore } from '@/store/useZoneStore';

interface DroneEntityProps {
  initialPosition?: [number, number, number];
}

export const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  "zone_1": [200, 2, 0],    // Gate 3 (East)
  "zone_2": [-100, 15, 0],  // Section 112 (West Seating)
  "zone_3": [0, 5, -240],   // Concourse North
  "zone_4": [-120, 35, 0],  // VIP Lounge (West Upper)
  "zone_5": [0, 2, 240],    // Gate 1 (South)
  "zone_6": [100, 15, 0],   // Section 115 (East Seating)
};

/**
 * 1. DRONE MODEL
 * High-tech sleek model with spinning rotors and scanning beam.
 */
function DroneModel({ isScanning }: { isScanning: boolean }) {
  const rotorRef1 = useRef<Mesh>(null);
  const rotorRef2 = useRef<Mesh>(null);
  const rotorRef3 = useRef<Mesh>(null);
  const rotorRef4 = useRef<Mesh>(null);
  const scannerRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const spinSpeed = isScanning ? 25 : 12;

    if (rotorRef1.current) rotorRef1.current.rotation.y = t * spinSpeed;
    if (rotorRef2.current) rotorRef2.current.rotation.y = -t * spinSpeed;
    if (rotorRef3.current) rotorRef3.current.rotation.y = t * spinSpeed;
    if (rotorRef4.current) rotorRef4.current.rotation.y = -t * spinSpeed;

    if (scannerRef.current && isScanning) {
      scannerRef.current.scale.x = 1 + Math.sin(t * 8) * 0.1;
      scannerRef.current.scale.z = 1 + Math.sin(t * 8) * 0.1;
    }
  });

  return (
    <group>
      {/* Central capsule core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Glowing visor/sensor ring */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2.05, 2.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#0a84ff" 
          emissive="#0a84ff" 
          emissiveIntensity={isScanning ? 3.0 : 1.0} 
          roughness={0.2} 
        />
      </mesh>

      {/* Slim carbon fiber arms */}
      {[
        [45, [2, 0, 2]],
        [135, [-2, 0, 2]],
        [225, [-2, 0, -2]],
        [315, [2, 0, -2]]
      ].map(([angle, pos], i) => (
        <group key={i} rotation={[0, (angle as number) * Math.PI / 180, 0]}>
          <mesh position={[2, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[4, 0.25, 0.4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Rotors & Spinning Blades */}
      {[
        [2.8, 0.4, 2.8],
        [-2.8, 0.4, 2.8],
        [-2.8, 0.4, -2.8],
        [2.8, 0.4, -2.8]
      ].map((pos, i) => {
        const refs = [rotorRef1, rotorRef2, rotorRef3, rotorRef4];
        return (
          <group key={i} position={pos as [number, number, number]}>
            {/* Rotor mount */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {/* Rotor blades */}
            <mesh ref={refs[i]} position={[0, 0.4, 0]}>
              <boxGeometry args={[3, 0.05, 0.25]} />
              <meshStandardMaterial color="#f8fafc" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Animated Scanning Spotlight Cone */}
      {isScanning && (
        <mesh ref={scannerRef} position={[0, -22, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[18, 44, 16, 1, true]} />
          <meshBasicMaterial 
            color="#0a84ff" 
            transparent 
            opacity={0.15} 
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * 2. TELEMETRY OVERLAY
 * Renders HTML telemetry tracking the drone.
 */
function TelemetryOverlay({ isDispatching }: { isDispatching: boolean }) {
  if (!isDispatching) return null;
  return (
    <Html position={[0, 8, 0]} center>
      <div className="bg-[rgba(10,10,12,0.85)] border border-accent/30 p-2.5 rounded-lg text-[9px] font-mono text-accent uppercase whitespace-nowrap shadow-2xl backdrop-blur-xl flex flex-col gap-0.5 min-w-[120px]">
        <div className="flex items-center gap-1.5 mb-1 justify-between">
          <span className="font-bold tracking-wider text-white">RECON_DRONE_01</span>
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
        </div>
        <div className="flex justify-between"><span className="text-gray-500">STATUS:</span> <span className="font-bold">SCANNING</span></div>
        <div className="flex justify-between"><span className="text-gray-500">ALTITUDE:</span> <span>15.0m</span></div>
        <div className="flex justify-between"><span className="text-gray-500">BATTERY:</span> <span className="text-emerald-400">92%</span></div>
      </div>
    </Html>
  );
}

export function DroneEntity({ initialPosition = [0, 100, 0] }: DroneEntityProps) {
  const groupRef = useRef<Group>(null);
  const activeIncident = useZoneStore(state => state.activeIncident);
  
  // Drone flies if there is an active incident.
  const isDispatching = !!activeIncident;
  
  const targetPos = React.useMemo(() => new Vector3(), []);
  if (activeIncident && ZONE_POSITIONS[activeIncident.zone_id]) {
    const p = ZONE_POSITIONS[activeIncident.zone_id];
    // Position drone directly above the active incident zone
    targetPos.set(p[0], p[1] + 25, p[2]);
  }

  const currentPos = useRef(new Vector3(...initialPosition));
  const idlePos = React.useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isDispatching) {
      // Fly towards anomaly
      currentPos.current.lerp(targetPos, delta * 2.0);
    } else {
      // Return to idle patrol circle
      const t = state.clock.getElapsedTime();
      idlePos.set(Math.cos(t * 0.1) * 150, 70, Math.sin(t * 0.1) * 150);
      currentPos.current.lerp(idlePos, delta * 0.8);
    }
    
    groupRef.current.position.copy(currentPos.current);
    
    // Rotate to face travel direction
    if (isDispatching) {
      const lookTarget = targetPos.clone();
      lookTarget.y = groupRef.current.position.y; // Keep level look
      groupRef.current.lookAt(lookTarget);
    } else {
      const lookTarget = currentPos.current.clone().add(
        new Vector3(-Math.sin(state.clock.getElapsedTime() * 0.1), 0, Math.cos(state.clock.getElapsedTime() * 0.1))
      );
      groupRef.current.lookAt(lookTarget);
    }
  });

  return (
    <group ref={groupRef}>
      <DroneModel isScanning={isDispatching} />
      <TelemetryOverlay isDispatching={isDispatching} />
    </group>
  );
}
