// AssistantAvatar.tsx
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Object3D;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const avatarTooltips = [
  "🚀 Full-Stack Dev with 3+ years experience",
  "🌐 Built scalable apps with MERN & Next.js",
  "🔐 Expert in secure backend API design",
  "🧠 Loves solving complex system architecture",
  "☁️ Skilled in AWS, Docker, Firebase",
  "🎓 BTech from MIT ADT, Pune",
  "📈 Optimized SSR to reduce load times by 40%",
  "🧑‍💻 Contributor to open source on GitHub",
  "📊 Deep learning + trading enthusiast",
  "🛠️ Microservices and monolith killer",
];

export default function AssistantAvatar() {
  const group = useRef<THREE.Group>(null);
  const headBone = useRef<THREE.Bone | null>(null);
  const rightArmBone = useRef<THREE.Bone | null>(null);
  const rightForeArmBone = useRef<THREE.Bone | null>(null);
  const rightHandBone = useRef<THREE.Bone | null>(null);
  const initialArmRotations = useRef<{ [key: string]: THREE.Euler }>({});
  const { camera, pointer, size } = useThree();
  const [hovered, setHovered] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState(0);
  const tooltipInterval = useRef<NodeJS.Timeout | null>(null);
  const bobAnimation = useRef(0);
  const waveAnimation = useRef(0);

  const gltf = useGLTF(
    "https://models.readyplayer.me/684d734f5ff6c5b89015b07a.glb"
  ) as unknown as GLTFResult;

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((node) => {
        if (node.type === "Bone") {
          const bone = node as THREE.Bone;

          if (node.name === "Head") {
            headBone.current = bone;
          }

          if (node.name.includes("RightArm")) {
            rightArmBone.current = bone;
            initialArmRotations.current.rightArm = bone.rotation.clone();
          }
          if (node.name.includes("RightForeArm")) {
            rightForeArmBone.current = bone;
            initialArmRotations.current.rightForeArm = bone.rotation.clone();
          }
          if (node.name.includes("RightHand")) {
            rightHandBone.current = bone;
            initialArmRotations.current.rightHand = bone.rotation.clone();
          }
        }
      });
    }
  }, [gltf.scene]);

  useEffect(() => {
    if (hovered) {
      tooltipInterval.current = setInterval(() => {
        setCurrentTooltip((prev) => (prev + 1) % avatarTooltips.length);
      }, 3000); // Rotate every 3 seconds
    } else {
      if (tooltipInterval.current) {
        clearInterval(tooltipInterval.current);
      }
    }
    return () => {
      if (tooltipInterval.current) {
        clearInterval(tooltipInterval.current);
      }
    };
  }, [hovered]);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Fixed bottom-right screen position in world space
    const screenPos = new THREE.Vector3();
    const marginX = 0.85;
    const marginY = 0.85;
    screenPos.set(marginX, -marginY, 1);
    screenPos.unproject(camera);
    const cameraPos = camera.position.clone();
    const direction = screenPos.sub(cameraPos).normalize();
    const distance = 4;
    const targetPosition = cameraPos.add(direction.multiplyScalar(distance));
    group.current.position.copy(targetPosition);

    // Always face camera
    group.current.lookAt(camera.position);

    // Head tracking (relative to pointer)
    if (headBone.current) {
      const maxX = 0.3;
      const maxY = 0.5;

      // 👇 New: Use offset center to match avatar's bottom-right position
      const localCenterX = 0.85; // near right edge
      const localCenterY = -0.85; // near bottom

      const adjustedX = pointer.x - localCenterX;
      const adjustedY = pointer.y - localCenterY;

      const targetX = clamp(adjustedY * maxX, -maxX, maxX);
      const targetY = clamp(adjustedX * maxY, -maxY, maxY);

      headBone.current.rotation.x = -targetX * 0.5;
      headBone.current.rotation.y = targetY;
      headBone.current.updateMatrixWorld(true);
    }

    // Floating
    bobAnimation.current += delta;
    const floatOffset = Math.sin(bobAnimation.current * 1.5) * 0.05;
    group.current.position.y += floatOffset;

    // Waving
    if (
      hovered &&
      rightArmBone.current &&
      rightForeArmBone.current &&
      rightHandBone.current
    ) {
      waveAnimation.current += delta * 8;

      // Arm pose
      const armLift = -Math.PI / 4;
      const armOut = Math.PI / 10;
      const forearmBend = Math.PI / 6;

      // 👋 Natural waving arc
      const forearmSwingZ = -Math.sin(waveAnimation.current) * 0.3 - 1.2;
      const handWaveZ = Math.sin(waveAnimation.current) * 0.7;

      // Upper arm
      rightArmBone.current.rotation.x = armLift;
      rightArmBone.current.rotation.z = armOut;
      rightArmBone.current.rotation.y = Math.PI / 2;

      // Forearm swing (toward/away from head)
      rightForeArmBone.current.rotation.x = forearmBend;
      rightForeArmBone.current.rotation.z = forearmSwingZ;

      // Hand wave
      rightHandBone.current.rotation.z = handWaveZ;

      // Update bones
      rightArmBone.current.updateMatrixWorld(true);
      rightForeArmBone.current.updateMatrixWorld(true);
      rightHandBone.current.updateMatrixWorld(true);
    } else {
      if (rightArmBone.current && initialArmRotations.current.rightArm) {
        rightArmBone.current.rotation.copy(
          initialArmRotations.current.rightArm
        );
      }
      if (
        rightForeArmBone.current &&
        initialArmRotations.current.rightForeArm
      ) {
        rightForeArmBone.current.rotation.copy(
          initialArmRotations.current.rightForeArm
        );
      }
      if (rightHandBone.current && initialArmRotations.current.rightHand) {
        rightHandBone.current.rotation.copy(
          initialArmRotations.current.rightHand
        );
      }
    }
  });

  if (!gltf.scene) return null;

  return (
    <group
      ref={group}
      scale={0.7}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <pointLight position={[0, 2, 2]} intensity={2} color="#ffffff" />
      <directionalLight position={[2, 5, 2]} intensity={3} color="#ffffff" />
      <ambientLight intensity={0.5} />

      <primitive object={gltf.scene} />

      {hovered && (
        <Html
          position={[0, 2.5, 0]}
          center
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            padding: "12px 20px",
            borderRadius: "12px",
            color: "white",
            width: "280px",
            textAlign: "center",
            fontSize: "14px",
            pointerEvents: "none",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "opacity 0.3s ease",
            opacity: hovered ? 1 : 0,
          }}
        >
          {avatarTooltips[currentTooltip]}
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("https://models.readyplayer.me/684d734f5ff6c5b89015b07a.glb");
