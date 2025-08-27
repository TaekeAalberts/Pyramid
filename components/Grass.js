"use client"
import * as THREE from "three"
import React, { useRef, useMemo } from "react"
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

import { useFrame, useLoader } from "@react-three/fiber"

// Eddie Lee 2010 textures
import "./GrassMaterial"

const noise = new ImprovedNoise();

export default function Grass({
    options = { 
        baseWidth: 0.08,
        baseHeight: 2.5,
        joints: 5 
    },
    groundWidth = 500,
    groundLength = 500,
    instances = 2000_00,
    inRows = true,
    tipColor = new THREE.Color(0.5, 0.6, 0.0).convertSRGBToLinear(),
    bottomColor = new THREE.Color(0.0, 0.1, 0.0).convertSRGBToLinear(),
    ...props
}) {
    const { baseWidth, baseHeight, joints } = options;
    const materialRef = useRef();

    const [texture, alphaMap] = useLoader(THREE.TextureLoader, [
        '/textures/blade_diffuse.jpg',
        '/textures/blade_alpha.jpg'
    ])

const attributeData = useMemo(() =>
    getAttributeData(instances, groundWidth, groundLength, inRows),
    [instances, groundWidth, groundLength, inRows]);

    const baseGeom = useMemo(() =>
        new THREE.PlaneGeometry(baseWidth, baseHeight, 1, joints).translate(0, baseHeight / 2, 0),
        [baseWidth, baseHeight, joints]);

    const groundGeo = useMemo(() => {
        const geo = new THREE.PlaneGeometry(groundWidth, groundLength, 32, 32);
        geo.rotateX(-Math.PI / 2); // make it horizontal

        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const y = getYPosition(x, z);
            pos.setY(i, y);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        return geo;
    }, [groundWidth]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value =
                state.clock.elapsedTime / 4;
        }
    });


    const [mudMap, mudMapNor] = useLoader(THREE.TextureLoader,  [
        '/textures/brown_mud_diff_1k.jpg',
        '/textures/brown_mud_nor_gl_1k.jpg'
    ]);
    mudMap.wrapS = THREE.RepeatWrapping;
    mudMap.wrapT = THREE.RepeatWrapping;
    mudMap.repeat.set(20, 10);

    return (
        <group {...props}>
            <mesh>
                <instancedBufferGeometry
                    index={baseGeom.index}
                    attributes-position={baseGeom.attributes.position}
                    attributes-uv={baseGeom.attributes.uv}
                >
                    <instancedBufferAttribute
                        attach="attributes-offset"
                        args={[new Float32Array(attributeData.offsets), 3]}
                    />
                    <instancedBufferAttribute
                        attach="attributes-orientation"
                        args={[new Float32Array(attributeData.orientations), 4]}
                    />
                    <instancedBufferAttribute
                        attach="attributes-stretch"
                        args={[new Float32Array(attributeData.stretches), 1]}
                    />
                    <instancedBufferAttribute
                        attach="attributes-halfRootAngleSin"
                        args={[new Float32Array(attributeData.halfRootAngleSin), 1]}
                    />
                    <instancedBufferAttribute
                        attach="attributes-halfRootAngleCos"
                        args={[new Float32Array(attributeData.halfRootAngleCos), 1]}
                    />
                </instancedBufferGeometry>
                <grassMaterial
                    ref={materialRef}
                    map={texture}
                    alphaMap={alphaMap}
                    toneMapped={false}
                    tipColor={tipColor}
                    bottomColor={bottomColor}
                />
            </mesh>

            <mesh position={[0, 0, 0]} geometry={groundGeo}>
                <meshStandardMaterial 
                    map={mudMap}
                    normalMap={mudMapNor}
                />
            </mesh>
        </group>
    )
}

function getAttributeData(instances, width, length, inRows = true) {
    const offsets = [];
    const orientations = [];
    const stretches = [];
    const halfRootAngleSin = [];
    const halfRootAngleCos = [];

    let quaternion_0 = new THREE.Vector4();
    let quaternion_1 = new THREE.Vector4();

    const min = -0.25;
    const max = 0.25;

    for (let i = 0; i < instances; i++) {
        let offsetX;
        if (inRows) {
            offsetX = (i * 2.0) % width - width / 2 - (i % 2 ? 1.5 : 0);
        } else {
            offsetX = Math.random() * width - width / 2;
        }

        // ✅ use `length` for Z spread
        const offsetZ = Math.random() * length - length / 2;

        const offsetY = getYPosition(offsetX, offsetZ);
        offsets.push(offsetX, offsetY, offsetZ);

        // --- quaternion orientation stuff unchanged ---
        let angle = Math.PI - Math.random() * (2 * Math.PI);
        halfRootAngleSin.push(Math.sin(0.5 * angle));
        halfRootAngleCos.push(Math.cos(0.5 * angle));

        let RotationAxis = new THREE.Vector3(0, 1, 0);
        let x = RotationAxis.x * Math.sin(angle / 2.0);
        let y = RotationAxis.y * Math.sin(angle / 2.0);
        let z = RotationAxis.z * Math.sin(angle / 2.0);
        let w = Math.cos(angle / 2.0);
        quaternion_0.set(x, y, z, w).normalize();

        angle = Math.random() * (max - min) + min;
        RotationAxis = new THREE.Vector3(1, 0, 0);
        x = RotationAxis.x * Math.sin(angle / 2.0);
        y = RotationAxis.y * Math.sin(angle / 2.0);
        z = RotationAxis.z * Math.sin(angle / 2.0);
        w = Math.cos(angle / 2.0);
        quaternion_1.set(x, y, z, w).normalize();
        quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

        angle = Math.random() * (max - min) + min;
        RotationAxis = new THREE.Vector3(0, 0, 1);
        x = RotationAxis.x * Math.sin(angle / 2.0);
        y = RotationAxis.y * Math.sin(angle / 2.0);
        z = RotationAxis.z * Math.sin(angle / 2.0);
        w = Math.cos(angle / 2.0);
        quaternion_1.set(x, y, z, w).normalize();
        quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

        orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);

        if (i < instances / 3) {
            stretches.push(Math.random() * 1.8);
        } else {
            stretches.push(Math.random());
        }
    }

    return {
        offsets,
        orientations,
        stretches,
        halfRootAngleCos,
        halfRootAngleSin,
    };
}

function multiplyQuaternions(q1, q2) {
    const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
    const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
    const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
    const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
    return new THREE.Vector4(x, y, z, w);
}

function getYPosition(x, z) {
    let y = 2 * noise.noise(x / 50, z / 50, 0);
    y += 4 * noise.noise(x / 100, z / 100, 0);
    y += 0.2 * noise.noise(x / 10, z / 10, 0);
    return y;
}
