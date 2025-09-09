"use client";

import {
    Center,
    useGLTF,
    useTexture,
    PerspectiveCamera,
    Clouds, Cloud,
    Loader,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
    useRef,
    useEffect,
    useMemo,
    Suspense
} from "react";
import * as THREE from "three";

export interface Section {
    name: string;
    desc: string;
    link: string;
    icon: string;
}

export interface PyramindProps {
    onSectionChange: (index: number|null) => void;
    sections: Section[];
}

function ResponsiveElements() {
    const { camera, size } = useThree();

    useEffect(() => {
        const aspect = size.width / size.height;

        // Adjust FOV dynamically for ultrawide
        if (aspect > 3) { // ultrawide (e.g. 32:9)
            //@ts-ignore
            camera.fov = 40; // widen FOV
            camera.position.z = 16;
        } else if (size.width < 768) {
            //@ts-ignore
            camera.fov = 50;
            camera.position.z = 18;
        } else {
            //@ts-ignore
            camera.fov = 75;
            camera.position.z = 10;
        }

        camera.updateProjectionMatrix();
    }, [size, camera]);

    return <Background/>;
}


function CloudBackground() {
    // Explicit type for refs (nullable until mounted)
    const cloudRefs = useRef<(THREE.Object3D | null)[]>([]);

    // Directions with x/y speeds for each cloud
    const directions = useRef<{ x: number; y: number }[]>([
        { x: 0.3, y: 0.05 },
        { x: -0.25, y: 0.04 },
        { x: 0.2, y: 0.03 },
    ]);

    const cloudElements = useMemo(
        () => (
            <Clouds material={THREE.MeshStandardMaterial} position={[0, 8, -40]}>
                <Cloud
                    // Type narrowing: THREE.Object3D | null
                    // @ts-ignore
                    ref={(el) => (cloudRefs.current[0] = el)}
                    position={[-10, 0, 0]}
                    segments={40}
                    bounds={[8, 2, 1]}
                    volume={3.5}
                    color="white"
                    opacity={0.85}
                    speed={0.1}
                    fade={80}
                    growth={2.5}
                />
                <Cloud

                    // @ts-ignore
                    ref={(el) => (cloudRefs.current[1] = el)}
                    position={[14, 0, 0]}
                    segments={40}
                    bounds={[6, 2, 1]}
                    volume={3.5}
                    color="white"
                    opacity={0.85}
                    fade={80}
                    speed={0.1}
                    growth={4.5}
                />
                <Cloud

                    // @ts-ignore
                    ref={(el) => (cloudRefs.current[2] = el)}
                    position={[0, -1, 0]}
                    segments={40}
                    bounds={[4, 1, 1]}
                    volume={1.5}
                    color="white"
                    opacity={0.85}
                    fade={80}
                    speed={0.1}
                    growth={2.5}
                />
            </Clouds>
        ),
        []
    );

    const bounds = { x: 20, y: 4 }; // roaming limits

    useFrame((_, delta) => {
        cloudRefs.current.forEach((cloud, i) => {
            if (!cloud) return; // skip unmounted refs
            const dir = directions.current[i];

            cloud.position.x += dir.x * delta * 0.1;
            cloud.position.y += Math.sin(Date.now() * 0.0005 + i) * 0.001;

            // Bounce horizontally
            if (cloud.position.x > bounds.x || cloud.position.x < -bounds.x) {
                dir.x *= -1;
            }

            // Bounce vertically
            if (cloud.position.y > bounds.y || cloud.position.y < -bounds.y) {
                dir.y *= -1;
            }
        });
    });

    return <>{cloudElements}</>;
}

export const Pyramind: React.FC<PyramindProps> = (props) => {
    return (
        <>
        <Loader/>
        <Canvas className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-100" >
            <Suspense fallback={null}>
            <PerspectiveCamera
                makeDefault
                fov={75}
                position={[0, 0.5, 10]}
                zoom={4}
            />
            <CloudBackground/>
            <ResponsiveElements/>
            <Center position={[0, 0.0, 0]}>
                <Model {...props} />
            </Center>
            <ambientLight color="white" intensity={4.0}/>
            <CameraPointerMove intensity={0.1}/>
            </Suspense>
        </Canvas>
    </>
    );
};

function CameraPointerMove({ intensity = 0.08 }) { 
    const target = useRef(new THREE.Vector3());
    useFrame(({ camera, pointer }) => {
        target.current.x = pointer.x * intensity 
        target.current.y = pointer.y * intensity 
        camera.position.x += (target.current.x - camera.position.x) * 0.05
        camera.position.y += (target.current.y - camera.position.y) * 0.05 
        camera.lookAt(0, 0, 0) })
    return null 
}

const Background = () => {
    const texture = useTexture("/grass.webp");
    texture.colorSpace = THREE.SRGBColorSpace;
    return (
        <mesh position={[0, 0.0, -50]} scale={[50.0,9/16*50.0,1.0]}>
            <planeGeometry/>
            <meshBasicMaterial map={texture} transparent/>
        </mesh>
    );
}

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
vec3 lightBlue = vec3(0.0,0.169,0.357);

float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), 2.0);
float anim = sin(uTime * 2.0 + vPosition.y * 5.0) * 0.5 + 0.5;

