import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, InstancedMesh, Object3D, AdditiveBlending, PointLight } from 'three';
import { useZoneStore } from '@/store/useZoneStore';

export function FireEffect() {
  const activeIncident = useZoneStore(state => state.activeIncident);
  const meshRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<PointLight>(null);
  
  const particleCount = 200;
  const dummy = useMemo(() => new Object3D(), []);
  
  // Pre-calculate particle properties
  const particles = useMemo(() => {
    return new Array(particleCount).fill(0).map(() => ({
      position: new Vector3(
        (Math.random() - 0.5) * 12, // x spread
        Math.random() * 5,          // start y
        (Math.random() - 0.5) * 12  // z spread
      ),
      velocity: new Vector3(
        (Math.random() - 0.5) * 2.0,
        Math.random() * 15 + 5,      // upward speed
        (Math.random() - 0.5) * 2.0
      ),
      scale: Math.random() * 2.5 + 1.0,
      life: Math.random() * 100,
      color: Math.random() > 0.5 ? '#ef4444' : '#f97316' // Mix of red and orange
    }));
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!meshRef.current || activeIncident?.zone_id !== 'zone_3') return;
    
    const t = state.clock.getElapsedTime();
    
    // Flicker the point light
    if (lightRef.current) {
      lightRef.current.intensity = 1500 + Math.sin(t * 30) * 500 + Math.cos(t * 15) * 200;
    }
    
    particles.forEach((p, i) => {
      p.life += delta * 60;
      
      // Float upwards with wind drift
      p.position.y += p.velocity.y * delta;
      p.position.x += p.velocity.x * delta + Math.sin(t * 5 + p.life * 0.1) * 0.1;
      p.position.z += p.velocity.z * delta + Math.cos(t * 4 + p.life * 0.1) * 0.1;
      
      // Reset particle at bottom if it goes too high (smoke height)
      if (p.position.y > 25) {
        p.position.y = Math.random() * 2;
        p.position.x = (Math.random() - 0.5) * 12;
        p.position.z = (Math.random() - 0.5) * 12;
      }
      
      // Particle gets smaller as it rises
      const heightPercent = p.position.y / 25;
      const currentScale = p.scale * Math.max(0, 1 - heightPercent);
      
      dummy.position.copy(p.position);
      dummy.scale.setScalar(currentScale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Only render for Concourse North Fire Alarm (zone_3)
  if (activeIncident?.zone_id !== 'zone_3') return null;

  return (
    <group position={[0, 0, -145]}>
      {/* Huge Dynamic Fire Glow Light */}
      <pointLight ref={lightRef} color="#ff3300" distance={100} intensity={2000} position={[0, 5, 0]} />
      
      {/* Core Heat Ball */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#ff1100" transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      
      {/* Volumetric Fire Particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial 
          color="#ff5500"
          transparent 
          opacity={0.6} 
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
