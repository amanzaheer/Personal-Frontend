import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Float } from "@react-three/drei";

const FONT_URL =
  "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json";

function FloatingText({ primaryColor, scrollProgress }) {
  const groupRef = useRef(null);
  const textRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Parallax: tilt and slight Y move based on scroll
      const scrollX = (scrollProgress.current - 0.5) * 0.8;
      const scrollY = (scrollProgress.current - 0.5) * 0.4;
      groupRef.current.rotation.y = scrollX * Math.PI * 0.15;
      groupRef.current.rotation.x = scrollY * Math.PI * 0.1;
      // Gentle idle float
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <Text3D
          ref={textRef}
          font={FONT_URL}
          size={0.5}
          height={0.12}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={3}
        >
          EXPLORE
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.1}
            roughness={0.7}
            emissive={primaryColor}
            emissiveIntensity={0.08}
          />
        </Text3D>
      </Float>
    </group>
  );
}

function SecondaryFloatingText({ primaryColor, scrollProgress }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      const scrollX = (scrollProgress.current - 0.5) * -0.6;
      groupRef.current.rotation.z = scrollX * Math.PI * 0.12 + Math.sin(t * 0.3) * 0.05;
      groupRef.current.position.x = Math.sin(t * 0.25) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[1.8, 0.3, -2.8]}>
      <Text3D
        font={FONT_URL}
        size={0.28}
        height={0.06}
        curveSegments={8}
        bevelEnabled
        bevelThickness={0.01}
        bevelSize={0.01}
        bevelSegments={2}
      >
        CREATE
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.05}
          roughness={0.9}
          transparent
          opacity={0.5}
        />
      </Text3D>
    </group>
  );
}

function ThirdLayerText({ primaryColor, scrollProgress }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      const scrollY = (scrollProgress.current - 0.5) * 0.5;
      groupRef.current.rotation.x = scrollY * Math.PI * 0.08;
      groupRef.current.position.z = -2.2 + Math.cos(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[-1.5, -0.2, -2.5]}>
      <Text3D
        font={FONT_URL}
        size={0.22}
        height={0.04}
        curveSegments={6}
      >
        INSPIRE
        <meshStandardMaterial
          color={primaryColor}
          metalness={0}
          roughness={1}
          transparent
          opacity={0.35}
        />
      </Text3D>
    </group>
  );
}

function Scene({ primaryColor, scrollProgress }) {
  const color = useMemo(() => {
    try {
      return primaryColor.startsWith("#") ? primaryColor : `#${primaryColor}`;
    } catch {
      return "#D25353";
    }
  }, [primaryColor]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -2, 2]} intensity={0.3} />
      <Suspense fallback={null}>
        <FloatingText primaryColor={color} scrollProgress={scrollProgress} />
        <SecondaryFloatingText primaryColor={color} scrollProgress={scrollProgress} />
        <ThirdLayerText primaryColor={color} scrollProgress={scrollProgress} />
      </Suspense>
    </>
  );
}

export default function Hero3DTextBackground({ primaryColor = "#D25353" }) {
  const scrollProgress = useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = docHeight > 0 ? window.scrollY / docHeight : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.5, zIndex: 0 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 55 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <Scene primaryColor={primaryColor} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
