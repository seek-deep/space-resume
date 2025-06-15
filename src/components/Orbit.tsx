import * as THREE from "three";
import { Line } from "@react-three/drei";

export default function Orbit({ radius }: { radius: number }) {
  // Create points for an elliptical orbit in the X-Z plane
  const points = [];
  const segments = 100;
  const a = radius; // semi-major axis
  const b = radius * 0.6; // semi-minor axis

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = a * Math.cos(theta);
    const z = b * Math.sin(theta);
    points.push(new THREE.Vector3(x, 0, z));
  }

  return (
    <Line
      points={points}
      color="white"
      lineWidth={0.2}
      dashed={true}
      dashScale={3}
      dashSize={1}
      dashOffset={1}
    />
  );
}
