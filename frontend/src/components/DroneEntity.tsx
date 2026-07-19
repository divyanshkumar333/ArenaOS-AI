import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { Vector3, Group, Mesh, PerspectiveCamera as ThreePerspectiveCamera, MathUtils, AdditiveBlending } from 'three';
import { Html, useFBO, PerspectiveCamera, Hud, OrthographicCamera } from '@react-three/drei';
import { useZoneStore } from '@/store/useZoneStore';

interface DroneEntityProps {
  initialPosition?: [number, number, number];
  index?: number;
}

export const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  "zone_1": [200, 5, 0],    // Gate 3 (East)
  "zone_2": [-100, 15, 0],  // Section 112 (West Seating)
  "zone_3": [0, 5, -240],   // Concourse North
  "zone_4": [-120, 35, 0],  // VIP Lounge (West Upper)
  "zone_5": [0, 5, 240],    // Gate 1 (South)
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
  const scannerRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const spinSpeed = isScanning ? 35 : 15;

    if (rotorRef1.current) rotorRef1.current.rotation.y = t * spinSpeed;
    if (rotorRef2.current) rotorRef2.current.rotation.y = -t * spinSpeed;
    if (rotorRef3.current) rotorRef3.current.rotation.y = t * spinSpeed;
    if (rotorRef4.current) rotorRef4.current.rotation.y = -t * spinSpeed;

    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 4) * 0.2; // Subtle hover bob
    }

    if (scannerRef.current && isScanning) {
      scannerRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.05);
      scannerRef.current.rotation.z = Math.sin(t * 2) * 0.15;
      scannerRef.current.rotation.x = Math.cos(t * 1.5) * 0.15;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Sleek Stealth Fuselage */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 1.2, 4.5]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Angled side panels */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Futuristic glowing visor */}
      <mesh position={[0, 0.2, 2.0]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[2.0, 0.4, 0.8]} />
        <meshStandardMaterial
          color={isScanning ? "#ef4444" : "#0a84ff"}
          emissive={isScanning ? "#ef4444" : "#0a84ff"}
          emissiveIntensity={isScanning ? 4.0 : 1.5}
          roughness={0.1}
        />
      </mesh>

      {/* Cyberpunk decals/lights */}
      <mesh position={[0, 0.65, -1.5]}>
        <boxGeometry args={[0.4, 0.1, 1.0]} />
        <meshStandardMaterial color="#0a84ff" emissive="#0a84ff" emissiveIntensity={2.0} />
      </mesh>

      {/* Drone Arms (X-config) */}
      {[
        [45, [2, 0, 2]],
        [135, [-2, 0, 2]],
        [225, [-2, 0, -2]],
        [315, [2, 0, -2]]
      ].map(([angle, pos], i) => (
        <group key={i} rotation={[0, (angle as number) * Math.PI / 180, 0]}>
          <mesh position={[2.5, 0, 0]}>
            <boxGeometry args={[5, 0.3, 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Rotors & Hover Thrusters */}
      {[
        [3.5, 0.5, 3.5],
        [-3.5, 0.5, 3.5],
        [-3.5, 0.5, -3.5],
        [3.5, 0.5, -3.5]
      ].map((pos, i) => {
        const refs = [rotorRef1, rotorRef2, rotorRef3, rotorRef4];
        return (
          <group key={i} position={pos as [number, number, number]}>
            {/* Engine Pod */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.6, 0.4, 1.0, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Glowing Thruster Exhaust */}
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 0.4, 16]} />
              <meshBasicMaterial color="#0a84ff" transparent opacity={0.8} blending={AdditiveBlending} />
            </mesh>
            {/* Rotor Blades - Cross formation */}
            <group ref={refs[i]} position={[0, 0.4, 0]}>
              <mesh>
                <boxGeometry args={[4.5, 0.05, 0.3]} />
                <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} metalness={0.5} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[4.5, 0.05, 0.3]} />
                <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} metalness={0.5} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Advanced Scanning Array */}
      {isScanning && (
        <group ref={scannerRef} position={[0, -1, 0]}>
          {/* Main Cone */}
          <mesh position={[0, -25, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[22, 50, 32, 1, true]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.12} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          {/* Inner Laser Core */}
          <mesh position={[0, -25, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 50, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          {/* Scanning Rings */}
          <mesh position={[0, -48, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[20, 22, 64]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.4} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          <mesh position={[0, -25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[10, 11, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.2} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </group>
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
    <Html position={[0, 8, 0]} center style={{ pointerEvents: 'none' }}>
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

/**
 * 3. PICTURE-IN-PICTURE (PiP) CAMERA
 * Renders a live secondary feed from the drone's perspective into the HUD.
 */
function DronePiPCamera({ isDispatching, droneGroupRef }: { isDispatching: boolean; droneGroupRef: React.RefObject<Group | null> }) {
  const [isOpen, setIsOpen] = React.useState(true);
  React.useEffect(() => {
    if (isDispatching) setIsOpen(true);
  }, [isDispatching]);

  // Use a Frame Buffer Object (FBO) to render the scene
  const fbo = useFBO(512, 288); // 16:9 ratio
  const droneCamRef = useRef<ThreePerspectiveCamera>(null);
  const { size } = useThree();

  useFrame(({ gl, scene }) => {
    if (!droneCamRef.current || !droneGroupRef.current) return;

    // Only render PiP if the drone is actively dispatching to an incident
    if (isDispatching && isOpen) {
      // Temporarily hide the HUD or overlays from the drone camera if needed (omitted here as Hud is separate)

      // Update drone camera to look from the drone
      droneCamRef.current.position.copy(droneGroupRef.current.position);
      droneCamRef.current.position.y -= 2; // slightly below drone body

      const activeIncident = useZoneStore.getState().activeIncident;
      if (activeIncident && ZONE_POSITIONS[activeIncident.zone_id]) {
        const p = ZONE_POSITIONS[activeIncident.zone_id];
        droneCamRef.current.lookAt(p[0], p[1], p[2]);
      } else {
        const lookTarget = droneGroupRef.current.position.clone();
        lookTarget.y = 0; // look straight down at the field/crowd
        droneCamRef.current.lookAt(lookTarget);
      }

      // Render the main scene into the FBO from the drone's perspective
      gl.setRenderTarget(fbo);
      gl.clear();
      gl.render(scene, droneCamRef.current);
      gl.setRenderTarget(null);
    }
  });

  if (!isDispatching) return null;

  // Render the HUD PiP overlay (left side of screen)
  return (
    <>
      <PerspectiveCamera ref={droneCamRef} makeDefault={false} fov={60} near={1} far={1000} />

      <Hud renderPriority={2}>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        {isOpen ? (
          <group position={[-size.width / 2 + 420, size.height / 2 - 190, 0]}>
            {/* Panel Background / Border */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[330, 190]} />
              <meshBasicMaterial color="#0a84ff" transparent opacity={0.3} />
            </mesh>
            {/* Actual PiP Texture */}
            <mesh>
              <planeGeometry args={[320, 180]} />
              <meshBasicMaterial map={fbo.texture} />
            </mesh>
            {/* UI Text Overlay for PiP */}
            <Html position={[0, 0, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <div className="w-[320px] h-[180px] relative pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[12px] shadow-lg border border-white/20 transition-colors z-[200] pointer-events-auto cursor-pointer"
                >
                  ✕
                </button>
                <div className="absolute top-2 left-2 bg-black/80 text-accent text-[9px] font-mono px-2 py-1 rounded border border-accent/50 whitespace-nowrap">
                  <span className="animate-pulse mr-1">●</span> GATE_3_CCTV
                </div>
                <div className="absolute top-10 right-2 flex flex-col items-end gap-1">
                  <div className="bg-red-500/20 text-red-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border border-red-500/50">THERMAL_VISION</div>
                  <div className="bg-accent/20 text-accent text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border border-accent/50">AI_LOCK_ENGAGED</div>
                </div>

                {/* Mock AI Bounding Box in PiP */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[120px] border border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none">
                  <div className="absolute -top-3 left-0 bg-red-500 text-black text-[7px] font-bold px-1">ANOMALY_98%</div>
                  {/* Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 text-[7px] font-mono text-gray-300">
                  ALT: 25.4m | SPD: 0.0km/h
                </div>
                <div className="absolute bottom-2 right-2 text-[7px] font-mono text-accent">
                  [ SCANNING SECTOR ]
                </div>
              </div>
            </Html>
          </group>
        ) : (
          <group position={[-size.width / 2 + 280, size.height / 2 - 120, 0]}>
            <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
              <div
                className="w-12 h-12 bg-black/80 border border-accent/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(10,132,255,0.3)] transition-all group cursor-pointer pointer-events-auto"
                title="Open Drone Cam"
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
              >
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute opacity-75"></div>
                <div className="w-4 h-4 bg-red-500 rounded-full relative z-10 border border-white/50"></div>
              </div>
            </Html>
          </group>
        )}
      </Hud>
    </>
  );
}

export function DroneEntity({ initialPosition = [0, 100, 0], index = 0 }: DroneEntityProps) {
  const groupRef = useRef<Group>(null);
  const activeIncident = useZoneStore(state => state.activeIncident);

  // Drone flies if there is an active incident.
  const isDispatching = !!activeIncident;

  const targetPos = useMemo(() => new Vector3(), []);
  const angleOffset = (index * Math.PI * 2) / 4; // Spread 4 drones evenly

  const currentPos = useRef(new Vector3(...initialPosition));
  const idlePos = useMemo(() => new Vector3(), []);
  const lookTargetRef = useRef(new Vector3());
  const directionOffset = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isDispatching) {
      // Dynamic orbit around the incident
      if (activeIncident && ZONE_POSITIONS[activeIncident.zone_id]) {
        const p = ZONE_POSITIONS[activeIncident.zone_id];
        const orbitSpeed = 0.5 + index * 0.1; // Slightly different speeds
        const radius = 35 + index * 8; // Stagger radius
        const height = 30 + index * 10; // Stagger altitude (reverted to original)

        let angle = t * orbitSpeed + angleOffset;

        if (activeIncident.zone_id === 'zone_1') {
          // Gate 3 (East Entrance): Hover to the East (positive X) to get a clear front view looking West
          angle = Math.sin(t * orbitSpeed) * (Math.PI / 6) + (index * 0.1); // Oscillate around 0 radians (East)
          targetPos.set(
            p[0] + radius * Math.cos(angle) + 50, // Shift X significantly outward (East)
            p[1] + height,
            p[2] + radius * Math.sin(angle)       // Keep Z mostly aligned with the gate
          );
        } else if (activeIncident.zone_id === 'zone_3') {
          // Fire Incident: Center of rotation is the fire, but we restrict the sweep 
          // to a 45-degree cone facing the pitch (South) so it never hits the walls.
          angle = Math.sin(t * orbitSpeed * 0.5) * (Math.PI / 8) + Math.PI / 2 + (index * 0.1);
          targetPos.set(
            p[0] + 140 * Math.cos(angle), // Center is p[0], orbit radius 140
            p[1] + 25 + index * 5,        // Altitude 25
            p[2] + 140 * Math.sin(angle)  // Center is p[2], always stays South (over pitch) due to the angle restriction
          );
        } else if (activeIncident.zone_id !== 'zone_2') {
          // Semi-circle oscillation for other non-Section 112 incidents
          angle = Math.sin(t * orbitSpeed) * (Math.PI / 2) + angleOffset;
          targetPos.set(
            p[0] + radius * Math.cos(angle),
            p[1] + height,
            p[2] + radius * Math.sin(angle)
          );
        } else {
          // Full circle for Section 112
          targetPos.set(
            p[0] + radius * Math.cos(angle),
            p[1] + height,
            p[2] + radius * Math.sin(angle)
          );
        }
      }

      // Fly towards anomaly with an arched path
      currentPos.current.x = MathUtils.lerp(currentPos.current.x, targetPos.x, delta * 2.0);
      currentPos.current.z = MathUtils.lerp(currentPos.current.z, targetPos.z, delta * 2.0);

      // Arc height based on horizontal distance remaining
      const dist = Math.sqrt((targetPos.x - currentPos.current.x) ** 2 + (targetPos.z - currentPos.current.z) ** 2);
      const arcHeight = Math.min(dist * 0.15, 30);

      currentPos.current.y = MathUtils.lerp(currentPos.current.y, targetPos.y + arcHeight, delta * 2.5);
    } else {
      // Dynamic idle patrol - different speeds, radiuses and heights
      const speed = 0.15 + index * 0.05;
      const idleRadius = 140 + index * 15;
      idlePos.set(
        Math.cos(t * speed + angleOffset) * idleRadius,
        70 + index * 12 + Math.sin(t * 0.5) * 5,
        Math.sin(t * speed + angleOffset) * idleRadius
      );
      currentPos.current.lerp(idlePos, delta * 0.8);
    }

    groupRef.current.position.copy(currentPos.current);

    // Rotate to face the incident or travel direction
    if (isDispatching) {
      const lt = lookTargetRef.current;
      if (activeIncident && ZONE_POSITIONS[activeIncident.zone_id]) {
        // Face the anomaly directly (focus on the fire)
        const p = ZONE_POSITIONS[activeIncident.zone_id];
        lt.set(p[0], p[1], p[2]); 
      } else {
        lt.copy(targetPos);
        lt.y = groupRef.current.position.y; // Keep level look
      }
      groupRef.current.lookAt(lt);
    } else {
      const t = state.clock.getElapsedTime();
      directionOffset.set(-Math.sin(t * 0.1), 0, Math.cos(t * 0.1));
      const lt = lookTargetRef.current;
      lt.copy(currentPos.current).add(directionOffset);
      groupRef.current.lookAt(lt);
    }

    if (index === 0) {
      useZoneStore.getState().setPrimaryDroneState(
        [currentPos.current.x, currentPos.current.y, currentPos.current.z],
        [lookTargetRef.current.x, lookTargetRef.current.y, lookTargetRef.current.z]
      );
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <DroneModel isScanning={isDispatching} />
        {index === 0 && <TelemetryOverlay isDispatching={isDispatching} />}
      </group>

      {/* PiP Camera rendering to HUD overlay - only for primary drone to avoid overlaps */}
      {index === 0 && <DronePiPCamera isDispatching={isDispatching} droneGroupRef={groupRef} />}
    </>
  );
}
