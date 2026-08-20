import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { 
  Satellite, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Eye, 
  ShieldCheck, 
  ChevronDown
} from "lucide-react";

// --- Procedural Crumpled Gold Foil Cylinder Body ---
function CrumpledGoldFoilBody() {
  // Generate wrinkled/crumpled surface geometry using mathematical vertex jitter
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.52, 0.52, 0.9, 48, 32);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Leave top and bottom caps flat; wrinkle only the outer curved cylinder wall
      if (Math.abs(v.y) < 0.44) {
        const angle = Math.atan2(v.z, v.x);
        // Multi-frequency fold noise simulating wrinkled aluminum foil
        const foldNoise = 
          Math.sin(angle * 14 + v.y * 18) * 0.016 + 
          Math.cos(angle * 28 - v.y * 32) * 0.012 +
          Math.sin(v.y * 42) * 0.008;

        const radialScale = 1 + foldNoise;
        v.x *= radialScale;
        v.z *= radialScale;
        pos.setXYZ(i, v.x, v.y, v.z);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial 
        color="#fbbf24" 
        emissive="#b45309" 
        emissiveIntensity={0.35} 
        metalness={0.98} 
        roughness={0.18} 
        clearcoat={1.0} 
        clearcoatRoughness={0.12} 
        reflectivity={1.0} 
      />
    </mesh>
  );
}

