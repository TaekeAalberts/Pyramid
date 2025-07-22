"use client";

import {
    Center,
    Environment,
    Grid,
    useGLTF,
    useTexture,
    Lightformer,
    Float,
    shaderMaterial
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export interface PyramindProps {
    onSectionChange?: (index: number) => void;
}

export const Pyramind: React.FC<PyramindProps> = ({ onSectionChange }) => {
    return (
        <Canvas className="w-full h-full" camera={{ position: [0, 0.5, 10], fov: 75, zoom: 4 }}>
            <color attach="background" args={["#000"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.5} color={"#66ccff"} />
            <directionalLight position={[-5, 5, -2]} intensity={0.3} color={"#335577"} />
            <Center position={[0, -0.25, 0]}>
                <Model onSectionChange={onSectionChange} />
            </Center>
            <Environment environmentIntensity={1.0} frames={Infinity}>
                <Lightformers/>
            </Environment>
            <EffectComposer>
                <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={0.8} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
};

function Lightformers({ positions = [1, 0, 1, 0, 1, 0, 1, 0] }) {
    const group = useRef<any>(null);
    useFrame((_, delta) => {
        if (!group.current) return;
        group.current.position.z += delta * 10;
        if (group.current.position.z > 20) {
            group.current.position.z = -60;
        }
    });
    return (
        <>
            {/* Ceiling */}
            <Lightformer intensity={0.75} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <group rotation={[0, 0.5, 0]}>
                <group ref={group}>
                    {positions.map((x, i) => (
                        <Lightformer key={i} form="circle" intensity={2} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[3, 1, 1]} />
                    ))}
                </group>
                <group position={[0, 0, 0]}>
                    {positions.map((x, i) => (
                        <Lightformer key={`extra-${i}`} form="circle" intensity={2} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[3, 1, 1]} />
                    ))}
                </group>
            </group>
            {/* Sides */}
            <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
            <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
            <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
            {/* Accent (red) */}
            <Float speed={5} floatIntensity={2} rotationIntensity={2}>
                <Lightformer form="ring" color="red" intensity={1} scale={2} position={[-1, 2, -1]} target={[0, 0, 0]} />
            </Float>
        </>
    )
}

const EdgeShaderMaterial = shaderMaterial(
    { uTime: 0, color: new THREE.Color("#2080ff") },
    // Vertex Shader
    `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 color;
    varying vec3 vPosition;

    void main() {
        float beam = sin(vPosition.y * 10.0 - uTime * 5.0) * 0.5 + 0.5;
        float intensity = smoothstep(0.4, 0.5, beam);
        gl_FragColor = vec4(color * intensity, intensity);
    }
`
);
extend({ EdgeShaderMaterial });

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

    const edgeRefs = useRef<(any | null)[]>([]);

    useEffect(() => {
        if (!edgeRefs.current.length) {
            edgeRefs.current = refs.map(() => null);
        }
    }, [refs]);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        edgeRefs.current.forEach((ref) => {
            if (ref) ref.uTime = time;
        });
    });

    return (
        <group ref={groupRef}>
            {refs.map((ref, index) => (
                <group key={`pyramid-block-${index}`}>
                    <mesh 
                        scale={[1, 1, 1]}
                        geometry={nodes[(index + 1).toString()].geometry}
                        onPointerEnter={() => setTimeout(() => setHoverIndex(index), 100)}
                        onPointerLeave={() => setHoverIndex(-1)}
                        visible={false}
                    />
                    <group ref={ref} >

                        <lineSegments>
                            <edgesGeometry attach="geometry" args={[nodes[(index + 1).toString()].geometry]} />
                            {/* @ts-ignore */}
                            <edgeShaderMaterial ref={(el) => (edgeRefs.current[index] = el)}/>
                        </lineSegments>
                        <points geometry={nodes[(index + 1).toString()].geometry} scale={1.01}>
                            <shaderMaterial
                              attach="material"
                              depthTest={false}
                              args={[{
                                uniforms: {
                                  uColor: { value: new THREE.Color(hoverIndex === index ? "#ffffff" : "#00ccff") },
                                  uSize: { value: 0.15 },
                                },
                                vertexShader: `
                                  uniform float uSize;
                                  void main() {
                                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                                    gl_PointSize = uSize * (300.0 / -mvPosition.z);
                                    gl_Position = projectionMatrix * mvPosition;
                                  }
                                `,
                                fragmentShader: `
                                  uniform vec3 uColor;
                                  void main() {
                                    float dist = length(gl_PointCoord - vec2(0.5));
                                    if (dist > 0.5) discard;

                                    gl_FragColor = vec4(uColor, 1.0 - smoothstep(0.45, 0.5, dist));
                                  }
                                `,
                                transparent: true,
                                depthWrite: false,
                              }]}
                            />
                        </points>
                        <mesh geometry={nodes[(index + 1).toString()].geometry}>
                            <meshPhysicalMaterial
                                roughness={0.3}
                                thickness={0.15}
                                ior={1.4}
                                anisotropy={0.0}
                                clearcoat={1.0}
                                depthWrite={hoverIndex >= index}
                                clearcoatRoughness={1.0}
                                color={hoverIndex >= index ? "#01B9F1" : "#0089CC"}
                                transparent
                                reflectivity={0.8}
                                opacity={hoverIndex >= index ? 1.0 : 0.4}
                            />
                        </mesh>
                    </group>
                    <sprite position={[0, index/2 + 0.25, 0.01]} scale={[0.2, 0.2, 0.2]}
                        renderOrder={100}
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
