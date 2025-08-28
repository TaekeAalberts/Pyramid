import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv; 
varying vec3 vPosition; 

void main() {
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vPosition = position; 
    vUv = uv;

    gl_Position = projectionMatrix * viewPos;
}`;

const fragmentShader = `
varying vec2 vUv; 
varying vec3 vPosition; 
uniform float uTime;
uniform float uAspect;

// Lets make a fBm
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    vec3 color = vec3(0.686,0.831,1.);
    float delta = smoothstep(0.3, 0.8, fbm(vec2(vUv.x * uAspect, vUv.y) * 8.0 + (uTime*0.1)));
    color = color * (1.0 - delta) + delta;
    gl_FragColor = vec4(color, 1.0);
}`;

export function Clouds() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        if (meshRef.current) {
            // @ts-ignore
            meshRef.current.material.uniforms.uTime.value = time;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 6, -80]} rotation={[65*Math.PI/180, 0, 0]}>
            <planeGeometry args={[100, 50, 100, 100]}/>
            <shaderMaterial 
                args={[{
                    uniforms: {
                        uTime: { value: 0.0 },
                        uAspect: { value: viewport.width/viewport.height }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                }]}
            />
        </mesh>
    )
}
