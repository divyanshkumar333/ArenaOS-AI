// src/components/LowPolyPerson.tsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/** Shared person attributes definition */
interface PersonAttrs {
  height: number;
  bodyWidth: number;
  skinColor: number;
  hairColor: number;
  shirtColor: number;
  pantsColor: number;
  hasHat: boolean;
  hasBackpack: boolean;
  isWalking: boolean;
}


/**
 * Procedural low‑poly human built from primitives.
 * Used for LOD 1 (near camera) detailed spectators.
 */
export const LowPolyPerson = ({ attrs, position, isSeated }: {
  attrs: PersonAttrs;
  position: THREE.Vector3;
  isSeated: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { height, bodyWidth, skinColor, hairColor, shirtColor, pantsColor, hasHat, hasBackpack, isWalking } = attrs;

  // Simple animation parameters (sine‑wave based)
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Breathing – tiny scale Y oscillation
    const breath = Math.sin(t * 1.5) * 0.02 + 1.0;
    groupRef.current.scale.set(1, breath, 1);
    // Head turn (idle)
    const headTurn = Math.sin(t * 0.4) * 0.15;
    const head = groupRef.current.getObjectByName('head') as THREE.Mesh;
    if (head) head.rotation.y = headTurn;
    // Simple arm swing when walking
    if (!isSeated && isWalking) {
      const swing = Math.sin(t * 4) * 0.4;
      const leftArm = groupRef.current.getObjectByName('leftArm') as THREE.Mesh;
      const rightArm = groupRef.current.getObjectByName('rightArm') as THREE.Mesh;
      if (leftArm && rightArm) {
        leftArm.rotation.x = swing;
        rightArm.rotation.x = -swing;
      }
    }
    // Update world position
    groupRef.current.position.copy(position);
    // Slight upward offset for seated spectators to avoid clipping into seat
    if (isSeated) {
      groupRef.current.position.y += 0.1;
      groupRef.current.lookAt(new THREE.Vector3(0, groupRef.current.position.y, 0));
    }
  });

  // Dimensions derived from height/bodyWidth (proportions)
  const headRadius = 0.12 * height;
  const neckHeight = 0.05 * height;
  const torsoHeight = 0.3 * height;
  const torsoWidth = 0.2 * bodyWidth;
  const waistHeight = 0.1 * height;
  const pelvisHeight = 0.08 * height;
  const legLength = 0.4 * height;
  const armLength = 0.35 * height;
  const shoeHeight = 0.04 * height;

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh name="head" position-y={height - headRadius}>
        <sphereGeometry args={[headRadius, 8, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Hair / Hat (simple cap) */}
      {hasHat && (
        <mesh position-y={height - headRadius + 0.02}>
          <sphereGeometry args={[headRadius * 1.05, 6, 6]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
      )}
      {/* Neck */}
      <mesh position-y={height - headRadius - neckHeight / 2}>
        <cylinderGeometry args={[headRadius * 0.6, headRadius * 0.6, neckHeight, 6]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Torso (tapered box) */}
      <mesh position-y={height - headRadius - neckHeight - torsoHeight / 2}>
        <boxGeometry args={[torsoWidth, torsoHeight, torsoWidth * 0.5]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Waist */}
      <mesh position-y={height - headRadius - neckHeight - torsoHeight - waistHeight / 2}>
        <boxGeometry args={[torsoWidth * 0.9, waistHeight, torsoWidth * 0.5]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Pelvis */}
      <mesh position-y={height - headRadius - neckHeight - torsoHeight - waistHeight - pelvisHeight / 2}>
        <boxGeometry args={[torsoWidth * 0.8, pelvisHeight, torsoWidth * 0.5]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Legs */}
      {/* Left leg */}
      <mesh name="leftLeg" position-x={-torsoWidth * 0.2} position-y={legLength / 2}>
        <cylinderGeometry args={[torsoWidth * 0.1, torsoWidth * 0.09, legLength, 6]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Right leg */}
      <mesh name="rightLeg" position-x={torsoWidth * 0.2} position-y={legLength / 2}>
        <cylinderGeometry args={[torsoWidth * 0.1, torsoWidth * 0.09, legLength, 6]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Shoes */}
      <mesh position-y={0.02}>
        <boxGeometry args={[torsoWidth * 0.2, shoeHeight, torsoWidth * 0.3]} />
        <meshStandardMaterial color={0x111111} />
      </mesh>
      {/* Arms */}
      {/* Upper left arm */}
      <mesh name="leftArm" position-x={-torsoWidth / 2 - 0.05} position-y={height - headRadius - neckHeight - torsoHeight * 0.6} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[torsoWidth * 0.08, torsoWidth * 0.07, armLength, 6]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Upper right arm */}
      <mesh name="rightArm" position-x={torsoWidth / 2 + 0.05} position-y={height - headRadius - neckHeight - torsoHeight * 0.6} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[torsoWidth * 0.08, torsoWidth * 0.07, armLength, 6]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Backpack (optional) */}
      {hasBackpack && (
        <mesh position-x={-torsoWidth * 0.6} position-y={height - headRadius - neckHeight - torsoHeight * 0.3} rotation-z={Math.PI / 2}>
          <boxGeometry args={[torsoWidth * 0.2, torsoHeight * 0.6, torsoWidth * 0.1]} />
          <meshStandardMaterial color={0x333333} />
        </mesh>
      )}
    </group>
  );
};
