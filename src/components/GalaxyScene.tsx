// GalaxyScene.jsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
// InfoModal is no longer used here, App.tsx handles MoonDetailDrawer
import { useState, useEffect, Suspense } from "react";
import Planet from "./Planet";
import Orbit from "./Orbit";
import AsteroidBelt from "./AsteroidBelt";
import AssistantAvatar from "./AssistantAvatar";
import * as THREE from "three";
import { orbits, textures, OrbitData as PlanetOrbitData } from "../constants"; // Renamed OrbitData to avoid conflict

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
      // Camera positioning logic: Adjust as needed for better framing of planets/moons
      const distanceFactor = target.name.includes("Moon Focus") ? zoom * 0.75 : zoom; // Zoom closer for moons
      const cameraX = x + distanceFactor; // Example: offset by zoom level
      const cameraY = y + distanceFactor * 0.2; // Slightly elevated view
      const cameraZ = z + distanceFactor * 0.3; // Angled view

      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.05);
      camera.lookAt(new THREE.Vector3(x, y, z));
    }
  });

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      setZoom((prev) => Math.min(Math.max(prev + event.deltaY * 0.01, 5), 50)); // Adjusted scroll sensitivity/limits
      clearTarget(); // Clear target on manual scroll to allow free exploration
    };

    const handleMouseDown = () => {
      clearTarget(); // Clear target on mouse down to allow free exploration
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

// This is the type received from App.tsx
interface CameraFocusTarget {
  name: string; // Name of the moon or planet
  type: "planet" | "moon";
  planetName?: string; // Name of the parent planet if type is 'moon'
}

interface GalaxySceneProps {
  selectedItem: CameraFocusTarget | null;
}

export default function GalaxyScene({ selectedItem }: GalaxySceneProps) {
  const [target, setTarget] = useState<{
    position: [number, number, number];
    name: string;
  } | null>(null);
  const [zoom, setZoom] = useState(30); // Initial zoom level

  // This handleFocus is for direct 3D scene interaction (clicking on a moon mesh)
  // It's separate from HUD-driven navigation. We might remove it if not needed.
  const handleFocusOnSceneObject = (
    meshRef: React.RefObject<THREE.Mesh>,
    name: string,
    // description?: string, // Description not used here anymore
    // isMoon: boolean = false // Type is determined by what's clicked
  ) => {
    if (meshRef.current) {
      const { x, y, z } = meshRef.current.position;
      // This will set camera target for 3D clicks, but won't open drawers.
      // Drawers are handled by App.tsx via HUD interaction.
      setTarget({ position: [x, y, z], name: `${name} (3D Click)` });
    }
  };

  useEffect(() => {
    if (selectedItem) {
      let planetToFocus: PlanetOrbitData | undefined;
      let targetName = selectedItem.name;
      let newZoom = 20; // Default zoom for planets

      if (selectedItem.type === "moon" && selectedItem.planetName) {
        planetToFocus = orbits.find(p => p.name === selectedItem.planetName && !p.isAsteroidBelt);
        targetName = `${selectedItem.planetName} - ${selectedItem.name} (Moon Focus)`; // For CameraController differentiation
        newZoom = 15; // Zoom closer for moons
      } else if (selectedItem.type === "planet") {
        planetToFocus = orbits.find(p => p.name === selectedItem.name && !p.isAsteroidBelt);
        newZoom = 20;
      }

      if (planetToFocus) {
        // For simplicity, target the planet's main orbital position.
        // Planet.tsx handles its own animation along an orbit, so mesh.position is dynamic.
        // We use the defining radius of the orbit as the primary component of the target.
        setTarget({ position: [planetToFocus.radius, 0, 0], name: targetName });
        setZoom(newZoom);
      } else {
        setTarget(null); // Clear target if no valid item found
      }
    } else {
      setTarget(null); // Clear target if selectedItem is null
    }
  }, [selectedItem]);

  const clearTarget = () => setTarget(null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* InfoModal is removed as MoonDetailDrawer in App.tsx handles this */}
      <Canvas
        camera={{ position: [0, zoom, zoom], fov: 75 }} // Adjusted initial camera pos and fov
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="#ffffff"
        />
        <pointLight
          position={[26, 0, 26]}
          intensity={1}
          distance={50}
          decay={2}
        />

        <mesh>
          <sphereGeometry args={[500, 64, 64]} />
          <meshBasicMaterial
            map={textures.galaxyBackground}
            side={THREE.BackSide}
          />
        </mesh>
        <Stars
          radius={200}
          depth={60}
          count={10000}
          factor={7}
          saturation={0}
        />

        <OrbitControls
          enableZoom={true}
          maxDistance={120}
          minDistance={10}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
        <CameraController
          target={target}
          zoom={zoom}
          setZoom={setZoom}
          clearTarget={clearTarget}
        />

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
