// src/utils/personGenerator.ts
import * as THREE from 'three';
/**
 * Utility types for procedural person generation used by LowPolyPerson and CrowdSystem.
 * This mirrors the attribute shape expected by LowPolyPerson component.
 */
export interface PersonAttrs {
  height: number; // meters
  bodyWidth: number;
  skinColor: number; // hex color
  hairColor: number; // hex color
  shirtColor: number; // hex color
  pantsColor: number; // hex color
  hasHat: boolean;
  hasBackpack: boolean;
  isWalking: boolean;
}

// Optional helper to generate random attributes (used by CrowdSystem).
export const generateRandomPersonAttrs = (isSeated: boolean): PersonAttrs => {
  const randomColor = () => new THREE.Color(`hsl(${Math.random() * 360}, 60%, 50%)`).getHex();
  const height = THREE.MathUtils.randFloat(1.6, 2.0);
  const bodyWidth = THREE.MathUtils.randFloat(0.3, 0.5);
  const skinColor = randomColor();
  const hairColor = randomColor();
  const shirtColor = randomColor();
  const pantsColor = randomColor();
  const hasHat = Math.random() < 0.2;
  const hasBackpack = Math.random() < 0.1;
  const isWalking = !isSeated && Math.random() < 0.6;
  return { height, bodyWidth, skinColor, hairColor, shirtColor, pantsColor, hasHat, hasBackpack, isWalking };
};
