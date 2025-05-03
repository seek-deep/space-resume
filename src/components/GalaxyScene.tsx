// GalaxyScene.jsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import Planet from "./Planet";
import Orbit from "./Orbit";
import * as THREE from "three";
import { TextureLoader } from "three";

const textures = {
  aboutMe: new TextureLoader().load("/textures/jupiter.jpg"),
  experience: new TextureLoader().load("/textures/earth.jpg"),
  projects: new TextureLoader().load("/textures/eris.jpg"),
  skills: new TextureLoader().load("/textures/mars.jpg"),
  contact: new TextureLoader().load("/textures/neptune.jpg"),
  hobbies: new TextureLoader().load("/textures/mecidica.jpg"),
  education: new TextureLoader().load("/textures/Volcanic.png"),
  moon: new TextureLoader().load("/textures/moon.jpg"),
  sun: new TextureLoader().load("/textures/sun.jpg"),
  galaxyBackground: new TextureLoader().load("/textures/galaxy_background.jpg"),
};

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

      // Position the camera to the right of the planet, keeping it in the left half of the screen
      const cameraX = x + zoom; // Offset to the right of the planet
      const cameraY = y + 2; // Slightly above the planet for better perspective
      const cameraZ = z;

      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.05);
      camera.lookAt(new THREE.Vector3(x, y, z)); // Always look at the planet
    }
  });

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      setZoom((prev) => Math.min(Math.max(prev + event.deltaY * 0.01, 5), 50));
      clearTarget(); // Detach focus on scroll
    };

    const handleMouseDown = () => {
      clearTarget(); // Detach focus on drag
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

{
  /* Central Star */
}
{
  /* <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            map={textures.sun}
            emissive={new THREE.Color(0xffff00)}
            emissiveIntensity={10}
          />
        </mesh>
        <group>
          {Array.from({ length: 500 }).map((_, i) => (
            <mesh
              key={i}
              rotation={[
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
              ]}
            >
              <coneGeometry args={[0.05, 12, 32]} />
              <meshBasicMaterial
                color={new THREE.Color(0xffffaa)}
                transparent={true}
                opacity={0.01}
              />
            </mesh>
          ))}
        </group>
        <mesh>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(0xffff00)}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(0xffff00)}
            transparent={true}
            opacity={0.15}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(0xffff00)}
            transparent={true}
            opacity={0.08}
          />
        </mesh>
        <pointLight
          color={new THREE.Color(0xffdd88)}
          intensity={6}
          distance={100}
        />
        <spotLight
          color={new THREE.Color(0xffcc66)}
          intensity={2}
          angle={Math.PI / 6}
          penumbra={0.3}
          position={[0, 0, 0]}
          distance={120}
          castShadow
        />
        <group>
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh
              key={i}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <coneGeometry args={[0.1, 10, 32]} />
              <meshBasicMaterial
                color={new THREE.Color(0xffffaa)}
                transparent={true}
                opacity={0.05}
              />
            </mesh>
          ))}
        </group> */
}

function AsteroidBelt() {
  const asteroids = Array.from({ length: 500 }, () => ({
    x: (Math.random() - 0.5) * 40, // Random x position within a range
    y: (Math.random() - 0.5) * 0.5, // Keep y close to 0 for a flat belt
    z: (Math.random() - 0.5) * 40, // Random z position within a range
    scale: Math.random() * 0.1 + 0.05, // Random size for asteroids
  }));

  return (
    <>
      {asteroids.map((asteroid, index) => (
        <mesh
          key={index}
          position={[asteroid.x, asteroid.y, asteroid.z]}
          scale={[asteroid.scale, asteroid.scale, asteroid.scale]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </>
  );
}

export default function GalaxyScene() {
  const [target, setTarget] = useState<{
    position: [number, number, number];
    name: string;
  } | null>(null);
  const [zoom, setZoom] = useState(10); // Adjusted default zoom for closer view

  const handleFocus = (
    planetMesh: React.RefObject<THREE.Mesh>,
    name: string
  ) => {
    if (planetMesh.current) {
      const { x, y, z } = planetMesh.current.position; // Get the current position
      setTarget({ position: [x, y, z], name });
    }
  };

  const clearTarget = () => setTarget(null); // Clear the target to make the camera free

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
      <Canvas
        camera={{ position: [0, 0, zoom], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />
        {/* Background */}
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
        <OrbitControls enableZoom={true} /> {/* Enable zoom */}
        {/* Camera Controller */}
        <CameraController
          target={target}
          zoom={zoom}
          setZoom={setZoom}
          clearTarget={clearTarget}
        />
        {/* Central Star */}
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial map={textures.sun} emissiveIntensity={1} />
        </mesh>
        {/* Asteroid Belt */}
        {/* <AsteroidBelt /> */}
        {/* Orbits */}
        <Orbit radius={8} />
        <Orbit radius={10} />
        <Orbit radius={12} />
        <Orbit radius={14} />
        <Orbit radius={16} />
        <Orbit radius={18} />
        {/* Planets */}
        <Planet
          position={[-8, 0, 0]}
          name="About Me"
          onFocus={handleFocus}
          orbitRadius={8}
          texture={textures.aboutMe}
          hasMoons={true}
          moonTexture={textures.moon}
        />
        <Planet
          position={[-3, 3, 0]}
          name="Experience"
          onFocus={handleFocus}
          orbitRadius={10}
          texture={textures.experience}
          hasMoons={false}
        />
        <Planet
          position={[3, -3, 0]}
          name="Projects"
          onFocus={handleFocus}
          orbitRadius={12}
          texture={textures.projects}
          hasMoons={true}
          moonTexture={textures.moon}
        />
        <Planet
          position={[8, 0, 0]}
          name="Skills"
          onFocus={handleFocus}
          orbitRadius={14}
          texture={textures.skills}
          hasMoons={false}
        />
        <Planet
          position={[0, 0, 8]}
          name="Contact"
          onFocus={handleFocus}
          orbitRadius={16}
          texture={textures.contact}
          hasMoons={true}
          moonTexture={textures.moon}
        />
        <Planet
          position={[0, 8, 0]}
          name="Hobbies"
          onFocus={handleFocus}
          orbitRadius={18}
          texture={textures.hobbies}
          hasMoons={false}
        />
        <Planet
          position={[0, -8, 0]}
          name="Education"
          onFocus={handleFocus}
          orbitRadius={18}
          texture={textures.education}
          hasMoons={true}
          moonTexture={textures.moon}
        />
        {/* Popup */}
        {target && (
          <Html position={target.position} center>
            <div
              style={{
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <h3>{target.name}</h3>
              <p>Details about {target.name}...</p>
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
}
