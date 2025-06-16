"use client";

import {
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export const Pyramind = () => {
  return (
    <Canvas className="w-full h-full" camera={{ position: [0, 2, 5], fov: 45 }}>
      <color attach="background" args={["#050510"]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color={"#00ffff"} />
      <directionalLight position={[-5, -5, -2]} intensity={0.4} color={"#ff00ff"} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
      <Model />
      <Environment files="/moonless_golf_2k.hdr"  />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.1} />
      </EffectComposer>
    </Canvas>
  );
};

const Model = () => {
  const { nodes } = useGLTF("/Pyramind.glb") as any;
  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pieceHeight = 2 / 4;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Floating oscillation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t) * 0.05;
    }

    // Piece animation
    refs.forEach((ref, index) => {
      const mesh = ref.current;
      if (!mesh) return;

      let offset = 0;
      if (hoverIndex !== null && index <= hoverIndex) {
        offset = pieceHeight;
      }

      const targetY = offset;
      const targetRot = offset > 0 ? Math.PI * 0.25 : 0;

      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.1);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRot, 0.1);
    });
  });

  useEffect(() => {
    for (let i = 0; i < 4; i++) {
      const geom = nodes[(i + 1).toString()].geometry;
      geom.computeBoundingBox();
      geom.boundingBox?.expandByScalar(2.5);
    }
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {refs.map((ref, index) => (
        <mesh
          key={index}
          ref={ref}
          geometry={nodes[(index + 1).toString()].geometry}
          onPointerEnter={() => setHoverIndex(index)}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <MeshTransmissionMaterial
            thickness={1.2}
            backsideThickness={2.5}
            roughness={0}
            chromaticAberration={0.2}
            anisotropy={0.5}
            distortion={0.1}
            transmission={1}
            iridescence={1}
            iridescenceIOR={1.3}
            color={"#00e0ff"}
          />
        </mesh>
      ))}
    </group>
  );
};
