import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
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

//
// GLSL simplex noise (2D)
// Source: Ashima Arts (https://github.com/ashima/webgl-noise)
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0

  // First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  // Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute(
              permute(
                i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 x_ = floor(p * C.w) * C.z;
  vec3 y_ = floor(p - 289.0 * x_) * C.z;

  vec3 gx = p * C.w - x_;
  vec3 gy = y_ - floor(y_);

  vec3 g = vec3(gx.x + gy.x, gx.y + gy.y, gx.z + gy.z);
  vec3 norm = inversesqrt(vec3(dot(g,g), dot(g,g), dot(g,g)));
  g *= norm;

  // Compute noise contributions from the three corners
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;

  // Dot product
  vec3 x = vec3(x0.x, x12.x, x12.z);
  vec3 y = vec3(x0.y, x12.y, x12.w);
  return 70.0 * dot(m, vec3(dot(g.xy, vec2(x.x,y.x)), dot(g.xy, vec2(x.y,y.y)), dot(g.xy, vec2(x.z,y.z))));
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
    float delta = smoothstep(0.3, 0.8, fbm(vUv * 20.0 + (uTime*0.1)));
    color = color * (1.0 - delta) + delta;
    gl_FragColor = vec4(color, 1.0);
}`;

export function Clouds() {
    const meshRef = useRef<THREE.Mesh>(null);

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
                        uTime: { value: 0.0 }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                }]}
            />
        </mesh>
    )
}