float upFacing = dot(vNormal, vec3(0.0, 1.0, 0.0));
float downFacing = dot(-vNormal, vec3(0.0, 1.0, 0.0)); 
if (uIsHover) {
if (upFacing > 0.7 || downFacing > 0.7) {
gl_FragColor = vec4(1.0);
} else {
vec3 glow = mix(lightBlue, vec3(0.2, 0.8, 1.0), fresnel * anim);
gl_FragColor = vec4(glow, 1.0);
}
} else {
if (upFacing > 0.7 || downFacing > 0.7) discard;
vec3 glow = mix(lightBlue, vec3(0.2, 0.8, 1.0), fresnel * anim);
gl_FragColor = vec4(glow, 0.4);
}
}
`;

const pieceHeight = 2 / 4;
const lerp = (x: number, y: number, t: number): number => x + (y - x) * t;

const Model: React.FC<PyramindProps> = ({ onSectionChange, sections }) => {
    const { nodes } = useGLTF("/Pyramind.glb") as any;

    const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
    const spriteRefs = [useRef<THREE.Sprite>(null), useRef<THREE.Sprite>(null), useRef<THREE.Sprite>(null), useRef<THREE.Sprite>(null)];

    const groupRef = useRef<THREE.Group>(null);
    const gridRef = useRef<any>(null);

    const textureUrls = useMemo(() => sections.map((s) => s.icon).reverse(), [sections]);
    const maps = useTexture(textureUrls);

    const baseColor = new THREE.Color("#2080ff");
    const hoverColor = new THREE.Color("#ffffff");
    const activeGridColor = baseColor.clone();

    const hoverIndexRef = useRef<number | null>(null);
    const lastHoverIndex = useRef<number | null>(null);


    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();

        // group rotation
        if (groupRef.current) groupRef.current.rotation.y += 0.005;

        // grid color
        if (gridRef.current) {
            if (hoverIndexRef.current !== null && hoverIndexRef.current >= 0) {
                activeGridColor.lerp(hoverColor, 0.1);
            } else {
                activeGridColor.lerp(baseColor, 0.01);
            }
            gridRef.current.material.uniforms.cellColor.value = activeGridColor;
            gridRef.current.material.uniforms.sectionColor.value = activeGridColor;
        }

        // block animations
        refs.forEach((ref, index) => {
            const group = ref.current;
            if (!group) return;

            const isHovered = hoverIndexRef.current !== null && index <= hoverIndexRef.current;
            const offset = isHovered ? pieceHeight : 0;
            const targetRot = offset > 0 ? Math.PI * 0.25 : 0;

            group.position.y = THREE.MathUtils.lerp(group.position.y, offset, 0.1);
            group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRot, 0.1);

            group.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material.uniforms) {
                    child.material.uniforms.uTime.value = time;
                    child.material.uniforms.uIsHover.value = hoverIndexRef.current !== null;
                }
            });
        });

        spriteRefs.forEach((sprite, _index) => {
            if (!sprite.current) return;
            const isHovered = hoverIndexRef.current !== null; 
            const targetScale = isHovered ? 0.3 : 0.2; // grow when hovered
            const currentScale = sprite.current.scale.x;
            const newScale = lerp(currentScale, targetScale, 0.1);
            sprite.current.scale.set(newScale, newScale, newScale);

            (sprite.current.material as THREE.SpriteMaterial).color.lerp(
                isHovered ? new THREE.Color("#2080ff") : new THREE.Color("white"),
                0.5
            );
        });

        if (hoverIndexRef.current !== lastHoverIndex.current) {
            onSectionChange?.(hoverIndexRef.current);
            lastHoverIndex.current = hoverIndexRef.current;
        }
    });

    return (
        <group ref={groupRef}>
            {refs.map((ref, index) => (
                <group key={`pyramid-block-${index}`}>
                    <mesh
                        geometry={nodes[(index + 1).toString()].geometry}
                        visible={false}
                        onPointerMove={() => (hoverIndexRef.current = index)}
                        onPointerLeave={() => (hoverIndexRef.current = null)}
                    />
                    <group ref={ref}>
                        <mesh geometry={nodes[(index + 1).toString()].geometry}>
                            <shaderMaterial
                                args={[
                                    {
                                        uniforms: { uIsHover: { value: false }, uTime: { value: 0 } },
                                        vertexShader,
                                        fragmentShader,
                                    },
                                ]}
                                transparent
                                depthWrite={hoverIndexRef.current != null}
                                blending={THREE.NormalBlending}
                            />
                        </mesh>
                        <lineSegments>
                            <edgesGeometry args={[nodes[(index + 1).toString()].geometry]} attach="geometry" />
                            <lineBasicMaterial color="white" transparent opacity={0.2} />
                        </lineSegments>
                    </group>

                    <sprite
                        ref={spriteRefs[index]}
                        position={[0, index / 2 + 0.25, 0.01]}
                        scale={0.2}
                        name={`sprite-${index}`}
                        renderOrder={100}
                        onClick={() => {
                            const url = sections[3 - index].link;
                            if (window.top) window.top.location.href = url;
                                else window.location.href = url;
                        }}
                        onPointerOver={() => (document.body.style.cursor = "pointer")}
                        onPointerLeave={() => (document.body.style.cursor = "default")}
                    >
                        <spriteMaterial
                            map={maps[index]}
                            color={"white"}
                            transparent
                        />
                    </sprite>
                </group>
            ))}
        </group>
    );
};
