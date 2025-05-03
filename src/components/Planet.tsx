import { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { TextureLoader } from "three";

const RimGlowMaterial = shaderMaterial(
  {
    uTexture: null,
    uHoverIntensity: 0,
    uColor: new THREE.Color("white"),
  },
  // Vertex Shader
  `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  // Fragment Shader
  `
  uniform sampler2D uTexture;
  uniform float uHoverIntensity;
  uniform vec3 uColor;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    float intensity = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 3.0);
    vec3 rim = uColor * intensity * uHoverIntensity;
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = vec4(texColor.rgb + rim, texColor.a);
  }
  `
);

extend({ RimGlowMaterial });

function Moon({ orbitRadius, planetMesh, texture }: any) {
  const mesh = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    if (mesh.current && planetMesh.current) {
      angleRef.current += 0.01; // Moon orbit speed
      const planetPosition = planetMesh.current.position;
      const x = planetPosition.x + orbitRadius * Math.cos(angleRef.current);
      const z = planetPosition.z + orbitRadius * Math.sin(angleRef.current);
      mesh.current.position.set(x, planetPosition.y, z);
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function Planet({
  position,
  name,
  onFocus,
  orbitRadius,
  texture,
  hasMoons,
  moonTexture,
}: any) {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const orbitSpeed = Math.random() * 0.001 + 0.0005;

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.003;

      angleRef.current += orbitSpeed;
      const x = orbitRadius * 1.2 * Math.cos(angleRef.current); // Elliptical orbit (x-axis stretched)
      const z = orbitRadius * Math.sin(angleRef.current);
      mesh.current.position.set(x, 0, z);
    }

    if (materialRef.current) {
      materialRef.current.uHoverIntensity = hovered ? 1.0 : 0.0;
    }
  });

  return (
    <>
      <mesh
        ref={mesh}
        position={position}
        onClick={() => onFocus(mesh, name)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        {/* Rim Glow Shader */}
        <rimGlowMaterial
          ref={materialRef}
          uTexture={texture}
          attach="material"
        />
      </mesh>

      {hasMoons &&
        Array.from({ length: 2 }, (_, i) => (
          <Moon
            key={i}
            orbitRadius={1.5 + i * 0.5}
            planetMesh={mesh}
            texture={moonTexture}
          />
        ))}
    </>
  );
}
