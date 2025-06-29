import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: { [key: string]: THREE.Object3D };
  materials: { [key: string]: THREE.Material };
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const avatarTooltips = [
  "👋 Welcome to my Space Resume! Click and drag to explore the galaxy, or zoom in and click on any moon to learn more about me.",
  "🚀 Built with React Three Fiber, TypeScript & ❤️",
  "🌌 Each planet shows a different part of my journey.",
  "📦 Don’t forget to click on the moons!",
  "🔎 Zoom in to see details up close.",
];

export default function AssistantAvatar() {
  const group = useRef<THREE.Group>(null);
  const headBone = useRef<THREE.Bone | null>(null);
  const rightArmBone = useRef<THREE.Bone | null>(null);
  const rightForeArmBone = useRef<THREE.Bone | null>(null);
  const rightHandBone = useRef<THREE.Bone | null>(null);
  const initialArmRotations = useRef<{ [key: string]: THREE.Euler }>({});
  const { camera, pointer } = useThree();
  const [hovered, setHovered] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState(0);
  const tooltipInterval = useRef<NodeJS.Timeout | null>(null);
  const tooltipIndexRef = useRef(0);
  const [hasLoopedOnce, setHasLoopedOnce] = useState(false);
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
          if (node.name === "Head") headBone.current = bone;
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
    tooltipInterval.current = setInterval(() => {
      setCurrentTooltip((prev) => (prev + 1) % avatarTooltips.length);
    }, 20000);
    return () => {
      if (tooltipInterval.current) clearInterval(tooltipInterval.current);
    };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;

    const screenPosNdc = new THREE.Vector3();
    const marginX = 0.85;
    const marginY = 0.9;
    screenPosNdc.set(marginX, -marginY, -1);
    screenPosNdc.unproject(camera);

    const cameraPosition = camera.position.clone();
    const directionToScreenPoint = screenPosNdc
      .clone()
      .sub(cameraPosition)
      .normalize();
    const desiredDistanceInFront = 2.5;
    const targetPosition = cameraPosition
      .clone()
      .add(directionToScreenPoint.multiplyScalar(desiredDistanceInFront));

    group.current.position.copy(targetPosition);
    group.current.rotation.set(0, 0, 0);
    const lookAtPosition = new THREE.Vector3(1, -1, 1);

    group.current.lookAt(lookAtPosition);
    group.current.rotateY(2.5);

    if (headBone.current) {
      const maxX = 0.6;
      const maxY = 0.8;

      const localOriginX = 0.85;
      const localOriginY = -0.85;

      const adjustedX = pointer.x - localOriginX;
      const adjustedY = pointer.y - localOriginY;

      const targetY = clamp(adjustedX * maxY, -maxY, maxY);
      const targetX = clamp(-adjustedY * maxX, -maxX, maxX);

      headBone.current.rotation.x = targetX;
      headBone.current.rotation.y = targetY;
      headBone.current.updateMatrixWorld(true);
    }

    bobAnimation.current += delta;
    const floatOffset = Math.sin(bobAnimation.current * 1.5) * 0.05;
    group.current.position.y = targetPosition.y + floatOffset;

    if (
      hovered &&
      rightArmBone.current &&
      rightForeArmBone.current &&
      rightHandBone.current
    ) {
      waveAnimation.current += delta * 8;
      const armLift = -Math.PI / 4;
      const armOut = Math.PI / 10;
      const forearmBend = Math.PI / 6;
      const forearmSwingZ = -Math.sin(waveAnimation.current) * 0.3 - 1.2;
      const handWaveZ = Math.sin(waveAnimation.current) * 0.7;

      rightArmBone.current.rotation.set(armLift, Math.PI / 2, armOut);
      rightForeArmBone.current.rotation.set(forearmBend, 0, forearmSwingZ);
      rightHandBone.current.rotation.z = handWaveZ;

      rightArmBone.current.updateMatrixWorld(true);
      rightForeArmBone.current.updateMatrixWorld(true);
      rightHandBone.current.updateMatrixWorld(true);
    } else {
      if (rightArmBone.current && initialArmRotations.current.rightArm)
        rightArmBone.current.rotation.copy(
          initialArmRotations.current.rightArm
        );
      if (rightForeArmBone.current && initialArmRotations.current.rightForeArm)
        rightForeArmBone.current.rotation.copy(
          initialArmRotations.current.rightForeArm
        );
      if (rightHandBone.current && initialArmRotations.current.rightHand)
        rightHandBone.current.rotation.copy(
          initialArmRotations.current.rightHand
        );
    }
  });

  useEffect(() => {
    startTooltipCycle();
    return () => {
      if (tooltipInterval.current) clearInterval(tooltipInterval.current);
    };
  }, []);

  const startTooltipCycle = () => {
    tooltipInterval.current = setInterval(() => {
      tooltipIndexRef.current += 1;

      if (tooltipIndexRef.current < avatarTooltips.length) {
        setCurrentTooltip(tooltipIndexRef.current);
      } else {
        clearInterval(tooltipInterval.current!);
        tooltipInterval.current = null;
        tooltipIndexRef.current = 0;
        setHasLoopedOnce(true);
        setCurrentTooltip(0);
      }
    }, 6000);
  };

  if (!gltf.scene) return null;

  return (
    <group
      ref={group}
      scale={0.3}
      onPointerOver={() => {
        setHovered(true);
        if (hasLoopedOnce && !tooltipInterval.current) startTooltipCycle();
      }}
      onPointerOut={() => setHovered(false)}
    >
      <pointLight position={[0, 2, 2]} intensity={2} color="#ffffff" />
      <directionalLight position={[2, 5, 2]} intensity={3} color="#ffffff" />
      <ambientLight intensity={0.5} />
      <primitive object={gltf.scene} />
      <Html
        position={[-0.3, 2.35, 0]}
        center
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          padding: "12px 20px",
          borderRadius: "12px",
          color: "white",
          width: "300px",
          textAlign: "center",
          fontSize: "14px",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {avatarTooltips[currentTooltip]}
      </Html>
    </group>
  );
}

useGLTF.preload("https://models.readyplayer.me/684d734f5ff6c5b89015b07a.glb");
