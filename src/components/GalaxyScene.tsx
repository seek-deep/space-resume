// GalaxyScene.jsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import InfoModal from "./InfoModal";
import { useState, useEffect, Suspense } from "react";
import Planet from "./Planet";
import Orbit from "./Orbit";
import AsteroidBelt from "./AsteroidBelt";
import AssistantAvatar from "./AssistantAvatar";
import * as THREE from "three";
import { orbits, textures } from "../constants";

// Only keep the CameraController component and UI components, remove orbit data
function CameraController({
  target,
  zoom,
  setZoom,
  clearTarget,
}: {
  target: { position: [number, number, number]; name: string } | null;
  zoom: number;
  setZoom: (zoom: number) => void;
  clearTarget: () => void;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (target) {
      const [x, y, z] = target.position;
      const cameraX = x + zoom;
      const cameraY = y + 2;
      const cameraZ = z;

      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.05);
      camera.lookAt(new THREE.Vector3(x, y, z));
    }
  });

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      /* @ts-expect-error */
      setZoom((prev) => Math.min(Math.max(prev + event.deltaY * 0.01, 5), 50));
      clearTarget();
    };

    const handleMouseDown = () => {
      clearTarget();
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setZoom, clearTarget]);

  return null;
}

interface NavigationItem {
  name: string;
  type: "planet" | "moon";
  description?: string;
}

interface GalaxySceneProps {
  selectedItem: NavigationItem | null;
}

export default function GalaxyScene({ selectedItem }: GalaxySceneProps) {
  const [target, setTarget] = useState<{
    position: [number, number, number];
    name: string;
    description?: string;
  } | null>(null);
  const [zoom, setZoom] = useState(25);
  const [modalContent, setModalContent] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    type: "planet" | "moon";
  }>({
    isOpen: false,
    title: "",
    content: null,
    type: "planet",
  });

  const handleFocus = (
    planetMesh: React.RefObject<THREE.Mesh>,
    name: string,
    description?: string,
    isMoon: boolean = false
  ) => {
    if (planetMesh.current) {
      const { x, y, z } = planetMesh.current.position;
      setTarget({ position: [x, y, z], name, description });

      setModalContent({
        isOpen: true,
        title: name,
        content: description || "",
        type: isMoon ? "moon" : "planet",
      });
    }
  };

  useEffect(() => {
    if (selectedItem) {
      // Find the corresponding orbit data
      const planet = orbits.find(orbit => 
        orbit.name === selectedItem.name || 
        orbit.moons?.some(moon => moon.name === selectedItem.name)
      );

      if (planet) {
        if (selectedItem.type === "planet") {
          handleFocus({ current: { position: new THREE.Vector3(planet.radius, 0, 0) } } as any, selectedItem.name);
        } else {
          // Handle moon selection
          const moon = planet.moons?.find(m => m.name === selectedItem.name);
          if (moon) {
            handleFocus({ current: { position: new THREE.Vector3(planet.radius, 0, 0) } } as any, moon.name, moon.description, true);
          }
        }
      }
    }
  }, [selectedItem]);

  const clearTarget = () => setTarget(null);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
    }}>
      <InfoModal
        isOpen={modalContent.isOpen}
        onClose={() => setModalContent((prev) => ({ ...prev, isOpen: false }))}
        title={modalContent.title}
        content={modalContent.content}
        type={modalContent.type}
      />

      <Canvas camera={{ position: [0, 25, zoom], fov: 60 }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[26, 0, 26]} intensity={1} distance={50} decay={2} />

        <mesh>
          <sphereGeometry args={[500, 64, 64]} />
          <meshBasicMaterial map={textures.galaxyBackground} side={THREE.BackSide} />
        </mesh>
        <Stars radius={200} depth={60} count={10000} factor={7} saturation={0} />

        <OrbitControls
          enableZoom={true}
          maxDistance={120}
          minDistance={10}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
        <CameraController target={target} zoom={zoom} setZoom={setZoom} clearTarget={clearTarget} />

        <Suspense fallback={null}>
          <AssistantAvatar />
        </Suspense>

        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial map={textures.sun} emissiveIntensity={1} />
        </mesh>

        {orbits.map((orbitData) => (
          <group key={orbitData.radius}>
            {orbitData.isAsteroidBelt ? (
              <AsteroidBelt orbitRadius={orbitData.radius} />
            ) : (
              <>
                <Orbit radius={orbitData.radius} />
                <Planet
                  position={[orbitData.radius, 0, 0]}
                  name={orbitData.name}
                  onFocus={handleFocus}
                  orbitRadius={orbitData.radius}
                  texture={orbitData.texture || textures.sun}
                  hasMoons={!!orbitData.moons?.length}
                  moonTexture={textures.moon}
                  moons={orbitData.moons || []}
                />
              </>
            )}
          </group>
        ))}
      </Canvas>
    </div>
  );
}
