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
            <color attach="background" args={["#efefef"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} color={"#66ccff"} />
            <directionalLight position={[-5, 5, -2]} intensity={0.3} color={"#335577"} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
            <Model />
            <Environment files="/moonless_golf_2k.hdr"  />
            {/* <EffectComposer> */}
            {/*     <Bloom intensity={1.2} luminanceThreshold={0.1} /> */}
            {/* </EffectComposer> */}
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

            // mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.1);
            // mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRot, 0.1);
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
                <group key={index}>
                    <mesh 
                        scale={[2, 1, 2]}
                        geometry={nodes[(index + 1).toString()].geometry}
                        onPointerEnter={() => setHoverIndex(index)}
                        onPointerLeave={() => setHoverIndex(null)}
                        visible={false}
                    >
                        {/* <meshNormalMaterial/> */}
                    </mesh>
                    <mesh
                        ref={ref}
                        geometry={nodes[(index + 1).toString()].geometry}
                    >
                        <meshStandardMaterial
                            color={hoverIndex === index ? "#66ccff" : "#0a2940"}
                            transparent
                            opacity={0.9}
                            roughness={0.4}
                            metalness={0.1}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
};