// --- Single Articulated High-Gloss Solar Wing (Left/Right) ---
function SingleSolarWing({ width = 2.4, height = 0.85, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Structural Composite Outer Frame */}
      <mesh>
        <boxGeometry args={[width, height, 0.024]} />
        <meshPhysicalMaterial color="#090d16" metalness={0.9} roughness={0.25} clearcoat={0.8} />
      </mesh>

      {/* Front Face: High-Gloss Sapphire Photovoltaic Cells */}
      <mesh position={[0, 0, 0.014]}>
        <boxGeometry args={[width * 0.95, height * 0.9, 0.008]} />
        <meshPhysicalMaterial 
          color="#0284c7"
          emissive="#034694"
          emissiveIntensity={0.32}
          metalness={0.98}
          roughness={0.02}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back Face: High-Gloss Sapphire Photovoltaic Cells */}
      <mesh position={[0, 0, -0.014]}>
        <boxGeometry args={[width * 0.95, height * 0.9, 0.008]} />
        <meshPhysicalMaterial 
          color="#0284c7"
          emissive="#034694"
          emissiveIntensity={0.32}
          metalness={0.98}
          roughness={0.02}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Embedded Gold Grid Busbars */}
      {[-0.35, -0.12, 0.12, 0.35].map((xRatio, i) => (
        <React.Fragment key={i}>
          <mesh position={[xRatio * width, 0, 0.019]}>
            <boxGeometry args={[0.012, height * 0.9, 0.004]} />
            <meshPhysicalMaterial color="#fcd34d" metalness={1.0} roughness={0.1} />
          </mesh>
          <mesh position={[xRatio * width, 0, -0.019]}>
            <boxGeometry args={[0.012, height * 0.9, 0.004]} />
            <meshPhysicalMaterial color="#fcd34d" metalness={1.0} roughness={0.1} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Titanium Mounting Truss & Rotating Pivot */}
      <mesh position={[width * 0.53, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.16, 16]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={1.0} roughness={0.08} clearcoat={1.0} />
      </mesh>
      <mesh position={[width * 0.53, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

// --- 3D Exploded-to-Assembled Spacecraft Scene ---
function ExplodedSatellite({ scrollProgress, isMobile }) {
  const groupRef = useRef();

  const hoodRef = useRef();
  const collarRef = useRef();
  const goldBodyRef = useRef();
  const baseRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const dishRef = useRef();

  // Burst exploded starting coordinates [x, y, z]
  const explodedPositions = {
    hood: [0, isMobile ? 2.6 : 3.8, isMobile ? 1.4 : 1.0],
    collar: [0, isMobile ? 1.6 : 2.4, isMobile ? -0.8 : -0.8],
    goldBody: [0, isMobile ? 0.4 : 0.8, isMobile ? -1.0 : -1.2],
    base: [0, isMobile ? -1.8 : -2.6, isMobile ? 0.8 : 0.8],
    leftWing: [isMobile ? -1.8 : -4.8, isMobile ? 1.4 : 1.8, isMobile ? 1.2 : 1.5],
    rightWing: [isMobile ? 1.8 : 4.8, isMobile ? -1.4 : -1.8, isMobile ? -1.2 : -1.5],
    dish: [isMobile ? 0.9 : 2.8, isMobile ? 1.8 : 2.4, isMobile ? 1.5 : 2.2],
  };

  // Mechanically locked assembled coordinates [x, y, z]
  const assembledPositions = {
    hood: [0, 0.85, 0],
    collar: [0, 0.50, 0],
    goldBody: [0, 0.0, 0],
    base: [0, -0.65, 0],
    leftWing: [-1.82, -0.05, 0],
    rightWing: [1.82, -0.05, 0],
    dish: [0.42, 0.46, 0.40],
  };

  useFrame((state) => {
    const progress = Math.min(Math.max(scrollProgress / 0.25, 0), 1);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.4, Math.PI * 2 + 0.3, scrollProgress) + state.clock.elapsedTime * 0.14;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0.2, -0.1, scrollProgress);
    }

    const lerpMesh = (ref, key) => {
      if (!ref.current) return;
      const start = explodedPositions[key];
      const target = assembledPositions[key];

      ref.current.position.x = THREE.MathUtils.lerp(start[0], target[0], progress);
      ref.current.position.y = THREE.MathUtils.lerp(start[1], target[1], progress);
      ref.current.position.z = THREE.MathUtils.lerp(start[2], target[2], progress);

      ref.current.rotation.x = THREE.MathUtils.lerp(start[1] * 0.25, 0, progress);
      ref.current.rotation.z = THREE.MathUtils.lerp(start[0] * 0.2, 0, progress);
    };

    lerpMesh(hoodRef, "hood");
    lerpMesh(collarRef, "collar");
    lerpMesh(goldBodyRef, "goldBody");
    lerpMesh(baseRef, "base");
    lerpMesh(leftWingRef, "leftWing");
    lerpMesh(rightWingRef, "rightWing");
    lerpMesh(dishRef, "dish");
  });

  const baseScale = isMobile ? 0.62 : 1.0;
  const posY = isMobile ? 0.85 : 0.05;

  return (
    <group ref={groupRef} position={[0, posY, 0]} scale={[baseScale, baseScale, baseScale]}>
      
      {/* 1. Slanted Carbon Sunshield Hood */}
      <group ref={hoodRef}>
        <mesh position={[0, 0.24, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.02, 0.38, 0.52, 32, 1, true]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.2} clearcoat={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Internal Sensor Aperture Glow */}
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 32]} />
          <meshPhysicalMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={2.5} transmission={0.5} roughness={0.02} />
        </mesh>
      </group>

      {/* 2. Silver Baffle & Golden Structural Collar Ring */}
      <group ref={collarRef}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.44, 0.48, 0.14, 36]} />
          <meshPhysicalMaterial color="#f8fafc" metalness={1.0} roughness={0.05} clearcoat={1.0} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <torusGeometry args={[0.48, 0.03, 16, 36]} />
          <meshPhysicalMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. Main Crumpled Gold Foil Cylinder Body */}
      <group ref={goldBodyRef}>
        <CrumpledGoldFoilBody />

        {/* Structural Battens with Silver Highlights */}
        {[0, 1.05, 2.1, 3.14, 4.2, 5.24].map((rad, i) => (
          <mesh key={i} position={[Math.cos(rad) * 0.525, 0, Math.sin(rad) * 0.525]} rotation={[0, -rad, 0]}>
            <boxGeometry args={[0.025, 0.88, 0.02]} />
            <meshPhysicalMaterial color="#e2e8f0" metalness={1.0} roughness={0.1} clearcoat={1.0} />
          </mesh>
        ))}

        {/* High-Gloss Radiator Panels */}
        <mesh position={[0.52, 0.05, 0]}>
          <boxGeometry args={[0.025, 0.45, 0.35]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.98} roughness={0.04} clearcoat={1.0} />
        </mesh>
        <mesh position={[-0.52, 0.05, 0]}>
          <boxGeometry args={[0.025, 0.45, 0.35]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.98} roughness={0.04} clearcoat={1.0} />
        </mesh>
      </group>

      {/* 4. Silver Propulsion Service Module */}
      <group ref={baseRef}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.50, 0.44, 0.25, 36]} />
          <meshPhysicalMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} clearcoat={0.8} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.42, 0.32, 0.14, 36]} />
          <meshPhysicalMaterial color="#d97706" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 0.14, 24, 1, true]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. Primary Left Solar Wing */}
      <group ref={leftWingRef}>
        <SingleSolarWing width={2.4} height={0.85} position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
      </group>

      {/* 6. Primary Right Solar Wing */}
      <group ref={rightWingRef}>
        <SingleSolarWing width={2.4} height={0.85} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      </group>

      {/* 7. Parabolic Dish Antenna */}
      <group ref={dishRef} rotation={[0.4, -0.6, 0.2]}>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.34, 0.14, 36, 1, true]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.08} clearcoat={1.0} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 12]} />
          <meshPhysicalMaterial color="#f59e0b" metalness={1.0} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.23]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshPhysicalMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
        </mesh>
      </group>

    </group>
  );
}

