'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/hardware.glb');

function Model() {
  const { scene } = useGLTF('/hardware.glb');
  const groupRef  = useRef();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!scene) return;
    const cloned = scene.clone(true);
    const box    = new THREE.Box3().setFromObject(cloned);
    const size   = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) setScale(2.2 / maxDim);
  }, [scene]);

  return (
    <group ref={groupRef} scale={scale}>
      <Center>
        <primitive object={scene} dispose={null} />
      </Center>
    </group>
  );
}

function WireframePlaceholder() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.9, 1.4, 0.25]} />
        <meshStandardMaterial color="#4ADE80" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#4ADE80" wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function HardwareViewer() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.4, 4], fov: 38 }}
      style={{ background: 'transparent', touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4,  6,  5]} intensity={1.6} />
      <directionalLight position={[-4, -3, -4]} intensity={0.35} color="#4ADE80" />
      <pointLight        position={[0,  4,  0]} intensity={0.5}  color="#ffffff"  />
      <spotLight
        position={[2, 5, 3]}
        angle={0.35}
        penumbra={0.5}
        intensity={1.2}
        castShadow={false}
      />
      <Suspense fallback={<WireframePlaceholder />}>
        <Model />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={1.4}
        minDistance={2}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.78}
        dampingFactor={0.06}
        enableDamping={true}
      />
    </Canvas>
  );
}