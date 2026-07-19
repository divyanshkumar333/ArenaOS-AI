const fs = require('fs');

let content = fs.readFileSync('src/components/CrowdSystem.tsx', 'utf8');

// 1. Replace the single refs with dynamic + static
content = content.replace(
  /const torsosRef = useRef<THREE.InstancedMesh>\(null\);/g,
  `const torsosRef = useRef<THREE.InstancedMesh>(null);\n  const headsRef = useRef<THREE.InstancedMesh>(null);\n  const hairsRef = useRef<THREE.InstancedMesh>(null);\n  const legsRef = useRef<THREE.InstancedMesh>(null);\n  const hatsRef = useRef<THREE.InstancedMesh>(null);\n  const backpacksRef = useRef<THREE.InstancedMesh>(null);\n\n  const torsosDynamicRef = useRef<THREE.InstancedMesh>(null);\n  const headsDynamicRef = useRef<THREE.InstancedMesh>(null);\n  const hairsDynamicRef = useRef<THREE.InstancedMesh>(null);\n  const legsDynamicRef = useRef<THREE.InstancedMesh>(null);\n  const hatsDynamicRef = useRef<THREE.InstancedMesh>(null);\n  const backpacksDynamicRef = useRef<THREE.InstancedMesh>(null);`
);
content = content.replace(/const headsRef.*?;\n\s*const hairsRef.*?;\n\s*const legsRef.*?;\n\s*const hatsRef.*?;\n\s*const backpacksRef.*?;/s, '');

// 2. In useFrame, replace torsosRef -> torsosDynamicRef and localIdx mapping
content = content.replace(/torsosRef\.current!\.setMatrixAt\(idx, dummy\.matrix\);/g, 'torsosDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);');
content = content.replace(/headsRef\.current!\.setMatrixAt\(idx, dummy\.matrix\);/g, 'headsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);');
content = content.replace(/hairsRef\.current!\.setMatrixAt\(idx, dummy\.matrix\);/g, 'hairsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);');
content = content.replace(/legsRef\.current!\.setMatrixAt\(idx \* 2, dummy\.matrix\);/g, 'legsDynamicRef.current!.setMatrixAt(localIdx * 2, dummy.matrix);');
content = content.replace(/legsRef\.current!\.setMatrixAt\(idx \* 2 \+ 1, dummy\.matrix\);/g, 'legsDynamicRef.current!.setMatrixAt(localIdx * 2 + 1, dummy.matrix);');
content = content.replace(/hatsRef\.current!\.setMatrixAt\(idx, dummy\.matrix\);/g, 'hatsDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);');
content = content.replace(/backpacksRef\.current!\.setMatrixAt\(idx, dummy\.matrix\);/g, 'backpacksDynamicRef.current!.setMatrixAt(localIdx, dummy.matrix);');

content = content.replace(/torsosRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'torsosDynamicRef.current.instanceMatrix.needsUpdate = true;');
content = content.replace(/headsRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'headsDynamicRef.current.instanceMatrix.needsUpdate = true;');
content = content.replace(/hairsRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'hairsDynamicRef.current.instanceMatrix.needsUpdate = true;');
content = content.replace(/legsRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'legsDynamicRef.current.instanceMatrix.needsUpdate = true;');
content = content.replace(/hatsRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'hatsDynamicRef.current.instanceMatrix.needsUpdate = true;');
content = content.replace(/backpacksRef\.current\.instanceMatrix\.needsUpdate = true;/g, 'backpacksDynamicRef.current.instanceMatrix.needsUpdate = true;');

content = content.replace(/!torsosRef\.current \|\| !headsRef\.current \|\| !hairsRef\.current \|\| !legsRef\.current \|\| !hatsRef\.current \|\| !backpacksRef\.current/, '!torsosDynamicRef.current || !headsDynamicRef.current || !hairsDynamicRef.current || !legsDynamicRef.current || !hatsDynamicRef.current || !backpacksDynamicRef.current');

// 3. Initialize colors for dynamic entities in useEffect
content = content.replace(/concourseEntities\.forEach\(\(spec, k\) => \{\n\s*const idx = SEATED_COUNT \+ k;/g, 'concourseEntities.forEach((spec, k) => {\n        const idx = k; // dynamic idx\n        if (torsosDynamicRef.current) {\n          torsosDynamicRef.current.setColorAt(idx, colorTemp.set(spec.attrs.shirtColor));\n          headsDynamicRef.current!.setColorAt(idx, colorTemp.set(spec.attrs.skinColor));\n          hairsDynamicRef.current!.setColorAt(idx, colorTemp.set(spec.attrs.hairColor));\n          legsDynamicRef.current!.setColorAt(idx * 2, colorTemp.set(spec.attrs.pantsColor));\n          legsDynamicRef.current!.setColorAt(idx * 2 + 1, colorTemp.set(spec.attrs.pantsColor));\n          if (spec.attrs.hasHat) hatsDynamicRef.current!.setColorAt(idx, colorTemp.set(spec.attrs.hatColor));\n          if (spec.attrs.hasBackpack) backpacksDynamicRef.current!.setColorAt(idx, colorTemp.set(spec.attrs.backpackColor));\n        }\n      });\n      // Old code skipped: concourseEntities.forEach((spec, k) => {');

// 4. Update the JSX blocks to render both Sets
const jsxDynamic = `
      {/* Dynamic Walkers */}
      <instancedMesh ref={torsosDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.54, 0.1]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={headsDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS]} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={hairsDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS]}>
        <boxGeometry args={[0.26, 0.08, 0.26]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={legsDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS * 2]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={hatsDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS]}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 8]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={backpacksDynamicRef} args={[undefined, undefined, CONCOURSE_WALKERS]} castShadow>
        <boxGeometry args={[0.18, 0.32, 0.08]} />
        <meshLambertMaterial />
      </instancedMesh>
`;
content = content.replace(/<\/instancedMesh>\s*<\/group>/, `</instancedMesh>\n${jsxDynamic}\n    </group>`);


fs.writeFileSync('src/components/CrowdSystem.tsx', content);
