// src/components/VehicleSystem.tsx
import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Vehicle role colors
const VEHICLE_COLORS = {
  ambulance: 0xff0000, // red
  securityBuggy: 0x0000ff, // blue
  maintenanceCart: 0xffa500, // orange
  utilityVehicle: 0x808080, // gray
} as const;

type VehicleType = keyof typeof VEHICLE_COLORS;

interface VehicleEntity {
  id: number;
  type: VehicleType;
  position: THREE.Vector3;
}

// Simple vehicle mesh built from primitives
const Vehicle = ({ entity }: { entity: VehicleEntity }) => {
  const { position, type } = entity;
  const bodyColor = new THREE.Color(VEHICLE_COLORS[type]);

  // No animation needed for static vehicles
  useFrame(() => {});

  return (
<group position={position}>
      {/* Body */}
      <mesh position-y={0.5}>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Wheels */}
      {[[-0.5, 0.2, 0.4], [0.5, 0.2, 0.4], [-0.5, 0.2, -0.4], [0.5, 0.2, -0.4]].map((pos, i) => (
        <mesh key={i} position={new THREE.Vector3(...pos)}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
          <meshStandardMaterial color={0x111111} />
        </mesh>
      ))}
      {/* Windshield */}
      <mesh position-y={0.65} rotation-x={-Math.PI / 4}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial color={0xdddddd} transparent opacity={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position-y={0.9}>
        <boxGeometry args={[0.9, 0.2, 0.7]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  );
};

// Stadium model offset/scale – matches StadiumCanvas configuration
const STADIUM_OFFSET = new THREE.Vector3(-78, -2, 124);
const STADIUM_SCALE = 0.06;

// Fixed service‑road positions (approximate, based on stadium layout)
const SERVICE_POSITIONS: { type: VehicleType; pos: THREE.Vector3 }[] = [
  { type: 'ambulance', pos: new THREE.Vector3(0, 0, 240) }, // Gate 1 (south) ambulance entrance
  { type: 'securityBuggy', pos: new THREE.Vector3(200, 0, 0) }, // Gate 3 (east)
  { type: 'maintenanceCart', pos: new THREE.Vector3(-100, 0, 0) }, // West service road
  { type: 'utilityVehicle', pos: new THREE.Vector3(0, 0, -240) }, // North service road
  { type: 'ambulance', pos: new THREE.Vector3(100, 0, 120) }, // Additional vehicle near east side
];

export const VehicleSystem = () => {
  // Log mounting for debugging
  useEffect(() => console.log('VehicleSystem mounted'), []);

  // Apply stadium offset/scale to each vehicle position so they align with the model
  const vehicles: VehicleEntity[] = useMemo(
    () =>
      SERVICE_POSITIONS.map((v, i) => {
        const worldPos = v.pos.clone().multiplyScalar(STADIUM_SCALE).add(STADIUM_OFFSET);
        // Ensure a minimum height above ground (y ~ 0.2)
        worldPos.y = Math.max(worldPos.y, 0.2);
        return { id: i, type: v.type, position: worldPos };
      }),
    []
  );

  // No dynamic movement for now
  useFrame(() => {});

  return (
    <group>
      {vehicles.map((v) => (
        <Vehicle key={v.id} entity={v} />
      ))}
    </group>
  );
};
