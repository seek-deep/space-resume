import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Stars } from "../components/Stars"; // relative path

interface RocketLoaderProps {
  onFinish: () => void;
  loadingProgress: number;
}

function RocketScene({
  onFinish,
  loadingProgress,
}: {
  onFinish: () => void;
  loadingProgress: number;
}) {
  const rocketRef = useRef<THREE.Group>(null);
  const blackholeRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [phase, setPhase] = useState<"entry" | "follow" | "warp" | "complete">(
    "entry"
  );
  const timeRef = useRef(0);

  const { scene: rocketScene } = useGLTF("/glb/rocket_spaceship.glb");
  const { scene: blackholeScene } = useGLTF("/glb/blackhole.glb");

  useEffect(() => {
    if (rocketRef.current) {
      rocketRef.current.scale.set(3, 3, 3);
      rocketRef.current.rotation.set(0, 0, -Math.PI / 2);
    }
    if (blackholeRef.current) {
      blackholeRef.current.scale.set(1, 1, 1);
      blackholeRef.current.position.set(0, 0, -200);
    }
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (!rocketRef.current || !blackholeRef.current) return;

    if (phase === "entry") {
      // While loading, control rocket X position by loadingProgress
      if (loadingProgress < 100) {
        const x = THREE.MathUtils.lerp(-30, 5, loadingProgress / 100);
        rocketRef.current.position.set(x, 0, 0);
        camera.position.set(0, 0, 30);
        camera.lookAt(0, 0, 0);
        timeRef.current = 0;
        return;
      }
    }

    timeRef.current += delta;

    switch (phase) {
      case "entry": {
        // Only start entry animation after loading is complete
        const progressEntry = Math.min(timeRef.current / 3, 1);
        const x = THREE.MathUtils.lerp(-30, 5, progressEntry - 0.1);
        rocketRef.current.position.set(x, 0, 0);
        if (progressEntry === 1) {
          setPhase("follow");
          timeRef.current = 0;
        }
        break;
      }

      case "follow": {
        const progressFollow = Math.min(timeRef.current / 1.5, 1);
        const orbitRadius = 12;
        const angle = -Math.PI / 2;
        const offsetX = Math.sin(angle) * orbitRadius;
        const offsetZ = Math.cos(angle) * orbitRadius;
        const offsetY = 10;

        const targetPos = rocketRef.current.position
          .clone()
          .add(new THREE.Vector3(offsetX, offsetY, offsetZ));
        camera.position.lerp(targetPos, 0.05);
        camera.lookAt(rocketRef.current.position);

        if (progressFollow === 1) {
          setPhase("warp");
          timeRef.current = 0;
        }
        break;
      }

      case "warp": {
        const progressWarp = Math.min(timeRef.current / 4, 1);

        // 🚀 Pull rocket deeper into space
        rocketRef.current.position.z -= delta * (100 + progressWarp * 400);

        // 📉 Scale rocket down to simulate distant pull
        const rocketScale = THREE.MathUtils.lerp(3, 0.3, progressWarp);
        rocketRef.current.scale.set(rocketScale, rocketScale, rocketScale);

        // 🎥 Camera stays behind and above
        const orbitRadius = 12;
        const angle = -Math.PI / 2;
        const offsetX = Math.sin(angle) * orbitRadius;
        const offsetZ = Math.cos(angle) * orbitRadius;
        const offsetY = 10;

        const targetPos = rocketRef.current.position
          .clone()
          .add(new THREE.Vector3(offsetX, offsetY, offsetZ));
        camera.position.copy(targetPos);
        camera.lookAt(rocketRef.current.position);

        // 🌀 Blackhole appears smoothly ahead of rocket
        const blackholeTarget = rocketRef.current.position
          .clone()
          .add(new THREE.Vector3(1, 1, 1));
        blackholeRef.current.position.copy(blackholeTarget);

        // Smooth scale-in only in second half of warp
        const reveal = Math.max(0, progressWarp - 0.1);
        const blackholeScale = THREE.MathUtils.lerp(0.01, 30, reveal);
        blackholeRef.current.scale.set(
          blackholeScale,
          blackholeScale,
          blackholeScale
        );

        // Optional: smooth opacity if material supports it
        blackholeRef.current.traverse((child) => {
          if ((child as THREE.Mesh).material) {
            const material = (child as THREE.Mesh)
              .material as THREE.MeshStandardMaterial;
            if (material.transparent) {
              material.opacity = reveal;
            }
          }
        });

        if (progressWarp === 1) {
          setPhase("complete");
          timeRef.current = 0;
          onFinish();
        }
        break;
      }

      case "complete":
        break;
    }
  });

  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <ambientLight intensity={0.5} />
      <primitive object={rocketScene} ref={rocketRef} />
      <primitive object={blackholeScene} ref={blackholeRef} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={2}
      />
    </>
  );
}

export default function RocketLoader({
  onFinish,
  loadingProgress,
}: RocketLoaderProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleComplete = () => {
      setTimeout(() => {
        setOpacity(0);
      }, 6000);
    };
    handleComplete();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black"
      style={{
        opacity,
        transition: "opacity 1s ease-in-out",
      }}
    >
      <Canvas camera={{ fov: 75, position: [0, 0, 30] }}>
        <RocketScene onFinish={onFinish} loadingProgress={loadingProgress} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/glb/rocket_spaceship.glb");
useGLTF.preload("/glb/blackhole.glb");
