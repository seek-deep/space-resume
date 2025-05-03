import { Line } from "@react-three/drei";

export default function Orbit({ radius }: { radius: number }) {
  const points = Array.from({ length: 65 }, (_, i) => {
    const angle = (i / 64) * Math.PI * 2; // 65 points to close the circle
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]; // Keep y = 0 for the same plane
  });

  return <Line points={points} color="white" lineWidth={1} />;
}
