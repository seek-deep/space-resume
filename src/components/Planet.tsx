import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

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

interface Moon {
  name: string;
  description: string;
}

type MeshRef = React.RefObject<
  THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
>;

function MoonObject({
  orbitRadius,
  planetMesh,
  texture,
  index,
  totalMoons,
  moonData,
  onFocus,
}: {
  orbitRadius: number;
  planetMesh: MeshRef;
  texture: THREE.Texture;
  index: number;
  totalMoons: number;
  moonData: Moon;
  onFocus: (
    mesh: MeshRef,
    name: string,
    description?: string,
    isMoon?: boolean
  ) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const angleRef = useRef((Math.PI * 2 * index) / totalMoons);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (mesh.current && planetMesh.current) {
      angleRef.current += 0.005;
      const planetPosition = planetMesh.current.position;

      const x = planetPosition.x + orbitRadius * Math.cos(angleRef.current);
      const z = planetPosition.z + orbitRadius * Math.sin(angleRef.current);
      const y = planetPosition.y + Math.sin(angleRef.current * 2) * 0.3;

      mesh.current.position.set(x, y, z);
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <mesh
        ref={mesh}
        onClick={() =>
          onFocus(mesh as MeshRef, moonData.name, moonData.description, true)
        }
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {hovered && (
        <Html
          position={[
            mesh.current?.position.x || 0,
            (mesh.current?.position.y || 0) + 0.5,
            mesh.current?.position.z || 0,
          ]}
          center
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {moonData.name}
          </div>
        </Html>
      )}
    </>
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
  moons = [],
}: {
  position: [number, number, number];
  name: string;
  onFocus: (
    mesh: MeshRef,
    name: string,
    description?: string,
    isMoon?: boolean
  ) => void;
  orbitRadius: number;
  texture: THREE.Texture;
  hasMoons: boolean;
  moonTexture: THREE.Texture;
  moons: Moon[];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  // Base orbital period (adjusted for radius)
  const baseSpeed = 0.001 / Math.sqrt(orbitRadius);

  useFrame(() => {
    if (mesh.current) {
      // Planet rotation
      mesh.current.rotation.y += 0.003;

      // Update angle for orbital position
      angleRef.current += baseSpeed;

      // Calculate elliptical orbit position
      const a = orbitRadius; // semi-major axis
      const b = orbitRadius * 0.6; // semi-minor axis (matching orbit)

      // Calculate position in the X-Z plane (same as orbit)
      const x = a * Math.cos(angleRef.current);
      const z = b * Math.sin(angleRef.current);

      // Update position
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
        // onClick={() => onFocus(mesh as MeshRef, name)} // Removed onClick for planets
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        {/* @ts-expect-error */}
        <rimGlowMaterial
          ref={materialRef}
          uTexture={texture}
          attach="material"
        />
      </mesh>

      {hovered && (
        <Html
          position={[
            mesh.current?.position.x || 0,
            (mesh.current?.position.y || 0) + 1.5, // Positioned above the planet
            mesh.current?.position.z || 0,
          ]}
          center
          style={{
            width: "250px", // Give it a bit more width for the new text
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              padding: "10px 15px", // Slightly more padding
              borderRadius: "10px", // Slightly more rounded
              color: "white",
              fontSize: "14px",
              pointerEvents: "none",
              // whiteSpace: "nowrap", // Remove nowrap to allow text to wrap
              backdropFilter: "blur(5px)", // Slightly more blur
              border: "1px solid rgba(255, 255, 255, 0.15)", // Slightly more visible border
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              This is {name}
            </div>
            <div style={{ fontSize: "13px" }}>
              🛰️ Click on one of this planet’s moons to explore individual
              experiences/projects.
            </div>
          </div>
        </Html>
      )}

      {/* {hasMoons && (
        <Html
          position={[
            mesh.current?.position.x || 0,
            (mesh.current?.position.y || 0) + 2,
            mesh.current?.position.z || 0,
          ]}
          center
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              pointerEvents: "auto",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              {showDropdown ? "Hide Moons" : "Show Moons"}
            </button>

            {showDropdown && (
              <ul style={{ marginTop: "8px", padding: "0", listStyle: "none" }}>
                {moons.map((moon, index) => (
                  <li key={index}>
                    <button
                      onClick={() =>
                        onFocus(mesh as MeshRef, moon.name, moon.description, true)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      {moon.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Html>
      )} */}

      {hasMoons &&
        moons.map((moon, i) => (
          <MoonObject
            key={i}
            index={i}
            totalMoons={moons.length}
            orbitRadius={1.5 + i * 0.5}
            planetMesh={mesh as MeshRef}
            texture={moonTexture}
            moonData={moon}
            onFocus={onFocus}
          />
        ))}
    </>
  );
}