// --- Dynamic Studio Scene Lighting ---
function Scene({ scrollProgress, isMobile }) {
  return (
    <>
      <ambientLight intensity={1.1} color="#f8fafc" />
      <directionalLight position={[14, 16, 10]} intensity={5.8} color="#ffffff" />
      <directionalLight position={[-14, -10, -8]} intensity={3.8} color="#38bdf8" />
      <pointLight position={[0, 4, 4]} intensity={3.2} color="#fef08a" distance={18} />
      <pointLight position={[0, -5, 3]} intensity={2.5} color="#0284c7" distance={14} />

      <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.2}>
        <ExplodedSatellite scrollProgress={scrollProgress} isMobile={isMobile} />
      </Float>
    </>
  );
}

// --- Main Responsive Landing Page Component ---
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAssembled = scrollProgress >= 0.18;

  return (
    <div className="relative w-full bg-[#050814] text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden">
      
      {/* Background Volumetric Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-[280px] sm:w-[550px] h-[280px] sm:h-[550px] bg-amber-500/10 rounded-full blur-[80px] sm:blur-[140px]" />
        <div className="absolute top-1/2 -right-24 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-sky-600/10 rounded-full blur-[90px] sm:blur-[160px]" />
        <div className="absolute -bottom-24 left-1/3 w-[260px] sm:w-[500px] h-[260px] sm:h-[500px] bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[140px]" />
      </div>

      {/* Fixed 3D Canvas Layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Canvas 
          camera={{ 
            position: [0, 0, isMobile ? 5.6 : 4.8], 
            fov: isMobile ? 50 : 38 
          }}
        >
          <Scene scrollProgress={scrollProgress} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Top Glass Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl bg-[#050814]/85 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
            <Satellite size={16} className="animate-pulse sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <span className="text-xs sm:text-base font-bold text-white tracking-wider flex items-center gap-1.5 sm:gap-2">
              OrbitEye <span className="text-[9px] sm:text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono font-medium">Remote Sensing</span>
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate("/app")}
          className="bg-slate-900/90 hover:bg-sky-600 border border-slate-700 hover:border-sky-500 text-white text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition duration-300 flex items-center gap-1.5 shadow-lg shadow-black/40 backdrop-blur-md"
        >
          <span>Launch Platform</span>
          <ArrowRight size={12} className="sm:w-[13px] sm:h-[13px]" />
        </button>
      </nav>

      {/* Scrollable Content Layers */}
      <div className="relative z-20 w-full">
        
        {/* Section 1: Hero */}
        <section className="h-screen flex flex-col justify-between items-center text-center px-4 sm:px-6 pt-24 sm:pt-36 pb-8">
          <div className="space-y-2.5 sm:space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md text-amber-400 text-[9px] sm:text-xs font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              EARTH OBSERVATION TELEMETRY
            </div>

            <h1 className="text-xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-snug">
              Autonomous Municipal Risk Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-emerald-400">
                From Multi-Spectral Satellite Passes.
              </span>
            </h1>

            <p className="text-[11px] sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              OrbitEye continuously evaluates Sentinel-2 satellite passes, computing spectral index deltas and automated diagnostics to flag civil hazards.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 text-slate-400 text-[10px] sm:text-[11px] font-mono animate-bounce">
            <span>SCROLL TO CONVERGE INSTRUMENTATION</span>
            <ChevronDown size={14} />
          </div>
        </section>

        {/* Section 2: Platform Calibrated */}
        <section className="min-h-screen flex flex-col justify-end sm:justify-center items-start px-4 sm:px-12 md:px-20 pb-16 sm:pb-0 max-w-4xl">
          <div className={`transition-all duration-700 transform ${isAssembled ? "opacity-100 translate-y-0" : "opacity-20 translate-y-8"} bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-4 sm:p-10 rounded-2xl space-y-3 sm:space-y-5 shadow-2xl shadow-black/80 w-full`}>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-semibold">
              <ShieldCheck size={13} /> Multi-Spectral Sensor Array Operational
            </div>

            <h2 className="text-lg sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Proactive Infrastructure Governance Powered by Remote Sensing.
            </h2>

            <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              By evaluating spatial reflectance shifts across Short-Wave Infrared (SWIR), Near-Infrared (NIR), and Visible Green bands, the platform flags drainage obstructions, reservoir depletion, and illegal land clearings.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 text-[10px] sm:text-xs font-mono">
              <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block text-xs sm:text-sm">ΔNDWI</span>
                <span className="text-slate-400 text-[9px] sm:text-[11px]">Water Receding</span>
              </div>
              <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-xs sm:text-sm">ΔNDBI</span>
                <span className="text-slate-400 text-[9px] sm:text-[11px]">Encroachment</span>
              </div>
              <div className="bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block text-xs sm:text-sm">ΔNDVI</span>
                <span className="text-slate-400 text-[9px] sm:text-[11px]">Canopy Loss</span>
              </div>
            </div>

            <div className="pt-1 sm:pt-2">
              <button 
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
              >
                Access Risk Radar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Architecture Framework */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-12 md:px-20 py-16 sm:py-20 max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-sky-400 tracking-wider">System Architecture</span>
            <h3 className="text-xl sm:text-3xl font-bold text-white">Three-Tiered Inspection Framework</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-6 rounded-2xl space-y-2 sm:space-y-3 shadow-xl">
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit">
                <Layers size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">1. Multi-Temporal Ingestion</h4>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                Automated matrix differencing between historical baselines and current passes with Scene Classification cloud masking.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-6 rounded-2xl space-y-2 sm:space-y-3 shadow-xl">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit">
                <Cpu size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">2. AI Civil Diagnostics</h4>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                Transforms raw spatial indices into root-cause civil assessments, severity scoring, and emergency mitigation directives.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-6 rounded-2xl space-y-2 sm:space-y-3 shadow-xl">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 w-fit">
                <Eye size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">3. Ground-Truth Field CV</h4>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                On-site photographic crack analysis using OpenCV edge detection and high-resolution GIS evidence dossiers.
              </p>
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-4 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="text-xs sm:text-base font-semibold text-white">Ready to initiate territory risk evaluation?</h4>
              <p className="text-[10px] sm:text-xs text-slate-400">Search any geographic coordinate, ward, or municipal zone globally.</p>
            </div>
            <button 
              onClick={() => navigate("/app")}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-900/30"
            >
              Launch Live Workspace <ArrowRight size={13} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}