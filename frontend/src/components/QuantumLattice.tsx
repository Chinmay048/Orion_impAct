import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Line, Sphere, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// --- COMPONENT: THE MASSIVE DATA CLOUD ---
// Creates thousands of interconnected points forming a shifting globe
const DataCloud = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Generate 4000 points on a sphere
  const positions = useMemo(() => {
    const positions = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const r = 4 + Math.random() * 2; // Radius between 4 and 6
      const theta = THREE.MathUtils.degToRad(Math.random() * 360);
      const phi = THREE.MathUtils.degToRad(Math.random() * 180);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Slow, majestic rotation
      ref.current.rotation.y += delta * 0.05;
      // Subtle breathing effect
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0ea5e9" // Sky blue
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// --- COMPONENT: ORBITING "HERO" CARGO ---
// High-detail floating containers representing key shipments
const HeroCargo = ({ position, rotationSpeed, color }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((_state, delta) => {
        if(ref.current) {
            ref.current.rotation.x += delta * rotationSpeed;
            ref.current.rotation.y += delta * rotationSpeed * 0.5;
        }
    })

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <group ref={ref} position={position}>
                {/* The Container Box */}
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    {/* Advanced material meant to catch light and glow */}
                    <meshPhysicalMaterial 
                        color={color}
                        emissive={color}
                        emissiveIntensity={2} // High intensity for bloom effect
                        roughness={0.2}
                        metalness={1}
                        clearcoat={1}
                    />
                </mesh>
                 {/* Wireframe cage around it */}
                <mesh>
                     <boxGeometry args={[1.1, 1.1, 1.1]} />
                     <meshBasicMaterial wireframe color="white" transparent opacity={0.1} />
                </mesh>
            </group>
        </Float>
    )
}

// --- COMPONENT: ENERGY CONDUITS ---
// Abstract lines connecting the core
const Conduits = () => {
    const group = useRef<THREE.Group>(null);
    useFrame((_state, delta) => {
        if(group.current) group.current.rotation.z -= delta * 0.1;
    })

    const rings = useMemo(() => {
        return new Array(5).fill(0).map((_, i) => {
            const radius = 5 + i * 0.5;
            const points = [];
            for (let j = 0; j <= 64; j++) {
                const angle = (j / 64) * Math.PI * 2;
                points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
            }
            return points;
        });
    }, []);

    return (
        <group ref={group} rotation={[Math.PI / 2, 0, 0]}> {/* Rotate flat */}
            {rings.map((points, i) => (
                 <Line 
                    key={i} 
                    points={points} 
                    color={i % 2 === 0 ? "#38bdf8" : "#10b981"} 
                    lineWidth={2}
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                 />
            ))}
        </group>
    )
}

// --- MAIN SCENE ---
export default function QuantumLattice() {
  return (
    <div className="absolute inset-0 z-0 bg-black w-full h-full">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }} gl={{ antialias: false }}>
        <color attach="background" args={['#000000']} />
        
        {/* Volumetric Fog for depth */}
        <fog attach="fog" args={['#000000', 10, 25]} />

        {/* --- LIGHTING --- */}
        <ambientLight intensity={0.2} />
        {/* Dramatic side lighting */}
        <spotLight position={[20, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#38bdf8" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />

        {/* --- SCENE OBJECTS --- */}
        <group rotation={[0, 0, Math.PI / 6]}> {/* Tilted axis for coolness */}
            <DataCloud />
            <Conduits />
            
            {/* Hero Cargo Objects orbiting at different distances */}
            <HeroCargo position={[5, 0, 0]} rotationSpeed={0.5} color="#38bdf8" />
            <HeroCargo position={[-4, 3, 2]} rotationSpeed={0.3} color="#10b981" />
            <HeroCargo position={[0, -5, 1]} rotationSpeed={0.7} color="#f43f5e" />
            
            {/* Central Core Sphere */}
             <Sphere args={[2, 32, 32]}>
                <meshStandardMaterial color="black" roughness={0.1} metalness={0.9} envMapIntensity={1} />
             </Sphere>
        </group>
        
        {/* --- POST PROCESSING (THE GLOW EFFECT) --- */}
        {/* This is what makes it look expensive */}
        <EffectComposer multisampling={0}>
            <Bloom 
                intensity={1.5} // How bright the glow is
                luminanceThreshold={0.9} // Only very bright things glow
                luminanceSmoothing={0.025} 
                mipmapBlur // Smooths the glow
            />
             <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Environment reflections for metallic objects */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}