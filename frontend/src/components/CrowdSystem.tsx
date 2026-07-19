// src/components/CrowdSystem.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useZoneStore } from '@/store/useZoneStore';
import seatsData from './seats_extracted.json';

// Helper: generate random person attributes
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

// Seeded deterministic pseudo-random generator
function generateDeterministicAttrs(seed: number, isSeated: boolean): PersonAttrs {
  let s = seed;
  const rand = () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
  const randFloat = (min: number, max: number) => min + rand() * (max - min);

  // Choose skin colors (realistic tones)
  const skinTones = [0xd6a374, 0x8d5524, 0xc58c85, 0xe0ac69, 0xf1c27d, 0xffdbac];
  const skinColor = skinTones[Math.floor(rand() * skinTones.length)];

  // Choose hair colors
  const hairColors = [0x090806, 0x2c222b, 0x71635a, 0xb7a69e, 0xab7a5c, 0xa7856a];
  const hairColor = hairColors[Math.floor(rand() * hairColors.length)];

  // Choose shirt colors
  const shirtColors = [0x0a84ff, 0xffffff, 0x30d158, 0xff9f0a, 0xbf5af2, 0xff453a, 0x1a1a1a];
  const shirtColor = shirtColors[Math.floor(rand() * shirtColors.length)];

  // Pants colors
  const pantsColors = [0x2c3e50, 0x1b2631, 0x566573, 0xd5dbdb, 0x856404];
  const pantsColor = pantsColors[Math.floor(rand() * pantsColors.length)];

  const height = randFloat(1.6, 2.0);
  const bodyWidth = randFloat(0.85, 1.15);
  const hasHat = rand() < 0.22;
  const hasBackpack = rand() < 0.12;
  const isWalking = !isSeated && rand() < 0.65;

  return { height, bodyWidth, skinColor, hairColor, shirtColor, pantsColor, hasHat, hasBackpack, isWalking };
}

// Configuration constants
const CONCOURSE_WALKERS = 12; // optimized walker count
const GATE_QUEUE_MAX = 6; // optimized max gate queue count

// Coordinate alignment constants
const CROWD_SCALE = 1.0;
const CROWD_OFFSET_X = 0.0;
const CROWD_OFFSET_Y = 0.0;
const CROWD_OFFSET_Z = 0.0;

// Gate positions – align with ZONE_POSITIONS defined in StadiumCanvas
const GATE_POSITIONS = {
  zone_5: new THREE.Vector3(0, 5.0, 145), // Gate 1 (south entrance tunnel)
  zone_1: new THREE.Vector3(180, 5.0, 0), // Gate 3 (east entrance tunnel)
  zone_3: new THREE.Vector3(0, 5.0, -145), // Concourse north entrance
};

const ZONE_POSITIONS: Record<string, THREE.Vector3> = {
  "zone_1": new THREE.Vector3(180, 5, 0),    // Gate 3 (East Entrance)
  "zone_2": new THREE.Vector3(-140, 15, 0),  // Section 112 (West Seating inside bowl)
  "zone_3": new THREE.Vector3(0, 5, -145),   // Concourse North (North Entrance)
  "zone_4": new THREE.Vector3(-150, 25, 0),  // VIP Lounge (West Upper)
  "zone_5": new THREE.Vector3(0, 5, 145),    // Gate 1 (South Entrance)
  "zone_6": new THREE.Vector3(140, 15, 0),   // Section 115 (East Seating inside bowl)
};

// Helper: classify seats into specific sections
function getSeatSection(seat: { x: number; y: number; z: number }): 'vip' | 'lower' | 'upper' | 'corners' | 'goals' {
  const { x, y, z } = seat;

  // VIP section
  const isCenterLine = Math.abs(z) < 6.0;
  const isMainSides = Math.abs(x) > Math.abs(z);
  const isVipHeight = y >= 1.2 && y < 2.2;
  if (isMainSides && isCenterLine && isVipHeight) {
    return 'vip';
  }

  const isLower = y < 1.8;
  const angle = Math.abs(Math.atan2(z, x));
  const isGoalArea = angle > 1.1 && angle < 2.0;
  const isSideArea = angle < 0.4 || angle > 2.7;
  const isCorner = !isGoalArea && !isSideArea;

  if (isCorner) return 'corners';
  if (isGoalArea) return 'goals';
  return isLower ? 'lower' : 'upper';
}

