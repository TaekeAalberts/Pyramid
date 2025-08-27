"use client";

import {
    Center,
    useGLTF,
    useTexture,
    Loader,
    PerspectiveCamera,
    // OrbitControls,
    // Clouds, Cloud,
    // Stats
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
    useRef,
    useState,
    useEffect,
    // useMemo,
    Suspense
} from "react";
import * as THREE from "three";
// import Grass from "./Grass";
import { Clouds, /*Hills*/ } from "./Clouds";

export interface PyramindProps {
    onSectionChange?: (index: number) => void;
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

// Show a static background image on mobile devices where the resources are limited
// const ImageBg = () => {
//     const backgroundTexture = useTexture("/high-angle-farmland-view.jpg");
//     backgroundTexture.colorSpace = THREE.SRGBColorSpace;
//
//     return (
//         <mesh scale={[20, (9/16)*20, 1]} position={[0, 0, -10]}>
//             <planeGeometry args={[1, 1]} />
//             <meshBasicMaterial map={backgroundTexture} />
//         </mesh>
//     );
// };

// function CloudBackground() {
//   const cloudRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
//
//   useFrame(({ clock }, delta) => {
//     const t = clock.getElapsedTime();
//     const baseSpeeds = [0.1, 0.15, 0.2, 0.25]; // very slow "wind"
//     const bounds = 5;
//
//     cloudRefs.forEach((ref, i) => {
//       if (ref.current) {
//         // base horizontal drift (wind)
//         ref.current.position.x += delta * baseSpeeds[i] * 2.0;
//
//         // wrap horizontally
//         if (ref.current.position.x > bounds) {
//           ref.current.position.x = -bounds;
//         }
//
//         // gentle vertical oscillation (different phases per cloud)
//         ref.current.position.y += Math.sin(t * 0.1 + i) * 0.002;
//
//         // slight forward/back jiggle
//         ref.current.position.z += Math.sin(t * 0.07 + i * 2.0) * 0.001;
//
//         // optional: slow breathing (scale change)
//         const s = 1 + Math.sin(t * 0.05 + i) * 0.02;
//         ref.current.scale.setScalar(s);
//       }
//     });
//   });
//
//   const cloudElements = useMemo(() => {
//     return [
//       <Clouds key="c1" material={THREE.MeshBasicMaterial}>
//         <Cloud seed={1} segments={40} speed={0.2} bounds={[1, 1, 1]} volume={1.5} color="white" opacity={0.85} fade={40} growth={2.5} />
//       </Clouds>,
//       <Clouds key="c2" material={THREE.MeshBasicMaterial}>
//         <Cloud seed={2} segments={40} speed={0.2} bounds={[2, 1.5, 1]} volume={2} color="white" opacity={0.8} fade={50} growth={3} />
//       </Clouds>,
//       <Clouds key="c3" material={THREE.MeshBasicMaterial}>
//         <Cloud seed={3} segments={40} speed={0.2} bounds={[3, 2, 1]} volume={2.5} color="white" opacity={0.75} fade={60} growth={3} />
//       </Clouds>,
//       <Clouds key="c4" material={THREE.MeshBasicMaterial}>
//         <Cloud seed={4} segments={40} speed={0.2} bounds={[4, 2.5, 1]} volume={3} color="white" opacity={0.7} fade={70} growth={3.5} />
//       </Clouds>,
//     ];
//   }, []);
//
//   return (
//     <group>
//       <group ref={cloudRefs[0]} position={[-10, 3, -20]}>
//         {cloudElements[0]}
//       </group>
//       <group ref={cloudRefs[1]} position={[-15, 4, -25]}>
//         {cloudElements[1]}
//       </group>
//       <group ref={cloudRefs[2]} position={[-30, 5, -35]}>
//         {cloudElements[2]}
//       </group>
//       <group ref={cloudRefs[3]} position={[-25, 6, -35]}>
//         {cloudElements[3]}
//       </group>
//     </group>
//   );
// }
//

export const Pyramind: React.FC<PyramindProps> = ({ onSectionChange }) => {
    return (
        <>
            <Loader/>
            <Canvas className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-100" >
                {/* <OrbitControls/> */}
                {/* <Hills/> */}
                <Suspense fallback={null}>
                    <Clouds/>
                    <PerspectiveCamera
                        makeDefault
                        fov={75}
                        position={[0, 0.5, 10]}
                        zoom={4}
                    />
                    <ResponsiveElements/>
                    <Center position={[0, 0.0, 0]}>
                        <Model onSectionChange={onSectionChange} />
                    </Center>
                    {/* <Stats/> */}
                </Suspense>
                {/* <Fence/> */}
                <ambientLight color="white" intensity={0.6}/>
                <CameraPointerMove intensity={0.1}/>
            </Canvas>
        </>
    );
};

// function Fence() {
//     const tex = useTexture("/fence.png");
//     tex.colorSpace = THREE.SRGBColorSpace;
//     tex.wrapS = THREE.RepeatWrapping;
//     tex.wrapT = THREE.RepeatWrapping;
//     tex.repeat.set(40, 1);
//     return (
//         <mesh 
//             rotation={[0, Math.PI/2, 0]}
//             position={[-3.6, -1.5, -40]}
//         >
//             <planeGeometry args={[100, 1.0, 1, 1]}/>
//             <meshStandardMaterial color="white" map={tex} transparent />
//         </mesh>
//     )
// }

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

