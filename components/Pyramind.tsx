"use client";

import {
    Center,
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
        <Canvas className="w-full h-full" camera={{ position: [0, 0.5, 10], fov: 75, zoom: 4 }}>
            <color attach="background" args={["#000"]} />
            <Center position={[0, -0.25, 0]}>
                <Model onSectionChange={onSectionChange} />
            </Center>
            <EffectComposer>
                <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={0.8} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
};

const vertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

void main() {
  vNormal = normalMatrix * normal;
  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-viewPos.xyz);
  vPosition = position;

  gl_Position = projectionMatrix * viewPos;
}
`;

const fragmentShader = `
    uniform bool uIsHover;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vec3 blue = vec3(0.0, 0.0, 1.0);
      vec3 lightBlue = vec3(0.0, 0.1, 0.8);

      float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), 2.0);
      float anim = sin(uTime * 2.0 + vPosition.y * 5.0) * 0.5 + 0.5;

      float upFacing = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
      if (uIsHover) {
          vec3 glow = mix(lightBlue, vec3(0.2, 0.8, 1.0), fresnel * anim);
          if (upFacing > 0.7) {
              gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), 1.0);
          } else {
              gl_FragColor = vec4(glow, 1.0);
          }
      } else {
          if (upFacing > 0.7) discard;
          vec3 glow = mix(blue, vec3(0.2, 0.8, 1.0), fresnel * anim);
          gl_FragColor = vec4(glow, 0.4);
      }
    }
`;

const Model : React.FC<PyramindProps> = ({onSectionChange}) => {
    const { nodes } = useGLTF("/Pyramind.glb") as any;
    const refs = [
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
        useRef<THREE.Mesh>(null),
    ];

    const [hoverAnimatedFactor, setHoverAnimatedFactor] = useState<number>(0);
    const [hoverIndex, setHoverIndex] = useState<number>(-1);

    const baseColor  = new THREE.Color("#2080ff");
    const hoverColor = new THREE.Color("#ffffff");
    const activeGridColor = baseColor;
    const gridRef  = useRef<any>(null);

    useEffect(() => {
        onSectionChange?.(hoverIndex);
    }, [hoverIndex, onSectionChange]);

    const groupRef = useRef<THREE.Group>(null);
    const pieceHeight = 2 / 4;

    const lerp = (x: number, y: number, t: number): number => x + (y - x) * t;

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
        }
        if (gridRef.current) {
            if (hoverIndex >= 0) {
                setHoverAnimatedFactor(lerp(hoverAnimatedFactor, 1.0, 0.1));
                activeGridColor.lerp(hoverColor, 0.1);
            } else {
                setHoverAnimatedFactor(lerp(hoverAnimatedFactor, 0.0, 0.1));
                activeGridColor.lerp(baseColor, 0.01);
            }
            gridRef.current.material.uniforms.cellColor.value = activeGridColor;
            gridRef.current.material.uniforms.sectionColor.value = activeGridColor;
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

    const maps = useTexture(["/group.svg",  "/gear.svg", "/package.svg", "/euro.svg"]);
    const links = [
        "https://fmis.aalberts-kara.de/fdd/ressourcen/",
        "https://fmis.aalberts-kara.de/fdd/interne-prozesse/",
        "https://fmis.aalberts-kara.de/fdd/produkt/",
        "https://fmis.aalberts-kara.de/fdd/finanzen/",
    ];

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();

        refs.map(ref => {
            ref.current && ref.current.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material.uniforms.uTime.value = time;
                }
            });
        });
    });

    return (
        <group ref={groupRef}>
            {refs.map((ref, index) => (
                <group key={`pyramid-block-${index}`}>
                    <mesh 
                        scale={[1, 1, 1]}
                        geometry={nodes[(index + 1).toString()].geometry}
                        onPointerMove={() => setHoverIndex(index)}
                        onPointerLeave={() => setHoverIndex(-1)}
                        visible={false}
                    />
                    <group ref={ref} >
                        <mesh geometry={nodes[(index + 1).toString()].geometry}>
                            <shaderMaterial
                                args={[{
                                    uniforms: {
                                        uIsHover: { value: hoverIndex >= 0 },
                                        uTime: { value: 0 },
                                    },
                                    vertexShader: vertexShader,
                                    fragmentShader: fragmentShader,
                                }]}
                                transparent
                                depthWrite={hoverIndex >= 0}
                                blending={THREE.NormalBlending}
                            />
                        </mesh>
                        <lineSegments depthWrite={true}>
                            <edgesGeometry args={[nodes[(index + 1).toString()].geometry]} attach="geometry"/>
                            <lineBasicMaterial color="white" transparent opacity={0.2}/>
                        </lineSegments>
                    </group>
                    <sprite
                        position={[0, index/2 + 0.25, 0.01]} 
                        name={`sprite-${index}`}
                        // scale={[0.2, 0.2, 0.2]}
                        scale={[
                            (hoverAnimatedFactor * 0.1) + 0.2,
                            (hoverAnimatedFactor * 0.1) + 0.2,
                            (hoverAnimatedFactor * 0.1) + 0.2,
                        ]}
                        renderOrder={100}
                        onClick={() => window.open(links[index], "__blank")}
                        onPointerOver={() => document.body.style.cursor = "pointer"}
                        onPointerLeave={() => document.body.style.cursor = "default"}
                    >
                        <spriteMaterial map={maps[index]} color={hoverIndex >= 0 ? "#2080ff" : "white"} transparent/>
                    </sprite> 
                </group>
            ))}
            <Grid
                ref={gridRef}
                cellColor={baseColor}
                infiniteGrid
                cellThickness={3.0}
                fadeStrength={8.0}
                fadeDistance={50}
            />
        </group>
    );
};
