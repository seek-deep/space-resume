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
  "👋 Welcome to my Space Resume! Click and drag to explore the galaxy, or zoom in and click on any moon to learn more about me.",
  "🚀 Built with React Three Fiber, TypeScript & ❤️",
  "🌌 Each planet shows a different part of my journey.",
  "📦 Don’t forget to click on the moons!",
  "🔎 Zoom in to see details up close.",
];

// Store the initial welcome message separately if we want to ensure it's always first
// and then cycle through the others. For now, it's just the first in the array.

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
    // Start the interval on component mount and always run it
    tooltipInterval.current = setInterval(() => {
      setCurrentTooltip((prev) => (prev + 1) % avatarTooltips.length);
    }, 6000); // Rotate every 6 seconds (between 5-7s)

    // Clear interval on component unmount
    return () => {
      if (tooltipInterval.current) {
        clearInterval(tooltipInterval.current);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  useFrame((state, delta) => {
    if (!group.current) return;

    // Fixed bottom-right screen position in world space
    const screenPosNdc = new THREE.Vector3();
    // Adjust margins to ensure the avatar's body is fully visible, not just its origin.
    // These values might need tweaking based on avatar size and camera FOV.
    // Let's try to bring it slightly more into the screen.
    const marginX = 0.75; // Closer to center from right edge
    const marginY = 0.75; // Closer to center from bottom edge

    // Use z = -1 for the near plane, ensuring it's always in front.
    // (NDC: -1 to +1 for X and Y, -1 (near) to +1 (far) for Z)
    screenPosNdc.set(marginX, -marginY, -1);
    screenPosNdc.unproject(camera); // Convert NDC to world space point on the near plane

    // To prevent the avatar from being too far or too close when camera moves,
    // we'll place it at a fixed distance from the camera, but along the direction
    // that corresponds to the bottom-right of the screen.

    // Get the camera's current position and direction
    const cameraPosition = camera.position.clone();
    const viewDirection = new THREE.Vector3();
    camera.getWorldDirection(viewDirection);

    // Calculate the target position:
    // Start from camera position.
    // Move along the direction from camera to the unprojected screen point (screenPosNdc).
    // This ensures the avatar stays in the bottom-right of the viewport.
    // The distance should be small enough to be 'in front' but large enough to be visible.

    const desiredDistanceInFront = 2.5; // Adjust this distance as needed.
                                       // Smaller makes it closer and larger on screen.
                                       // Larger makes it further and smaller on screen.

    // Vector from camera to the point on the near plane representing bottom-right
    const directionToScreenPoint = screenPosNdc.clone().sub(cameraPosition).normalize();

    // New position for the avatar
    const targetPosition = cameraPosition.clone().add(directionToScreenPoint.multiplyScalar(desiredDistanceInFront));

    group.current.position.copy(targetPosition);

    // Always face camera (look at a point slightly in front of the camera along its view direction)
    // This prevents the avatar from looking 'through' the camera if it's too close.
    const lookAtPosition = camera.position.clone().add(viewDirection.multiplyScalar(10));
    group.current.lookAt(lookAtPosition);

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
      // Keep hover for waving animation, but not for tooltip visibility
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <pointLight position={[0, 2, 2]} intensity={2} color="#ffffff" />
      <directionalLight position={[2, 5, 2]} intensity={3} color="#ffffff" />
      <ambientLight intensity={0.5} />

      <primitive object={gltf.scene} />

      {/* Tooltip is now always rendered */}
      <Html
        position={[0, 2.5, 0]} // Position above avatar's head
        center
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          padding: "12px 20px",
          borderRadius: "12px",
          color: "white",
          width: "300px", // Adjusted width for potentially longer welcome message
          textAlign: "center",
          fontSize: "14px",
          pointerEvents: "none", // Important so it doesn't block mouse events for avatar
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          // Opacity is now always 1, transition removed
        }}
      >
        {avatarTooltips[currentTooltip]}
      </Html>
    </group>
  );
}

useGLTF.preload("https://models.readyplayer.me/684d734f5ff6c5b89015b07a.glb");
