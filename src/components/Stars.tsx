import * as React from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  AdditiveBlending,
  ShaderMaterial,
  Vector3,
  Spherical,
} from "three";

class StarfieldMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0.0 },
        fade: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        uniform float time;
        attribute float size;
        attribute float twinklePhase;
        attribute float twinkleAmplitude;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
          float twinkle = 1.0 + twinkleAmplitude * sin(time * 2.0 + twinklePhase * 6.2831);
          gl_PointSize = size * (30.0 / -mvPosition.z) * twinkle;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D pointTexture;
        uniform float fade;
        varying vec3 vColor;
        void main() {
          float opacity = 1.0;
          if (fade == 1.0) {
            float d = distance(gl_PointCoord, vec2(0.5, 0.5));
            opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
          }
          gl_FragColor = vec4(vColor, opacity);

          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
  }
}

// Add props interface
type StarsProps = {
  radius?: number;
  depth?: number;
  count?: number;
  saturation?: number;
  factor?: number;
  fade?: boolean;
  speed?: number;
};

const genStar = (r: number) =>
  new Vector3().setFromSpherical(
    new Spherical(
      r,
      Math.acos(1 - Math.random() * 2),
      Math.random() * 2 * Math.PI
    )
  );

const Stars = React.forwardRef<any, StarsProps>(
  (
    {
      radius = 100,
      depth = 50,
      count = 5000,
      saturation = 0,
      factor = 4,
      fade = false,
      speed = 1,
    }: StarsProps,
    ref
  ) => {
    // Type the material ref
    const material = React.useRef<StarfieldMaterial | null>(null);

    const [position, color, size, twinklePhase, twinkleAmplitude] =
      React.useMemo(() => {
        const positions = [];
        const colors = [];
        const sizes = Array.from(
          { length: count },
          () => (0.5 + 0.5 * Math.random()) * factor
        );
        const phases = Array.from({ length: count }, () => Math.random());
        const amplitudes = Array.from({ length: count }, () =>
          Math.random() < 0.5 ? 0.0 : 0.5 + 0.5 * Math.random()
        );
        const color = new Color();
        let r = radius + depth;
        const increment = depth / count;

        for (let i = 0; i < count; i++) {
          r -= increment * Math.random();
          positions.push(...genStar(r).toArray());
          color.setHSL(Math.random(), saturation, 0.9);
          colors.push(color.r, color.g, color.b);
        }

        return [
          new Float32Array(positions),
          new Float32Array(colors),
          new Float32Array(sizes),
          new Float32Array(phases),
          new Float32Array(amplitudes),
        ];
      }, [count, depth, factor, radius, saturation]);

    useFrame((state) => {
      if (material.current) {
        material.current.uniforms.time.value = state.clock.elapsedTime * speed;
      }
    });

    const [starfieldMaterial] = React.useState(() => new StarfieldMaterial());

    return (
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[position, 3]} />
          <bufferAttribute attach="attributes-color" args={[color, 3]} />
          <bufferAttribute attach="attributes-size" args={[size, 1]} />
          <bufferAttribute
            attach="attributes-twinklePhase"
            args={[twinklePhase, 1]}
          />
          <bufferAttribute
            attach="attributes-twinkleAmplitude"
            args={[twinkleAmplitude, 1]}
          />
        </bufferGeometry>
        <primitive
          ref={material}
          object={starfieldMaterial}
          attach="material"
          blending={AdditiveBlending}
          uniforms-fade-value={fade}
          depthWrite={false}
          transparent
          vertexColors
        />
      </points>
    );
  }
);

export { Stars };