export const CrowdSystem = () => {
  const activeIncident = useZoneStore(state => state.activeIncident);
  const predictiveTimeOffset = useZoneStore(state => state.predictiveTimeOffset);

  // Instanced Mesh refs
  const torsosRef = useRef<THREE.InstancedMesh>(null);


  const torsosDynamicRef = useRef<THREE.InstancedMesh>(null);
  const headsDynamicRef = useRef<THREE.InstancedMesh>(null);
  const hairsDynamicRef = useRef<THREE.InstancedMesh>(null);
  const legsDynamicRef = useRef<THREE.InstancedMesh>(null);
  const hatsDynamicRef = useRef<THREE.InstancedMesh>(null);
  const backpacksDynamicRef = useRef<THREE.InstancedMesh>(null);
  const headsRef = useRef<THREE.InstancedMesh>(null);
  const hairsRef = useRef<THREE.InstancedMesh>(null);
  const legsRef = useRef<THREE.InstancedMesh>(null);
  const hatsRef = useRef<THREE.InstancedMesh>(null);
  const backpacksRef = useRef<THREE.InstancedMesh>(null);

  // 1. Seated spectators generation
  const seatedSpectators = useMemo(() => {
    let seedState = 54321;
    const rand = () => {
      const x = Math.sin(seedState++) * 10000;
      return x - Math.floor(x);
    };

    const grouped: Record<string, Record<string, typeof seatsData.seats>> = {};
    seatsData.seats.forEach((seat) => {
      const sec = getSeatSection(seat);
      if (!grouped[sec]) grouped[sec] = {};
      const rowY = (Math.round(seat.y / 0.15) * 0.15).toFixed(2);
      if (!grouped[sec][rowY]) grouped[sec][rowY] = [];
      grouped[sec][rowY].push(seat);
    });

    const spectators: { position: THREE.Vector3; theta: number; attrs: PersonAttrs }[] = [];

    Object.entries(grouped).forEach(([sec, rows]) => {
      let baseOcc = 0.8;
      if (sec === 'vip') baseOcc = 0.65;
      else if (sec === 'lower') baseOcc = 0.92;
      else if (sec === 'upper') baseOcc = 0.65; // Upper tiers have more empty seats
      else if (sec === 'corners') baseOcc = 0.50;
      else if (sec === 'goals') baseOcc = 0.98; // Ultras section packed

      const targetOcc = baseOcc * 1.0;

      Object.entries(rows).forEach(([rowStr, rowSeats]) => {
        rowSeats.sort((a, b) => {
          if (sec === 'goals') return a.x - b.x;
          if (sec === 'vip' || sec === 'lower' || sec === 'upper') return a.z - b.z;
          return Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x);
        });

        let i = 0;
        while (i < rowSeats.length) {
          if (rand() < targetOcc * 1.8) {
            // Realistic clustering: families, couples, ultras
            let groupSize = 1;
            const r = rand();
            if (sec === 'goals') {
              // Ultras clump together in huge blocks
              groupSize = r < 0.2 ? 2 : r < 0.6 ? 4 : 6;
            } else if (sec === 'vip') {
              // VIPs usually in pairs or small groups
              groupSize = r < 0.6 ? 2 : r < 0.9 ? 1 : 3;
            } else {
              // General admission
              if (r < 0.30) groupSize = 1;
              else if (r < 0.75) groupSize = 2;
              else if (r < 0.92) groupSize = 3;
              else groupSize = 4;
            }

            const actualGroupSize = Math.min(groupSize, rowSeats.length - i);
            const groupShirtHue = rand() * 360;
            const useGroupShirt = sec === 'goals' || rand() < 0.35; // Ultras wear same colors

            for (let g = 0; g < actualGroupSize; g++) {
              const seat = rowSeats[i + g];
              const attrs = generateDeterministicAttrs(i + g + 1000, true);
              if (useGroupShirt) {
                // Variations of the team color
                attrs.shirtColor = new THREE.Color(`hsl(${groupShirtHue + (rand() * 15 - 7.5)}, 80%, 40%)`).getHex();
              }

              const pos = new THREE.Vector3(
                seat.x,
                seat.y,
                seat.z
              );

              // Calculate precise pitch-facing rotation
              // The pitch is at (0, 0, 0), so we look at the center
              const theta = Math.atan2(pos.x, pos.z) + Math.PI;

              // Push the seated crowd back slightly into the seats
              const backOffset = 40.0;
              pos.x += -Math.sin(theta) * backOffset;
              pos.z += -Math.cos(theta) * backOffset;

              // Skip seats erroneously in the pitch
              if (Math.abs(pos.x) < 100 && Math.abs(pos.z) < 65) {
                continue;
              }

              spectators.push({ position: pos, theta, attrs });
            }

            // Realistic gaps: after a group, leave 0 to 2 empty seats
            const skip = rand() < 0.6 ? 0 : rand() < 0.9 ? 1 : 2;
            i += actualGroupSize + skip;
          } else {
            // Large empty blocks for less packed sections
            const skip = sec === 'upper' || sec === 'corners' ? (Math.floor(rand() * 4) + 1) : 1;
            i += skip;
          }
        }
      });
    });

    console.log('Generated realistic seated crowd size:', spectators.length);
    return spectators;
  }, []);

  // Concourse walker path wrapping stands
  const concoursePath = useMemo(() => {
    return [
      new THREE.Vector3(-170, 1.2, -135),
      new THREE.Vector3(170, 1.2, -135),
      new THREE.Vector3(170, 1.2, 135),
      new THREE.Vector3(-170, 1.2, 135),
    ];
  }, []);

  // 2. Initialize Concourse walkers (moving)
  const concourseEntities = useMemo(() => {
    const list: { position: THREE.Vector3; targetIdx: number; speed: number; attrs: PersonAttrs }[] = [];
    for (let i = 0; i < CONCOURSE_WALKERS; i++) {
      const startIdx = Math.floor(Math.random() * concoursePath.length);
      list.push({
        position: concoursePath[startIdx].clone(),
        targetIdx: (startIdx + 1) % concoursePath.length,
        speed: 0.25 + Math.random() * 0.15,
        attrs: generateDeterministicAttrs(i + 3000, false),
      });
    }
    return list;
  }, [concoursePath]);

  // 3. Gate queues (static standing)
  const gateQueueEntities = useMemo(() => {
    const list: { position: THREE.Vector3; attrs: PersonAttrs; theta: number }[] = [];
    Object.entries(GATE_POSITIONS).forEach(([zoneId, pos], idx) => {
      let count = Math.floor(Math.random() * GATE_QUEUE_MAX);
      const isOvercrowded = activeIncident?.zone_id === 'zone_1' && zoneId === 'zone_1';

      if (isOvercrowded) {
        count = 400; // Massive crowd mob!
      }

      for (let i = 0; i < count; i++) {
        let offset = new THREE.Vector3(0, 0, 0);
        let theta = 0;

        if (isOvercrowded) {
          // Chaotic mob pushing towards the gate
          // 20 people wide to accommodate 400 people in a massive block
          const row = Math.floor(i / 20);
          const col = (i % 20) - 10;
          const jitterX = Math.random() * 2.5;
          const jitterZ = Math.random() * 2.5;

          // Gate is at x=210. Start the mob further outside at x=235 and grow outwards (positive X)
          // pos is 180, so we add 55 to start at 235.
          offset.set(55 + row * 1.8 + jitterX, 0, col * 1.8 + jitterZ);
          // Mostly face the gate (-X), with slight chaotic rotation
          theta = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        } else if (zoneId === 'zone_5') {
          offset.set(0, 0, i * 4.5);
          theta = Math.PI;
        } else if (zoneId === 'zone_1') {
          // Gate is at 210, pos is 180. Add 55 to start queue at 235 (outside)
          offset.set(55 + i * 4.5, 0, 0);
          theta = -Math.PI / 2;
        } else if (zoneId === 'zone_3') {
          offset.set(0, 0, -i * 4.5);
          theta = 0;
        }

        const pPos = pos.clone().add(offset);
        list.push({
          position: pPos,
          attrs: generateDeterministicAttrs(i + idx * 100 + 2000, false),
          theta
        });
      }
    });
    return list;
  }, [activeIncident]);

  const totalInstancesCount = useMemo(() => {
    return seatedSpectators.length + concourseEntities.length + gateQueueEntities.length;
  }, [seatedSpectators, concourseEntities, gateQueueEntities]);

  // Write static entities (Seated + Gate Queues) once to GPU buffers
  useEffect(() => {
    if (
      !torsosRef.current ||
      !headsRef.current ||
      !hairsRef.current ||
      !legsRef.current ||
      !hatsRef.current ||
      !backpacksRef.current
    ) {
      return;
    }

    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();

    const SEATED_COUNT = seatedSpectators.length;
    const CONCOURSE_COUNT = concourseEntities.length;

    // 1. Seated spectator transforms
    seatedSpectators.forEach((spec, i) => {
      const { position: pos, theta, attrs } = spec as any;
      const { height, bodyWidth, skinColor, hairColor, shirtColor, hasHat } = attrs;

      const h = height * 0.9;
      const w = bodyWidth * 0.9;

      let finalShirtColor = shirtColor;
      if (activeIncident && activeIncident.severity === 'critical') {
        const iPos = ZONE_POSITIONS[activeIncident.zone_id];
        if (iPos) {
          const dist = pos.distanceTo(iPos);
          if (dist < 40) {
            const heat = 1.0 - (dist / 40);
            const heatColor = new THREE.Color().lerpColors(new THREE.Color(0xffff00), new THREE.Color(0xff0000), heat);
            finalShirtColor = heatColor.getHex();
          }
        }
      }

      let isCleared = false;
      if (activeIncident?.zone_id === 'zone_2') {
        const incidentPos = new THREE.Vector3(-140, 15, 0);
        if (pos.distanceTo(incidentPos) < 22) {
          isCleared = true;
        }
      }

      if (isCleared) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        torsosRef.current!.setMatrixAt(i, dummy.matrix);
        headsRef.current!.setMatrixAt(i, dummy.matrix);
        hairsRef.current!.setMatrixAt(i, dummy.matrix);
        legsRef.current!.setMatrixAt(i * 2, dummy.matrix);
        legsRef.current!.setMatrixAt(i * 2 + 1, dummy.matrix);
        hatsRef.current!.setMatrixAt(i, dummy.matrix);
        backpacksRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // Torso (Lowered to look seated)
      dummy.position.set(pos.x, pos.y + 0.25 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h * 0.7, w); // Slightly squish height for seated posture
      dummy.updateMatrix();
      torsosRef.current!.setMatrixAt(i, dummy.matrix);
      torsosRef.current!.setColorAt(i, tempColor.setHex(finalShirtColor));

      // Head
      dummy.position.set(pos.x, pos.y + 0.55 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      headsRef.current!.setMatrixAt(i, dummy.matrix);
      headsRef.current!.setColorAt(i, tempColor.setHex(skinColor));

      // Hair
      dummy.position.set(pos.x, pos.y + 0.68 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      hairsRef.current!.setMatrixAt(i, dummy.matrix);
      hairsRef.current!.setColorAt(i, tempColor.setHex(hairColor));

      // Seated spectators have legs, hats, and backpacks hidden to optimize geometry overhead
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      legsRef.current!.setMatrixAt(i * 2, dummy.matrix);
      legsRef.current!.setMatrixAt(i * 2 + 1, dummy.matrix);
      hatsRef.current!.setMatrixAt(i, dummy.matrix);
      backpacksRef.current!.setMatrixAt(i, dummy.matrix);
    });

    // 2. Gate queue transforms (Indices start after Seated + Concourse walkers)
    gateQueueEntities.forEach((spec, k) => {
      const idx = SEATED_COUNT + CONCOURSE_COUNT + k;
      const { position: pos, attrs, theta } = spec;
      const { height, bodyWidth, skinColor, hairColor, shirtColor, pantsColor, hasHat, hasBackpack } = attrs;

      const h = height * 0.9;
      const w = bodyWidth * 0.9;

      let finalShirtColor = shirtColor;
      if (activeIncident && activeIncident.severity === 'critical') {
        const iPos = ZONE_POSITIONS[activeIncident.zone_id];
        if (iPos) {
          const dist = pos.distanceTo(iPos);
          if (dist < 40) {
            const heat = 1.0 - (dist / 40);
            const heatColor = new THREE.Color().lerpColors(new THREE.Color(0xffff00), new THREE.Color(0xff0000), heat);
            finalShirtColor = heatColor.getHex();
          }
        }
      }

      // Torso
      dummy.position.set(pos.x, pos.y + 0.55 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      torsosRef.current!.setMatrixAt(idx, dummy.matrix);
      torsosRef.current!.setColorAt(idx, tempColor.setHex(finalShirtColor));

      // Head
      dummy.position.set(pos.x, pos.y + 0.88 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      headsRef.current!.setMatrixAt(idx, dummy.matrix);
      headsRef.current!.setColorAt(idx, tempColor.setHex(skinColor));

      // Hair
      dummy.position.set(pos.x, pos.y + 1.01 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      hairsRef.current!.setMatrixAt(idx, dummy.matrix);
      hairsRef.current!.setColorAt(idx, tempColor.setHex(hairColor));

      // Legs (Gate Queues are standing, show legs)
      let rx = -0.04 * w * Math.cos(theta);
      let ry = 0.2 * h;
      let rz = 0.04 * w * Math.sin(theta);
      dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      legsRef.current!.setMatrixAt(idx * 2, dummy.matrix);
      legsRef.current!.setColorAt(idx * 2, tempColor.setHex(pantsColor));

      rx = 0.04 * w * Math.cos(theta);
      ry = 0.2 * h;
      rz = -0.04 * w * Math.sin(theta);
      dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      legsRef.current!.setMatrixAt(idx * 2 + 1, dummy.matrix);
      legsRef.current!.setColorAt(idx * 2 + 1, tempColor.setHex(pantsColor));

      // Hat
      if (hasHat) {
        dummy.position.set(pos.x, pos.y + 1.05 * h, pos.z);
        dummy.rotation.set(0, theta, 0);
        dummy.scale.set(h, h, h);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      hatsRef.current!.setMatrixAt(idx, dummy.matrix);
      hatsRef.current!.setColorAt(idx, tempColor.setHex(hairColor));

      // Backpack
      if (hasBackpack) {
        rx = -0.08 * w * Math.sin(theta);
        ry = 0.55 * h;
        rz = -0.08 * w * Math.cos(theta);
        dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
        dummy.rotation.set(0, theta, 0);
        dummy.scale.set(w, h, w);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      backpacksRef.current!.setMatrixAt(idx, dummy.matrix);
      backpacksRef.current!.setColorAt(idx, tempColor.setHex(0x222222));
    });

    // 3. Initialize concourse walkers initial colors
    concourseEntities.forEach((spec, localIdx) => {
      if (torsosDynamicRef.current) {
        torsosDynamicRef.current.setColorAt(localIdx, tempColor.setHex(spec.attrs.shirtColor));
        headsDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(spec.attrs.skinColor));
        hairsDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(spec.attrs.hairColor));
        legsDynamicRef.current!.setColorAt(localIdx * 2, tempColor.setHex(spec.attrs.pantsColor));
        legsDynamicRef.current!.setColorAt(localIdx * 2 + 1, tempColor.setHex(spec.attrs.pantsColor));
        if (spec.attrs.hasHat) {
          hatsDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(spec.attrs.hairColor));
        } else {
          // Set it to a transparent color or keep it 0 scale (which useFrame handles)
          hatsDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(0x000000));
        }
        if (spec.attrs.hasBackpack) {
          backpacksDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(0x222222));
        } else {
          backpacksDynamicRef.current!.setColorAt(localIdx, tempColor.setHex(0x000000));
        }
      }
    });

    if (torsosRef.current) torsosRef.current.instanceMatrix.needsUpdate = true;
    if (headsRef.current) headsRef.current.instanceMatrix.needsUpdate = true;
    if (hairsRef.current) hairsRef.current.instanceMatrix.needsUpdate = true;
    if (legsRef.current) legsRef.current.instanceMatrix.needsUpdate = true;
    if (hatsRef.current) hatsRef.current.instanceMatrix.needsUpdate = true;
    if (backpacksRef.current) backpacksRef.current.instanceMatrix.needsUpdate = true;

    if (torsosDynamicRef.current) {
      torsosDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (torsosDynamicRef.current.instanceColor) torsosDynamicRef.current.instanceColor.needsUpdate = true;
    }
    if (headsDynamicRef.current) {
      headsDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (headsDynamicRef.current.instanceColor) headsDynamicRef.current.instanceColor.needsUpdate = true;
    }
    if (hairsDynamicRef.current) {
      hairsDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (hairsDynamicRef.current.instanceColor) hairsDynamicRef.current.instanceColor.needsUpdate = true;
    }
    if (legsDynamicRef.current) {
      legsDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (legsDynamicRef.current.instanceColor) legsDynamicRef.current.instanceColor.needsUpdate = true;
    }
    if (hatsDynamicRef.current) {
      hatsDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (hatsDynamicRef.current.instanceColor) hatsDynamicRef.current.instanceColor.needsUpdate = true;
    }
    if (backpacksDynamicRef.current) {
      backpacksDynamicRef.current.instanceMatrix.needsUpdate = true;
      if (backpacksDynamicRef.current.instanceColor) backpacksDynamicRef.current.instanceColor.needsUpdate = true;
    }

    if (torsosRef.current && torsosRef.current.instanceColor) torsosRef.current.instanceColor.needsUpdate = true;
    if (headsRef.current && headsRef.current.instanceColor) headsRef.current.instanceColor.needsUpdate = true;
    if (hairsRef.current && hairsRef.current.instanceColor) hairsRef.current.instanceColor.needsUpdate = true;
    if (legsRef.current && legsRef.current.instanceColor) legsRef.current.instanceColor.needsUpdate = true;
    if (hatsRef.current && hatsRef.current.instanceColor) hatsRef.current.instanceColor.needsUpdate = true;
    if (backpacksRef.current && backpacksRef.current.instanceColor) backpacksRef.current.instanceColor.needsUpdate = true;
  }, [seatedSpectators, gateQueueEntities, activeIncident]);

  // Pre-allocate to prevent garbage collection spikes inside useFrame
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dirCache = useMemo(() => new THREE.Vector3(), []);

  // Update concourse walker positions and write transforms inside R3F frame loop
  useFrame((state, delta) => {
    if (
      !torsosRef.current ||
      !headsRef.current ||
      !hairsRef.current ||
      !legsRef.current ||
      !hatsRef.current ||
      !backpacksRef.current ||
      !torsosDynamicRef.current ||
      !headsDynamicRef.current ||
      !hairsDynamicRef.current ||
      !legsDynamicRef.current ||
      !hatsDynamicRef.current ||
      !backpacksDynamicRef.current
    ) {
      return;
    }

    const timeMultiplier = 1.0 + (predictiveTimeOffset > 0 ? (predictiveTimeOffset / 60) * 15 : 0);
    const step = Math.min(delta, 0.1) * timeMultiplier;

    const SEATED_COUNT = seatedSpectators.length;

    concourseEntities.forEach((e, localIdx) => {
      const target = concoursePath[e.targetIdx];
      dirCache.subVectors(target, e.position);
      const dist = dirCache.length();

      let theta = Math.atan2(dirCache.x, dirCache.z);
      if (dist < 1.0) {
        e.targetIdx = (e.targetIdx + 1) % concoursePath.length;
      } else {
        const runMultiplier = activeIncident?.zone_id === 'zone_3' ? 2.8 : 1.0;
        dirCache.normalize().multiplyScalar(e.speed * runMultiplier * step * 60);
        e.position.add(dirCache);
      }


      // Write walker transforms dynamically to the instanced buffers
      const idx = SEATED_COUNT + localIdx;
      const pos = e.position;
      const attrs = e.attrs;
      const h = attrs.height * 0.9;
      const w = attrs.bodyWidth * 0.9;

      // 1. Torso
      dummy.position.set(pos.x, pos.y + 0.55 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      torsosDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);

      // 2. Head
      dummy.position.set(pos.x, pos.y + 0.88 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      headsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);

      // 3. Hair
      dummy.position.set(pos.x, pos.y + 1.01 * h, pos.z);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(h, h, h);
      dummy.updateMatrix();
      hairsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);

      // 4. Legs
      let rx = -0.04 * w * Math.cos(theta);
      let ry = 0.2 * h;
      let rz = 0.04 * w * Math.sin(theta);
      dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      legsDynamicRef.current!.setMatrixAt(localIdx * 2, dummy.matrix);

      rx = 0.04 * w * Math.cos(theta);
      ry = 0.2 * h;
      rz = -0.04 * w * Math.sin(theta);
      dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      legsDynamicRef.current!.setMatrixAt(localIdx * 2 + 1, dummy.matrix);

      // 5. Hat
      if (attrs.hasHat) {
        dummy.position.set(pos.x, pos.y + 1.05 * h, pos.z);
        dummy.rotation.set(0, theta, 0);
        dummy.scale.set(h, h, h);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      hatsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);

      // 6. Backpack
      if (attrs.hasBackpack) {
        rx = -0.08 * w * Math.sin(theta);
        ry = 0.55 * h;
        rz = -0.08 * w * Math.cos(theta);
        dummy.position.set(pos.x + rx, pos.y + ry, pos.z + rz);
        dummy.rotation.set(0, theta, 0);
        dummy.scale.set(w, h, w);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      backpacksDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);
    });

    if (torsosDynamicRef.current) torsosDynamicRef.current.instanceMatrix.needsUpdate = true;
    if (headsDynamicRef.current) headsDynamicRef.current.instanceMatrix.needsUpdate = true;
    if (hairsDynamicRef.current) hairsDynamicRef.current.instanceMatrix.needsUpdate = true;
    if (legsDynamicRef.current) legsDynamicRef.current.instanceMatrix.needsUpdate = true;
    if (hatsDynamicRef.current) hatsDynamicRef.current.instanceMatrix.needsUpdate = true;
    if (backpacksDynamicRef.current) backpacksDynamicRef.current.instanceMatrix.needsUpdate = true;
  });

  // Expose statistics globally for the UI scoreboard HUD
  useEffect(() => {
    (window as any).spectatorStats = {
      seated: seatedSpectators.length,
      concourse: concourseEntities.length,
      gate: gateQueueEntities.length,
    };
  }, [seatedSpectators, concourseEntities, gateQueueEntities]);

  return (
    <group>
      {/* Seated + Walkers + Gate queues combined instanced meshes (uses optimized meshLambertMaterial) */}
      <instancedMesh ref={torsosRef} args={[undefined, undefined, 20000]} count={totalInstancesCount} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[0.2, 0.54, 0.1]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={headsRef} args={[undefined, undefined, 20000]} count={totalInstancesCount} castShadow frustumCulled={false}>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={hairsRef} args={[undefined, undefined, 20000]} count={totalInstancesCount} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.08, 0.26]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={legsRef} args={[undefined, undefined, 40000]} count={totalInstancesCount * 2} castShadow frustumCulled={false}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={hatsRef} args={[undefined, undefined, 20000]} count={totalInstancesCount} frustumCulled={false}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 8]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={backpacksRef} args={[undefined, undefined, 20000]} count={totalInstancesCount} castShadow frustumCulled={false}>
        <boxGeometry args={[0.18, 0.32, 0.08]} />
        <meshLambertMaterial />
      </instancedMesh>

      <PredictiveHeatmaps />
      <GhostCrowdSystem />
    </group>
  );
};