    // const cow = useTexture("/cow.png");
    // cow.colorSpace = THREE.SRGBColorSpace;
    //
    // const tree = useTexture("/tree-1.png");
    // tree.colorSpace = THREE.SRGBColorSpace;
    //
    // const tree2 = useTexture("/tree-2.png");
    // tree2.colorSpace = THREE.SRGBColorSpace;

    return (
        <>
            <mesh position={[0, 0.0, -50]} scale={[50.0,9/16*50.0,1.0]}>
                <planeGeometry/>
                <meshBasicMaterial map={texture} transparent/>
            </mesh>

            {/* <mesh position={[-5, -1.2, -20]} scale={[-1.3, 1.3, 1.3]}> */}
            {/*     <planeGeometry/> */}
            {/*     <meshBasicMaterial map={cow} transparent opacity={0.8} color="#cccccc"/> */}
            {/* </mesh> */}
            {/* <mesh position={[-6, -1.3, -15]} scale={1.2}> */}
            {/*     <planeGeometry/> */}
            {/*     <meshBasicMaterial map={cow} transparent opacity={0.8} color="#dddddd"/> */}
            {/* </mesh> */}
            {/**/}
            {/* <mesh position={[-11, -0.2, -20]} scale={[2.5, 2.5, 1]}> */}
            {/*     <planeGeometry/> */}
            {/*     <meshBasicMaterial map={tree} transparent opacity={1.0} color="white"/> */}
            {/* </mesh> */}
            {/**/}
            {/* <mesh position={[-13, -0.2, -30]} scale={[-2.5, 2.5, 1]}> */}
            {/*     <planeGeometry/> */}
            {/*     <meshBasicMaterial map={tree} transparent opacity={1.0} color="white"/> */}
            {/* </mesh> */}
        </>
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
        if (upFacing > 0.7) discard;
        vec3 glow = mix(lightBlue, vec3(0.2, 0.8, 1.0), fresnel * anim);
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
        if (hoverIndex >= 0) {
            setHoverAnimatedFactor(lerp(hoverAnimatedFactor, 1.0, 0.1));
        } else {
            setHoverAnimatedFactor(lerp(hoverAnimatedFactor, 0.0, 0.1));
        }
        if (gridRef.current) {
            if (hoverIndex >= 0) {
                activeGridColor.lerp(hoverColor, 0.1);
            } else {
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

    const maps = useTexture([
        "/group.png",
        "/gear.png",
        "/package.png",
        "/euro.png"
    ]);
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
                        <lineSegments>
                            <edgesGeometry args={[nodes[(index + 1).toString()].geometry]} attach="geometry"/>
                            <lineBasicMaterial color="white" transparent opacity={0.2}/>
                        </lineSegments>
                    </group>
                    <sprite
                        position={[0, index/2 + 0.25, 0.01]} 
                        name={`sprite-${index}`}
                        scale={[
                            (hoverAnimatedFactor * 0.1) + 0.2,
                            (hoverAnimatedFactor * 0.1) + 0.2,
                            (hoverAnimatedFactor * 0.1) + 0.2,
                        ]}
                        renderOrder={100}
                        onClick={() => { 
                            if (window.top) window.top.location.href = links[index];
                                else window.location.href = links[index];
                        }}
                        onPointerOver={() => document.body.style.cursor = "pointer"}
                        onPointerLeave={() => document.body.style.cursor = "default"}
                    >
                        <spriteMaterial map={maps[index]} color={hoverIndex >= 0 ? "#2080ff" : "white"} transparent/>
                    </sprite> 
                </group>
            ))}
        </group>
    );
};
