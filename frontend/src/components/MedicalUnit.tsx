import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh, MathUtils, AdditiveBlending, DoubleSide, Material } from 'three';
import { Html } from '@react-three/drei';
import { useZoneStore } from '@/store/useZoneStore';

interface MedicalUnitProps {
  initialPosition?: [number, number, number];
  index?: number;
}

export const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  "zone_1": [180, 5, 0],    // Gate 3 (East Entrance)
  "zone_2": [-140, 15, 0],  // Section 112 (West Seating)
  "zone_3": [0, 5, -145],   // Concourse North (North Entrance)
  "zone_4": [-150, 25, 0],  // VIP Lounge (West Upper)
  "zone_5": [0, 5, 145],    // Gate 1 (South Entrance)
  "zone_6": [140, 15, 0],   // Section 115 (East Seating)
};

/**
 * Futuristic Autonomous Medical Drone Model for Hackathon
 */
function MedicalDroneModel({ isDispatching, activeZoneId }: { isDispatching: boolean, activeZoneId?: string }) {
  const sirenRedRef = useRef<Mesh>(null);
  const sirenBlueRef = useRef<Mesh>(null);
  const healingRingRef = useRef<Mesh>(null);
  const thrustersRef = useRef<Group>(null);
  const droneGroupRef = useRef<Group>(null);
  const scannerRef = useRef<Group>(null);
  const isMedicalEvent = isDispatching && activeZoneId === 'zone_2';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (scannerRef.current && isMedicalEvent) {
       scannerRef.current.rotation.x = Math.sin(t * 4) * 0.4;
    }

    if (droneGroupRef.current) {
      // Hovering bob animation
      droneGroupRef.current.position.y = isDispatching 
        ? 1.5 + Math.sin(t * 4) * 0.2 // Higher and faster when dispatched
        : 0.8 + Math.sin(t * 2) * 0.1; // Low idle hover
      
      // Tilt forward slightly when moving
      droneGroupRef.current.rotation.x = isDispatching 
        ? MathUtils.lerp(droneGroupRef.current.rotation.x, -0.15, 0.1) 
        : MathUtils.lerp(droneGroupRef.current.rotation.x, 0, 0.1);
    }

    // Flashing emergency lights (Red/Blue strobe effect)
    if (isDispatching) {
      if (sirenRedRef.current && sirenBlueRef.current) {
        const strobe = Math.sin(t * 20);
        (sirenRedRef.current.material as any).opacity = strobe > 0 ? 0.9 : 0.1;
        (sirenBlueRef.current.material as any).opacity = strobe < 0 ? 0.9 : 0.1;
      }
      
      // Spin thruster cores
      if (thrustersRef.current) {
        thrustersRef.current.children.forEach(thruster => {
          thruster.rotation.y += 0.3;
          // Pulse thruster glow
          const glowMesh = thruster.children[1] as Mesh;
          if (glowMesh) {
             (glowMesh.material as any).opacity = 0.6 + Math.sin(t * 15) * 0.4;
          }
        });
      }

      // Pulsing healing ring when dispatched
      if (healingRingRef.current) {
        healingRingRef.current.scale.setScalar(1 + (t * 2) % 3);
        (healingRingRef.current.material as any).opacity = Math.max(0, 1 - ((t * 2) % 3) / 3) * 0.6;
      }
    } else {
      if (sirenRedRef.current && sirenBlueRef.current) {
        (sirenRedRef.current.material as any).opacity = 0.1;
        (sirenBlueRef.current.material as any).opacity = 0.1;
      }
      if (healingRingRef.current) {
        (healingRingRef.current.material as any).opacity = 0;
      }
      if (thrustersRef.current) {
        thrustersRef.current.children.forEach(thruster => {
          thruster.rotation.y += 0.05;
          const glowMesh = thruster.children[1] as Mesh;
          if (glowMesh) {
             (glowMesh.material as any).opacity = 0.3;
          }
        });
      }
    }
  });

  return (
    <group ref={droneGroupRef} scale={1.2}>
      {/* Main Hull (Sleek, futuristic octagon) */}
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[2.8, 2.2, 1.2, 4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Dark Underbelly Sensor Array */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[1.5, 1.0, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.8} />
      </mesh>

      {/* Futuristic Glass Dome */}
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[1.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>

      {/* Red Cross Decal on top of dome */}
      <group position={[0, 3.8, 0]}>
        <mesh><boxGeometry args={[1.4, 0.1, 0.3]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.3, 0.1, 1.4]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>
      
      {/* Red Cross Side Decals */}
      <group position={[2.1, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh><boxGeometry args={[1.0, 0.2, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.2, 1.0, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>
      <group position={[-2.1, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh><boxGeometry args={[1.0, 0.2, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.2, 1.0, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>

      {/* Emergency Sirens */}
      <mesh ref={sirenRedRef} position={[-1.2, 3.0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.6]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.1} blending={AdditiveBlending} />
      </mesh>
      <mesh ref={sirenBlueRef} position={[1.2, 3.0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.6]} />
        <meshBasicMaterial color="#0a84ff" transparent opacity={0.1} blending={AdditiveBlending} />
      </mesh>

      {/* Hover Thrusters */}
      <group ref={thrustersRef}>
        {[
          [2.2, 1.6, 2.2],
          [-2.2, 1.6, 2.2],
          [2.2, 1.6, -2.2],
          [-2.2, 1.6, -2.2],
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            {/* Thruster casing */}
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.7} />
            </mesh>
            {/* Thruster glow core */}
            <mesh position={[0, -0.31, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} blending={AdditiveBlending} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Glowing Energy Ring */}
      <mesh ref={healingRingRef} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.0, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} blending={AdditiveBlending} side={DoubleSide} />
      </mesh>

      {/* Holographic Scanner Beam for Medical Event */}
      {isMedicalEvent && (
         <group ref={scannerRef} position={[0, -0.5, 0]}>
           <mesh position={[0, -4, 0]}>
             <coneGeometry args={[2.5, 8, 32]} />
             <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
           </mesh>
         </group>
      )}
    </group>
  );
}

function TraumaScene() {
  const pulseRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (pulseRef.current) {
      const t = state.clock.getElapsedTime();
      pulseRef.current.scale.setScalar(1 + (t*3)%2);
      (pulseRef.current.material as any).opacity = Math.max(0, 1 - ((t*3)%2)/2) * 0.8;
    }
  });

  return (
    <group position={[4, -1.5, 0]}>
       {/* Holographic Privacy Tent */}
       <mesh position={[0, 2, 0]}>
         <cylinderGeometry args={[2.5, 2.5, 3.5, 16, 1, true, 0, Math.PI]} />
         <meshBasicMaterial color="#0a84ff" transparent opacity={0.15} blending={AdditiveBlending} side={DoubleSide} />
       </mesh>
       
       {/* High-tech Stretcher Base */}
       <mesh position={[0, 0.4, 0]}>
         <boxGeometry args={[1.2, 0.8, 2.8]} />
         <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
       </mesh>
       
       {/* Patient Outline/Thermal Signature */}
       <mesh position={[0, 0.9, 0]}>
         <boxGeometry args={[0.7, 0.2, 2.2]} />
         <meshBasicMaterial color="#ef4444" transparent opacity={0.8} blending={AdditiveBlending} />
       </mesh>
       
       {/* ECG Pulse ring on ground */}
       <mesh ref={pulseRef} position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <ringGeometry args={[2.0, 2.3, 32]} />
         <meshBasicMaterial color="#10b981" transparent blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
       </mesh>
    </group>
  );
}

function MedicalAmbulanceModel({ isDispatching, activeZoneId }: { isDispatching: boolean, activeZoneId?: string }) {
  const sirenRedRef = useRef<Mesh>(null);
  const sirenBlueRef = useRef<Mesh>(null);
  const healingRingRef = useRef<Mesh>(null);
  const wheelsRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (isDispatching) {
      if (sirenRedRef.current && sirenBlueRef.current) {
        const strobe = Math.sin(t * 20);
        (sirenRedRef.current.material as any).opacity = strobe > 0 ? 0.9 : 0.1;
        (sirenBlueRef.current.material as any).opacity = strobe < 0 ? 0.9 : 0.1;
      }
      
      if (wheelsRef.current) {
        wheelsRef.current.children.forEach(wheel => {
          wheel.rotation.x += 0.2;
        });
      }

      if (healingRingRef.current) {
        healingRingRef.current.scale.setScalar(1 + (t * 2) % 3);
        (healingRingRef.current.material as any).opacity = Math.max(0, 1 - ((t * 2) % 3) / 3) * 0.6;
      }
    } else {
      if (sirenRedRef.current && sirenBlueRef.current) {
        (sirenRedRef.current.material as any).opacity = 0.1;
        (sirenBlueRef.current.material as any).opacity = 0.1;
      }
      if (healingRingRef.current) {
        (healingRingRef.current.material as any).opacity = 0;
      }
    }
  });

  return (
    <group scale={1.5}>
      {/* Main Armored Chassis */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 2, 5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Dark Underbelly */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.8, 0.8, 4.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Futuristic Glass Cockpit/Sensor Dome */}
      <mesh position={[0, 2.5, 1.2]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[2.4, 0.8, 1.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>

      {/* Red Cross Decals */}
      <group position={[1.51, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh><boxGeometry args={[1.5, 0.4, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.4, 1.5, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>
      <group position={[-1.51, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh><boxGeometry args={[1.5, 0.4, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.4, 1.5, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>
      <group position={[0, 2.51, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh><boxGeometry args={[1.5, 0.4, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh><boxGeometry args={[0.4, 1.5, 0.05]} /><meshBasicMaterial color="#ef4444" /></mesh>
      </group>

      {/* Emergency Sirens */}
      <mesh ref={sirenRedRef} position={[-0.8, 2.8, -1.8]}>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.1} blending={AdditiveBlending} />
      </mesh>
      <mesh ref={sirenBlueRef} position={[0.8, 2.8, -1.8]}>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshBasicMaterial color="#0a84ff" transparent opacity={0.1} blending={AdditiveBlending} />
      </mesh>

      {/* Rugged Wheels */}
      <group ref={wheelsRef}>
        {[
          [1.8, 0.6, 1.8],
          [-1.8, 0.6, 1.8],
          [1.8, 0.6, -1.8],
          [-1.8, 0.6, -1.8],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.7, 0.7, 0.6, 16]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Holographic Healing Radius */}
      <mesh ref={healingRingRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 5, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </mesh>

      {/* Deploy Trauma Scene when responding to Section 112 Event */}
      {isDispatching && activeZoneId === 'zone_2' && <TraumaScene />}
    </group>
  );
}

/**
 * HTML Overlay for Medical Unit Status
 */
function MedicalTelemetry({ isDispatching, index }: { isDispatching: boolean, index: number }) {
  if (!isDispatching) return null;
  return (
    <Html position={[0, 10, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
      <div className="group relative cursor-pointer pointer-events-auto">
        {/* Minimized Pill */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10 hover:border-emerald-500/50 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-white/70 group-hover:text-emerald-400 transition-colors">MED_0{index + 1}</span>
        </div>
        
        {/* Expanded Hover State */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
          <div className="bg-[rgba(10,12,10,0.95)] border border-emerald-500/30 p-2 rounded-lg text-[9px] font-mono text-emerald-400 uppercase whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.2)] flex flex-col gap-0.5 min-w-[130px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
              <span className="font-bold text-white tracking-wider">MED_UNIT_0{index + 1}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">STATUS:</span> <span className="font-bold text-red-400">EN ROUTE</span></div>
            <div className="flex justify-between"><span className="text-gray-500">PAYLOAD:</span> <span>TRAUMA_KIT</span></div>
            <div className="flex justify-between"><span className="text-gray-500">ETA:</span> <span>00:14s</span></div>
          </div>
        </div>
      </div>
    </Html>
  );
}

export function MedicalUnit({ initialPosition = [-150, 0, 150], index = 0 }: MedicalUnitProps) {
  const activeIncident = useZoneStore(state => state.activeIncident);
  const groupRef = useRef<Group>(null);
  
  // Instance states
  const [isDispatching, setIsDispatching] = useState(false);
  const currentPos = useRef(new Vector3(...initialPosition));
  
  // Stagger idle positions based on index
  const angleOffset = (index * Math.PI) / 4;
  const idlePos = useMemo(() => new Vector3(
    initialPosition[0] + 15 * Math.cos(angleOffset),
    0,
    initialPosition[2] + 15 * Math.sin(angleOffset)
  ), [initialPosition, angleOffset]);

  const targetPos = useMemo(() => new Vector3(), []);
  const currentWaypointIndex = useRef(0);
  
  // Pre-allocate waypoints
  const centerPos = useMemo(() => new Vector3(0, 0, 0), []);
  const southTunnel = useMemo(() => new Vector3(0, 0, 150), []);
  const eastExterior = useMemo(() => new Vector3(240, 0, 150), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    let waypoints: Vector3[] = [];

    if (isDispatching && activeIncident) {
      if (activeIncident.zone_id === 'zone_1') {
        // Gate 3 (East Exterior)
        targetPos.set(240 + 15 * Math.cos(angleOffset), 0, 30 + 15 * Math.sin(angleOffset));
        waypoints = [
          eastExterior, // Drive along south exterior to east side
          targetPos     // Turn north to gate
        ];
      } else if (activeIncident.zone_id === 'zone_2') {
        // Section 112 (West Interior)
        targetPos.set(-110 + 15 * Math.cos(angleOffset), 0, 15 * Math.sin(angleOffset));
        waypoints = [
          southTunnel, // South tunnel
          centerPos,   // Pitch center
          targetPos
        ];
      } else if (activeIncident.zone_id === 'zone_3') {
        // Concourse North
        targetPos.set(15 * Math.cos(angleOffset), 0, -130 + 15 * Math.sin(angleOffset));
        waypoints = [
          southTunnel, // South tunnel
          centerPos,   // Pitch center
          targetPos
        ];
      } else {
        // Default generic path
        const p = ZONE_POSITIONS[activeIncident.zone_id] || [0,0,0];
        targetPos.set(p[0] + 15 * Math.cos(angleOffset), 0, p[2] + 15 * Math.sin(angleOffset));
        waypoints = [
          southTunnel,
          centerPos,
          targetPos
        ];
      }
    } else {
      // Return paths
      if (currentPos.current.x > 150) {
        // Returning from East exterior
        waypoints = [
          eastExterior,
          idlePos
        ];
      } else {
        // Returning from Interior
        waypoints = [
          centerPos,
          southTunnel,
          idlePos
        ];
      }
    }

    let currentTarget = waypoints[currentWaypointIndex.current];
    
    // Check if reached current waypoint
    if (currentTarget && currentPos.current.distanceTo(currentTarget) < 2) {
      if (currentWaypointIndex.current < waypoints.length - 1) {
        currentWaypointIndex.current++;
        currentTarget = waypoints[currentWaypointIndex.current];
      }
    }

    if (currentTarget) {
      // Move towards waypoint
      currentPos.current.lerp(currentTarget, delta * 1.5);
      
      // Face movement direction
      const direction = currentTarget.clone().sub(currentPos.current);
      if (direction.lengthSq() > 0.1) {
        const targetRotation = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotation,
          delta * 5
        );
      }
    }
    
    groupRef.current.position.copy(currentPos.current);
  });

  useEffect(() => {
    if (activeIncident && (activeIncident.severity === 'critical' || activeIncident?.zone_id === 'zone_1' || activeIncident?.zone_id === 'zone_2')) {
      setIsDispatching(true);
      currentWaypointIndex.current = 0;
    } else {
      setIsDispatching(false);
      currentWaypointIndex.current = 0;
    }
  }, [activeIncident]);

  return (
    <group ref={groupRef}>
      {index === 0 ? <MedicalDroneModel isDispatching={isDispatching} activeZoneId={activeIncident?.zone_id} /> : <MedicalAmbulanceModel isDispatching={isDispatching} activeZoneId={activeIncident?.zone_id} />}
      <MedicalTelemetry isDispatching={isDispatching} index={index} />
    </group>
  );
}