function PredictiveHeatmaps() {
  const predictions = useZoneStore(state => state.predictions)
  const offset = useZoneStore(state => state.predictiveTimeOffset)

  if (offset === 0) return null

  return (
    <>
      {predictions.filter(p => !p.resolved).map(p => {
        const pos = ZONE_POSITIONS[p.zone_id]
        if (!pos) return null
        return <HeatmapPlane key={p.id} pos={[pos.x, pos.y, pos.z]} severity={p.severity} />
      })}
    </>
  )
}

function HeatmapPlane({ pos, severity }: { pos: number[], severity: string }) {
  const planeRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (planeRef.current) {
      const t = state.clock.getElapsedTime()
      const scale = 1.0 + Math.sin(t * 2) * 0.1
      planeRef.current.scale.set(scale, scale, 1)
      if (planeRef.current.material) {
        (planeRef.current.material as any).opacity = 0.5 + Math.sin(t * 2) * 0.2
      }
    }
  })

  const color = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#eab308' : '#30d158'
  return (
    <mesh ref={planeRef} position={[pos[0], pos[1] + 0.5, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[22, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function GhostCrowdSystem() {
  const predictions = useZoneStore(state => state.predictions)
  const offset = useZoneStore(state => state.predictiveTimeOffset)
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const ghosts = useMemo(() => {
    if (offset === 0) return []
    const list: { pos: number[], color: string }[] = []
    predictions.filter(p => !p.resolved).forEach(p => {
      const pos = ZONE_POSITIONS[p.zone_id]
      if (!pos) return
      const count = p.severity === 'critical' ? 60 : 30
      for (let i = 0; i < count; i++) {
        list.push({
          pos: [pos.x + (Math.random() - 0.5) * 28, pos.y, pos.z + (Math.random() - 0.5) * 28],
          color: p.severity === 'critical' ? '#ef4444' : '#3b82f6'
        })
      }
    })
    return list
  }, [predictions, offset])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    ghosts.forEach((g, i) => {
      dummy.position.set(g.pos[0], g.pos[1] + 0.8, g.pos[2])
      dummy.scale.set(0.8, 1.6, 0.8)
      dummy.rotation.set(0, Math.random() * Math.PI, 0)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      meshRef.current!.setColorAt(i, color.set(g.color))
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [ghosts])

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const t = state.clock.getElapsedTime()
        // Subtle pulse to ghost crowd
        ; (meshRef.current.material as any).opacity = 0.25 + Math.sin(t * 3) * 0.1
    }
  })

  if (ghosts.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ghosts.length]} frustumCulled={false}>
      <boxGeometry args={[0.3, 1, 0.3]} />
      <meshBasicMaterial transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} wireframe={true} />
    </instancedMesh>
  )
}
