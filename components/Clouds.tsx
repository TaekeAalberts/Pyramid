import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv; 

void main() {
    vUv = uv;
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPos;
}`;

const fragmentShader = `
varying vec2 vUv; 
uniform float uTime;
uniform float uWidth;
uniform float uHeight;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float hash1( vec2 p )
{
    p  = 50.0*fract( p*0.3183099 );
    return fract( p.x*p.y*(p.x+p.y) );
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    #endif

    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));
    
    return -1.0+2.0*(a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y);
}

#define ZERO 0

const mat2 m2 = mat2(  0.80,  0.60,
                      -0.60,  0.80 );

float fbm_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=ZERO; i<9; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
    
	return a;
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
    // vec3 color = vec3(0.686,0.831,1.);
    vec3 color = vec3(0.42,0.62,1.1);// - rd.y*0.4;
    float delta = smoothstep(-0.2, 0.6, fbm_9(vUv * 8.0 + (uTime*0.1)));
    color = color * (1.0 - delta) + delta;
    gl_FragColor = vec4(color, 1.0);
}`;

export function Clouds() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        if (meshRef.current) {
            // @ts-ignore
            meshRef.current.material.uniforms.uTime.value = time;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 6, -80]} rotation={[65*Math.PI/180, 0, 0]}>
            <planeGeometry args={[100, 50, 1, 1]}/>
            <shaderMaterial 
                args={[{
                    uniforms: {
                        uTime: { value: 0.0 },
                        uWidth: { value: size.width },
                        uHeight: { value: size.height }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                }]}
            />
        </mesh>
    )
}
