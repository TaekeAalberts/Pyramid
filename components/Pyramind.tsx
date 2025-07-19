"use client";

import {
    Center,
    Environment,
    Grid,
    useGLTF,
    useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface PyramindProps {
  onSectionChange?: (index: number) => void;
}

export const Pyramind: React.FC<PyramindProps> = ({ onSectionChange }) => {
    return (
        <Canvas className="w-full h-full" camera={{ position: [0, 0.5, 10], fov: 22 }}>
            <color attach="background" args={["#000"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} color={"#66ccff"} />
            <directionalLight position={[-5, 5, -2]} intensity={0.3} color={"#335577"} />
            {/* <OrbitControls/> */}
            <Center position={[0, -0.25, 0]}>
                <Model onSectionChange={onSectionChange} />
            </Center>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr" environmentIntensity={1.0}/>
            <EffectComposer>
                <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1.5} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
};

const Model : React.FC<PyramindProps> = ({onSectionChange}) => {
    const { nodes } = useGLTF("/Pyramind.glb") as any;
    const refs = [
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
    ];
    const [hoverIndex, setHoverIndex] = useState<number>(-1);

    useEffect(() => {
        onSectionChange?.(hoverIndex);
    }, [hoverIndex, onSectionChange]);

    const groupRef = useRef<THREE.Group>(null);
    const pieceHeight = 2 / 4;

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
        }

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

    const maps = useTexture(["/group.svg",  "/package.svg", "/gear.svg", "/euro.svg"]);
    const circleTexture = useTexture("/circle.png");

    return (
        <group ref={groupRef}>
            {refs.map((ref, index) => (
                <group key={`pyramid-block-${index}`}>
                    <mesh 
                        scale={[1, 1, 1]}
                        geometry={nodes[(index + 1).toString()].geometry}
                        onPointerOver={() => setHoverIndex(index)}
                        onPointerLeave={() => setHoverIndex(-1)}
                        visible={false}
                    />
              <group ref={ref}>
                    <points geometry={nodes[(index + 1).toString()].geometry} scale={1.01}>
                      <pointsMaterial
                        size={0.09}
                        sizeAttenuation
                        map={circleTexture}
                        transparent
                        alphaTest={0.5}
                        color={hoverIndex === index ? "#00ffff" : "#00ccff"}
                      />
                    </points>
                      <mesh
                          geometry={nodes[(index + 1).toString()].geometry}
                      >
                          <meshPhysicalMaterial
                              roughness={0.3}
                              thickness={0.15}
                              ior={1.4}
                              anisotropy={0.0}
                              clearcoat={1.0}
                              clearcoatRoughness={1.0}
                              color={hoverIndex >= index ? "#01B9F1" : "#0089CC"}
                              transparent
                              reflectivity={0.8}
                              opacity={hoverIndex >= index ? 1.0 : 0.4}
                          />
                      </mesh>
                    </group>
                    <sprite position={[0, index/2 + 0.25, 0]} scale={[0.2, 0.2, 0.2]}
                        onClick={() => window.open("https://fmis.aalberts-kara.de/fmis-finanzen", '_blank')}
                        onPointerOver={() => document.body.style.cursor = "pointer"}
                        onPointerLeave={() => document.body.style.cursor = "default"}
                    >
                        <spriteMaterial map={maps[index]} color={"white"} transparent/>
                    </sprite> 
                </group>
            ))}
            <Grid
                infiniteGrid
                cellThickness={4.0}
                fadeStrength={8.0}
                fadeDistance={50}
            />
        </group>
    );
};
