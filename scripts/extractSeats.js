// scripts/extractSeats.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { join } from 'path';
import { writeFileSync } from 'fs';

const modelPath = join(__dirname, '..', 'frontend', 'public', 'models', 'modern_stadium_optimized.glb');
const loader = new GLTFLoader();

loader.load(
  modelPath,
  (gltf) => {
    const seats = [];
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && /seat/i.test(obj.name)) {
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        const worldQuat = new THREE.Quaternion();
        obj.getWorldQuaternion(worldQuat);
        const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat);
        seats.push({ name: obj.name, position: worldPos.toArray(), rotation: worldQuat.toArray(), normal: normal.toArray() });
      }
    });
    const result = { seatCount: seats.length, seats };
    const outPath = join(__dirname, '..', 'frontend', 'seats_extracted.json');
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log('Extracted seats:', seats.length);
  },
  undefined,
  (err) => {
    console.error('Failed to load model', err);
  }
);
