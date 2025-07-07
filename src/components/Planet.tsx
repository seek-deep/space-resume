import { Html } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
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
  const [hovered, setHovered] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const [active, setActive] = useState(false);
  const angleRef = useRef((Math.PI * 2 * index) / totalMoons);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Tooltip logic
  const showTooltip = () => {
    setHovered(true);
    setTooltipVisible(true);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  };
  const hideTooltip = () => {
    setHovered(false);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 1000);
  };

  return (
    <>
      {/* Larger transparent hit area for easier clicking */}
      <mesh
        position={mesh.current?.position}
        onPointerDown={() => {
          setActive(true);
          onFocus(mesh as MeshRef, moonData.name, moonData.description, true);
          setTimeout(() => setActive(false), 120);
        }}
        onPointerOver={showTooltip}
        onPointerOut={hideTooltip}
        visible={false}
      >
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh
        ref={mesh}
        onPointerDown={() => {
          setActive(true);
          onFocus(mesh as MeshRef, moonData.name, moonData.description, true);
          setTimeout(() => setActive(false), 120);
        }}
        onPointerOver={showTooltip}
        onPointerOut={hideTooltip}
        scale={active ? 1.2 : hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {tooltipVisible && (
        <Html
          position={
            isMobile
              ? [
                  (mesh.current?.position.x || 0) - 1.2, // left of moon
                  (mesh.current?.position.y || 0) + 1.2, // above moon
                  mesh.current?.position.z || 0,
                ]
              : [
                  mesh.current?.position.x || 0,
                  (mesh.current?.position.y || 0) + 0.5,
                  mesh.current?.position.z || 0,
                ]
          }
          center
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              padding: isMobile ? "16px 20px" : "8px 12px",
              borderRadius: "10px",
              color: "white",
              fontSize: isMobile ? "18px" : "14px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: isMobile ? "0 4px 24px rgba(0,0,0,0.4)" : undefined,
              zIndex: 1000,
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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Tooltip logic for planet
  const showTooltip = () => {
    setHovered(true);
    setTooltipVisible(true);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  };
  const hideTooltip = () => {
    setHovered(false);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 1000);
  };

  return (
    <>
      <mesh
        ref={mesh}
        position={position}
        // onClick={() => onFocus(mesh as MeshRef, name)} // Removed onClick for planets
        onPointerOver={showTooltip}
        onPointerOut={hideTooltip}
      >
        <sphereGeometry args={[1, 32, 32]} />
        {/* @ts-expect-error */}
        <rimGlowMaterial
          ref={materialRef}
          uTexture={texture}
          attach="material"
        />
      </mesh>

      {tooltipVisible && (
        <Html
          position={
            isMobile
              ? [
                  (mesh.current?.position.x || 0) - 2.2, // left of planet
                  (mesh.current?.position.y || 0) + 2.2, // above planet
                  mesh.current?.position.z || 0,
                ]
              : [
                  mesh.current?.position.x || 0,
                  (mesh.current?.position.y || 0) + 1.5,
                  mesh.current?.position.z || 0,
                ]
          }
          center
          style={{
            width: isMobile ? "90vw" : "250px",
            maxWidth: isMobile ? "90vw" : undefined,
            left: isMobile ? "5vw" : undefined,
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              padding: isMobile ? "18px 22px" : "10px 15px",
              borderRadius: "12px",
              color: "white",
              fontSize: isMobile ? "19px" : "14px",
              pointerEvents: "none",
              backdropFilter: "blur(7px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: isMobile ? "0 4px 32px rgba(0,0,0,0.5)" : undefined,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "7px" }}>
              This is {name}
            </div>
            <div style={{ fontSize: isMobile ? "16px" : "13px" }}>
              🛰️ Click on one of this planet’s moons to explore individual
              experiences/projects.
            </div>
          </div>
        </Html>
      )}

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
