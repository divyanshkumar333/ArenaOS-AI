import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh, MathUtils, AdditiveBlending, DoubleSide, Object3D, InstancedMesh, Material } from 'three';
import { Html } from '@react-three/drei';
import { useZoneStore } from '@/store/useZoneStore';
import { ZONE_POSITIONS } from '@/components/MedicalUnit';

interface SecurityUnitProps {
  initialPosition?: [number, number, number];
  index?: number;
}

/**
 * 1. Heavy Command Vehicle (Highly Detailed)
 */
function CommandVehicle({ isDispatching }: { isDispatching: boolean }) {
  const lightbarRef = useRef<Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightbarRef.current) {
      const strobe = Math.sin(t * (isDispatching ? 25 : 5));
      const r = lightbarRef.current.children[0] as Mesh;
      const b = lightbarRef.current.children[1] as Mesh;
      (r.material as Material).opacity = strobe > 0 ? 1.0 : 0.1;
      (b.material as Material).opacity = strobe < 0 ? 1.0 : 0.1;
    }
  });

  return (
    <group scale={1.5}>
      {/* Lower Armored Chassis */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[3.0, 1.2, 5.2]} />
        <meshStandardMaterial color="#020617" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Upper Cabin */}
      <mesh position={[0, 2.0, -0.5]}>
        <boxGeometry args={[2.8, 1.2, 3.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Front Cyber-Grille */}
      <mesh position={[0, 1.2, 2.65]}>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} />
      </mesh>

      {/* Yellow Security Decals & Neon Lines */}
      <mesh position={[1.51, 1.4, 0]}><boxGeometry args={[0.05, 0.2, 5.0]} /><meshBasicMaterial color="#facc15" /></mesh>
      <mesh position={[-1.51, 1.4, 0]}><boxGeometry args={[0.05, 0.2, 5.0]} /><meshBasicMaterial color="#facc15" /></mesh>
      <mesh position={[1.52, 1.0, 0]}><boxGeometry args={[0.02, 0.05, 4.0]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.6} blending={AdditiveBlending} /></mesh>
      <mesh position={[-1.52, 1.0, 0]}><boxGeometry args={[0.02, 0.05, 4.0]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.6} blending={AdditiveBlending} /></mesh>

      {/* Tactical Glass Windows */}
      <mesh position={[0, 2.2, 1.3]} rotation={[Math.PI / 10, 0, 0]}>
        <boxGeometry args={[2.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#000000" roughness={0.0} metalness={1.0} />
      </mesh>
      
      {/* Roof Scanner Array */}
      <mesh position={[0, 2.7, -1.0]}>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 3.0, -1.0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.4]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* Police Lightbar */}
      <group ref={lightbarRef} position={[0, 2.8, 0.5]}>
        <mesh position={[-0.8, 0, 0]}><boxGeometry args={[1.2, 0.15, 0.4]} /><meshBasicMaterial color="#ef4444" transparent blending={AdditiveBlending} /></mesh>
        <mesh position={[0.8, 0, 0]}><boxGeometry args={[1.2, 0.15, 0.4]} /><meshBasicMaterial color="#3b82f6" transparent blending={AdditiveBlending} /></mesh>
      </group>
      
      {/* Heavy Wheels */}
      {[
        [1.6, 0.5, 1.8], [-1.6, 0.5, 1.8],
        [1.6, 0.5, -1.8], [-1.6, 0.5, -1.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
          <meshStandardMaterial color="#050505" roughness={1.0} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 2. Patrol Hover Bike (Highly Detailed)
 */
function PatrolHoverBike({ isDispatching }: { isDispatching: boolean }) {
  const bikeRef = useRef<Group>(null);
  const thrusterRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bikeRef.current) {
      bikeRef.current.position.y = 0.5 + Math.sin(t * 5) * 0.2;
      bikeRef.current.rotation.z = Math.sin(t * 3) * 0.1;
      bikeRef.current.rotation.x = isDispatching ? -0.2 : 0;
    }
    if (thrusterRef.current) {
      (thrusterRef.current.material as any).opacity = isDispatching ? 0.9 : 0.4;
      thrusterRef.current.scale.setScalar(isDispatching ? 1.5 + Math.sin(t*20)*0.2 : 1.0);
    }
  });

  return (
    <group ref={bikeRef} scale={1.4}>
      {/* Sleek Main Body */}
      <mesh position={[0, 1.2, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 2.8]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Glowing Neon Trims */}
      <mesh position={[0, 1.2, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.65, 0.1, 2.5]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
      </mesh>

      {/* Seat */}
      <mesh position={[0, 1.55, 0.2]}>
        <boxGeometry args={[0.4, 0.15, 1.0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Front Console/Windshield */}
      <mesh position={[0, 1.7, 1.0]} rotation={[-Math.PI / 3, 0, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} transparent opacity={0.7} />
      </mesh>

      {/* Side Stabilizer Pods */}
      <mesh position={[0.7, 1.0, 0.2]}><boxGeometry args={[0.4, 0.3, 1.5]} /><meshStandardMaterial color="#facc15" /></mesh>
      <mesh position={[-0.7, 1.0, 0.2]}><boxGeometry args={[0.4, 0.3, 1.5]} /><meshStandardMaterial color="#facc15" /></mesh>
      
      {/* Lightbar strip */}
      <mesh position={[0, 1.4, 1.3]}><boxGeometry args={[0.5, 0.1, 0.1]} /><meshBasicMaterial color="#ef4444" /></mesh>

      {/* Rear Thruster */}
      <mesh ref={thrusterRef} position={[0, 1.1, -1.4]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.1, 0.4, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}

/**
 * 3. Aerial Overwatch Drone (Highly Detailed)
 */
function AerialOverwatch({ isDispatching, activeZoneId, index = 0 }: { isDispatching: boolean, activeZoneId?: string, index?: number }) {
  const droneRef = useRef<Group>(null);
  const spotlightRef = useRef<Mesh>(null);
  const rotorsRef = useRef<Group>(null);
  
  // Fire Extinguisher Effect
  const waterRef = useRef<InstancedMesh>(null);
  const particleCount = 150;
  const dummy = useMemo(() => new Object3D(), []);
  
  const waterParticles = useMemo(() => {
    return new Array(particleCount).fill(0).map(() => ({
      // Tighter spread for concentrated fire hose effect
      position: new Vector3((Math.random() - 0.5) * 1.5, -2, (Math.random() - 0.5) * 1.5),
      // Faster downward velocity, very little horizontal drift
      velocity: new Vector3((Math.random() - 0.5) * 0.5, -30 - Math.random() * 10, (Math.random() - 0.5) * 0.5),
      life: Math.random() * 100
    }));
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (droneRef.current) {
      droneRef.current.position.y = 25 + Math.sin(t * 2) * 1.5;
      droneRef.current.rotation.y += 0.01;
    }
    
    // Change spotlight color to blue if fighting fire, otherwise red
    const isFightingFire = isDispatching && activeZoneId === 'zone_3';
    
    if (spotlightRef.current) {
      (spotlightRef.current.material as any).opacity = isDispatching ? 0.35 + Math.sin(t * 15) * 0.15 : 0.1;
      (spotlightRef.current.material as any).color.set(isFightingFire ? '#38bdf8' : '#ef4444');
    }
    
    if (rotorsRef.current) {
      rotorsRef.current.children.forEach(rotor => {
        rotor.rotation.y += 0.5;
      });
    }

    // Animate water dropping
    if (waterRef.current) {
      if (isFightingFire) {
        waterRef.current.visible = true;
        waterParticles.forEach((p, i) => {
          p.life += delta * 60;
          p.position.addScaledVector(p.velocity, delta);
          
          // Reset when hitting ground (drone is at y=25, ground is at -25 relative)
          if (p.position.y < -30) { 
             p.position.set((Math.random() - 0.5) * 1.5, -2, (Math.random() - 0.5) * 1.5);
          }
          
          dummy.position.copy(p.position);
          dummy.scale.setScalar(Math.max(0.2, 1 - (p.position.y / -30))); // Shrink as it falls
          dummy.updateMatrix();
          waterRef.current!.setMatrixAt(i, dummy.matrix);
        });
        waterRef.current.instanceMatrix.needsUpdate = true;
      } else {
        waterRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={droneRef} scale={1.2}>
      {/* Main Core */}
      <mesh><cylinderGeometry args={[1.5, 1.2, 0.8, 8]} /><meshStandardMaterial color="#0f172a" metalness={0.9} /></mesh>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[1.0, 1.4, 0.3, 8]} /><meshStandardMaterial color="#facc15" /></mesh>
      
      {/* Sensor Eye */}
      <mesh position={[0, -0.4, 0]}><sphereGeometry args={[0.7, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} /><meshBasicMaterial color="#000000" /></mesh>
      <mesh position={[0, -0.7, 0]}><sphereGeometry args={[0.3, 16, 16, 0, Math.PI*2, 0, Math.PI/2]} /><meshBasicMaterial color="#ef4444" /></mesh>
      
      {/* Rotors */}
      <group ref={rotorsRef}>
        {[
          [2.2, 0, 2.2], [-2.2, 0, 2.2],
          [2.2, 0, -2.2], [-2.2, 0, -2.2],
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.1, 16]} /><meshBasicMaterial color="#334155" transparent opacity={0.3} /></mesh>
            <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.1, 0.1, 0.6]} /><meshStandardMaterial color="#1e293b" /></mesh>
          </group>
        ))}
      </group>

      {/* Volumetric Spotlight Cone */}
      <mesh ref={spotlightRef} position={[0, -12, 0]}>
        <coneGeometry args={[8, 24, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} depthWrite={false} blending={AdditiveBlending} side={DoubleSide} />
      </mesh>

      {/* Water Dropping Effect */}
      <instancedMesh ref={waterRef} args={[undefined, undefined, particleCount]} visible={false}>
         <sphereGeometry args={[0.4, 8, 8]} />
         <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/**
 * 4. Police Officer Foot Patrol (Tactical Armor)
 */
function PoliceOfficer({ isDispatching }: { isDispatching: boolean }) {
  const officerRef = useRef<Group>(null);
  const batonRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (officerRef.current) {
      // Walk bob
      if (isDispatching) {
        officerRef.current.position.y = Math.sin(t * 15) * 0.1;
        officerRef.current.rotation.z = Math.sin(t * 10) * 0.05;
      } else {
        officerRef.current.position.y = Math.sin(t * 5) * 0.05;
        officerRef.current.rotation.z = 0;
      }
    }
    if (batonRef.current) {
      // Swing baton
      batonRef.current.rotation.z = isDispatching 
        ? -Math.PI / 4 + Math.sin(t * 15) * 0.5 
        : Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={officerRef} scale={1.8}>
      {/* Tactical Vest / Torso */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.8, 1.0, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      
      {/* High-Vis POLICE lettering plate */}
      <mesh position={[0, 1.3, 0.21]}>
        <boxGeometry args={[0.5, 0.2, 0.05]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {/* Shoulders */}
      <mesh position={[0.45, 1.4, 0]}><boxGeometry args={[0.3, 0.3, 0.4]} /><meshStandardMaterial color="#1e293b" /></mesh>
      <mesh position={[-0.45, 1.4, 0]}><boxGeometry args={[0.3, 0.3, 0.4]} /><meshStandardMaterial color="#1e293b" /></mesh>

      {/* Head & Riot Helmet */}
      <group position={[0, 1.8, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Glowing Visor */}
        <mesh position={[0, 0.05, 0.28]}>
          <boxGeometry args={[0.5, 0.2, 0.1]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Arms */}
      <group position={[0.5, 1.3, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.1, 0.1, 0.6]} /><meshStandardMaterial color="#1e3a8a" /></mesh>
        {/* Glow Baton */}
        <mesh ref={batonRef} position={[0, -0.7, 0.2]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.9} blending={AdditiveBlending} />
        </mesh>
      </group>
      
      <mesh position={[-0.5, 1.0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
    </group>
  );
}


function SecurityTelemetry({ isDispatching, type, index }: { isDispatching: boolean, type: string, index: number }) {
  if (!isDispatching) return null;
  return (
    <Html position={[0, type === 'AERIAL' ? 15 : 6, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
      <div className="group relative cursor-pointer pointer-events-auto">
        {/* Minimized Pill */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10 hover:border-yellow-500/50 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-white/70 group-hover:text-yellow-400 transition-colors">{type.substring(0,3)}_0{index}</span>
        </div>
        
        {/* Expanded Hover State */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
          <div className="bg-[rgba(20,20,10,0.95)] border border-yellow-500/50 p-2 rounded-lg text-[9px] font-mono text-yellow-400 uppercase whitespace-nowrap shadow-[0_0_15px_rgba(234,179,8,0.3)] flex flex-col min-w-[110px]">
            <div className="flex items-center justify-between font-bold text-white border-b border-white/20 pb-1 mb-1">
              <span>{type}_0{index}</span>
            </div>
            <div className="text-red-400 font-bold">ACTIVE RESPONSE</div>
          </div>
        </div>
      </div>
    </Html>
  );
}

export function SecurityUnit({ initialPosition = [0, 0, 0], index = 0 }: SecurityUnitProps) {
  const activeIncident = useZoneStore(state => state.activeIncident);
  const groupRef = useRef<Group>(null);
  
  const [isDispatching, setIsDispatching] = useState(false);
  const currentPos = useRef(new Vector3(...initialPosition));
  const targetPos = useMemo(() => new Vector3(), []);
  const currentWaypointIndex = useRef(0);
  
  // Pre-allocated vectors for useFrame to prevent garbage collection spikes
  const baseP = useMemo(() => new Vector3(), []);
  const centerPos = useMemo(() => new Vector3(0, 0, 0), []);
  const tunnelSouthPos = useMemo(() => new Vector3(0, 0, 160), []);
  const eastExtPos = useMemo(() => new Vector3(160, 0, 160), []);

  // Assign roles based on index (0-7)
  let role = 'SCOUT'; // Default
  if (index === 0 || index === 4) role = 'COMMAND'; // 2 Heavies
  if (index === 3 || index === 7) role = 'AERIAL';  // 2 Aerials
  if (index === 1 || index === 5) role = 'SCOUT';   // 2 Bikes
  if (index === 2 || index === 6) role = 'OFFICER'; // 2 Foot Patrols

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    let waypoints: Vector3[] = [];

    if (isDispatching && activeIncident) {
      const p = ZONE_POSITIONS[activeIncident.zone_id] || [0,0,0];
      const angle = (index / 8) * Math.PI * 2;
      
      let radius = 30;
      if (role === 'COMMAND') radius = 40;
      if (role === 'AERIAL') radius = activeIncident.zone_id === 'zone_3' ? 2.5 : 10;
      if (role === 'SCOUT') radius = 25;
      if (role === 'OFFICER') radius = 15;

      baseP.set(p[0], 0, p[2]);
      let isInterior = false;

      // Adjust target for interior incidents to avoid parking inside concrete stands
      if (activeIncident.zone_id === 'zone_2' || activeIncident.zone_id === 'zone_4') {
        baseP.set(-90, 0, 0); // West edge of pitch
        isInterior = true;
      } else if (activeIncident.zone_id === 'zone_6') {
        baseP.set(90, 0, 0); // East edge of pitch
        isInterior = true;
      } else if (activeIncident.zone_id === 'zone_3') {
        baseP.set(0, 0, -100); // North edge of pitch
        isInterior = true;
      } else if (activeIncident.zone_id === 'zone_5') {
        baseP.set(0, 0, 100); // South tunnel area
        isInterior = true;
      } else if (activeIncident.zone_id === 'zone_1') {
        baseP.set(240, 0, 0); // Shift perimeter far East, outside the stadium geometry
      }

      // Aerial units fly to the exact incident location, ground units form a perimeter at baseP
      if (role === 'AERIAL') {
        targetPos.set(p[0] + radius * Math.cos(angle), 0, p[2] + radius * Math.sin(angle));
      } else {
        targetPos.set(baseP.x + radius * Math.cos(angle), 0, baseP.z + radius * Math.sin(angle));
      }

      if (role === 'AERIAL') {
         // Aerial units can fly straight to target
         waypoints = [targetPos];
      } else {
         // Ground units must navigate
         if (isInterior) {
            // Route through South Tunnel -> Pitch Center -> Target
            waypoints = [
              tunnelSouthPos,
              centerPos,
              targetPos
            ];
         } else if (activeIncident.zone_id === 'zone_1') {
            // East exterior routing
            waypoints = [
              eastExtPos,
              targetPos
            ];
         } else {
            waypoints = [targetPos];
         }
      }
    } else {
      // Idle patrol behavior
      const t = state.clock.getElapsedTime();
      let patrolRadius = 30;
      if (role === 'AERIAL') patrolRadius = 60;
      if (role === 'OFFICER') patrolRadius = 15;
      
      targetPos.set(
        initialPosition[0] + patrolRadius * Math.cos(t * 0.1 + index),
        0,
        initialPosition[2] + patrolRadius * Math.sin(t * 0.1 + index)
      );

      if (role === 'AERIAL') {
        waypoints = [targetPos];
      } else {
        // Return routing if trapped inside
        if (currentPos.current.distanceToSquared(centerPos) < 12100 && Math.abs(initialPosition[0]) > 120) { // 110^2 = 12100
           waypoints = [
             centerPos,
             tunnelSouthPos,
             targetPos
           ];
        } else {
           waypoints = [targetPos];
        }
      }
    }

    let currentTarget = waypoints[currentWaypointIndex.current];
    if (!currentTarget) currentTarget = waypoints[waypoints.length - 1] || targetPos;
    
    // Advance waypoint if close
    if (currentPos.current.distanceTo(currentTarget) < 5) {
      if (currentWaypointIndex.current < waypoints.length - 1) {
        currentWaypointIndex.current++;
        currentTarget = waypoints[currentWaypointIndex.current];
      }
    }

    let speed = 1.0;
    if (isDispatching) {
      if (role === 'COMMAND') speed = 4.0;
      if (role === 'OFFICER') speed = 2.0;
      if (role === 'AERIAL') speed = 5.0;
      if (role === 'SCOUT') speed = 7.0;
    } else {
      if (role === 'OFFICER') speed = 0.5;
    }
    
    currentPos.current.lerp(currentTarget, delta * speed);
    
    const direction = currentTarget.clone().sub(currentPos.current);
    if (direction.lengthSq() > 0.1) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      let diff = targetRotation - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * delta * (role === 'SCOUT' ? 8 : 3);
    }
    
    groupRef.current.position.copy(currentPos.current);
  });

  useEffect(() => {
    setIsDispatching(!!activeIncident);
    currentWaypointIndex.current = 0;
  }, [activeIncident]);

  return (
    <group ref={groupRef}>
      {role === 'COMMAND' && <CommandVehicle isDispatching={isDispatching} />}
      {role === 'SCOUT' && <PatrolHoverBike isDispatching={isDispatching} />}
      {role === 'AERIAL' && <AerialOverwatch isDispatching={isDispatching} activeZoneId={activeIncident?.zone_id} index={index} />}
      {role === 'OFFICER' && <PoliceOfficer isDispatching={isDispatching} />}
      <SecurityTelemetry isDispatching={isDispatching} type={role} index={index + 1} />
    </group>
  );
}
