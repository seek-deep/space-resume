import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SimplexNoise } from "three/examples/jsm/Addons.js";

const simplex = new SimplexNoise();

export default function AsteroidBelt({ orbitRadius }: { orbitRadius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const numAsteroids = 300;

  const asteroidsRef = useRef(
    Array.from({ length: numAsteroids }, () => {
      const angle = Math.random() * Math.PI * 2;
      const clusterNoise = simplex.noise(
        Math.cos(angle) * 2,
        Math.sin(angle) * 2
      );
      const noisyAngle = angle + clusterNoise * 0.2;

      const radiusOffset = Math.random() * 1.5 - 0.75;
      const radius = orbitRadius + radiusOffset;

      const x = radius * Math.cos(noisyAngle);
      const z = radius * Math.sin(noisyAngle);
      const y = (Math.random() - 0.5) * 0.25;

      const rotX = Math.random() * Math.PI * 2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = Math.random() * Math.PI * 2;

      const baseSize = Math.random() * 0.15 + 0.05;
      const orbitSpeed =
        (0.0001 + Math.random() * 0.00005) * (1 / Math.sqrt(radius));

      return {
        position: [x, y, z] as [number, number, number],
        rotation: [rotX, rotY, rotZ] as [number, number, number],
        baseSize,
        angle: noisyAngle,
        radius,
        orbitSpeed,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        hasCrater: Math.random() < 0.4,
        craterPos: new THREE.Vector3(
          (Math.random() - 0.5) * baseSize * 1.5,
          (Math.random() - 0.5) * baseSize * 1.5,
          (Math.random() - 0.5) * baseSize * 1.5
        ),
      };
    })
  );

  useFrame(() => {
    if (!groupRef.current) return;

    asteroidsRef.current.forEach((asteroid, index) => {
      const mesh = groupRef.current?.children[index] as THREE.Mesh;
      if (!mesh) return;

      asteroid.angle += asteroid.orbitSpeed;
      const x = asteroid.radius * Math.cos(asteroid.angle);
      const z = asteroid.radius * Math.sin(asteroid.angle);
      mesh.position.set(x, asteroid.position[1], z);

      mesh.rotation.x += asteroid.rotationSpeed;
      mesh.rotation.y += asteroid.rotationSpeed * 0.8;
      mesh.rotation.z += asteroid.rotationSpeed * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {asteroidsRef.current.map((asteroid, index) => {
        const geometry = new THREE.IcosahedronGeometry(asteroid.baseSize, 3); // ⬅️ More subdivisions (smoother)

        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < posAttr.count; i++) {
          vertex.fromBufferAttribute(posAttr, i);

          const noise = simplex.noise3d(
            vertex.x * 3,
            vertex.y * 3,
            vertex.z * 3
          );

          // Crater logic (soft dimples, not holes)
          const craterEffect = asteroid.hasCrater
            ? 1 - Math.exp(-vertex.distanceTo(asteroid.craterPos) * 6)
            : 1;

          const displacement = 1 + noise * 0.25 * craterEffect;
          vertex.multiplyScalar(displacement);
          posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();

        // Optional: subtle color variation (gradient-like)
        const colors = [];
        for (let i = 0; i < posAttr.count; i++) {
          vertex.fromBufferAttribute(posAttr, i);
          const color = new THREE.Color();
          const shade = 0.4 + 0.3 * Math.random(); // grayscale range
          color.setRGB(shade, shade * 0.95, shade * 0.9);
          colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3)
        );

        return (
          <mesh
            key={index}
            position={asteroid.position}
            rotation={asteroid.rotation}
            geometry={geometry}
          >
            <meshStandardMaterial
              vertexColors={true}
              roughness={0.95}
              metalness={0.05}
              flatShading={false}
              transparent={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
