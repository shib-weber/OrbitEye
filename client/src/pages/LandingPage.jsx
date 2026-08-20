import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { 
  Radio, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Eye, 
  ShieldCheck, 
  ChevronDown,
  Activity,
  FileCheck2,
  Globe,
  Database,
  Satellite
} from "lucide-react";

// --- Realistic Photovoltaic Array with High Specular Gloss ---
function PhotovoltaicPanel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Structural Carbon-Composite Substrate Frame */}
      <mesh>
        <boxGeometry args={[2.5, 0.96, 0.03]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Front Glossy Blue Photovoltaic Silicon Layer */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.42, 0.9, 0.01]} />
        <meshPhysicalMaterial 
          color="#0284c7"
          emissive="#034694"
          emissiveIntensity={0.25}
          metalness={0.96}
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back Glossy Blue Silicon Layer */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.42, 0.9, 0.01]} />
        <meshPhysicalMaterial 
          color="#0284c7"
          emissive="#034694"
          emissiveIntensity={0.25}
          metalness={0.96}
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Silver Grid Micro-Busbars */}
      {[-0.8, -0.27, 0.27, 0.8].map((xOffset, i) => (
        <React.Fragment key={i}>
          <mesh position={[xOffset, 0, 0.026]}>
            <boxGeometry args={[0.012, 0.88, 0.004]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[xOffset, 0, -0.026]}>
            <boxGeometry args={[0.012, 0.88, 0.004]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Deployable Yoke & Rotating Joint */}
      <mesh position={[1.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  );
}

// --- 3D Exploded-to-Assembled Sentinel Spacecraft ---
function ExplodedSatellite({ scrollProgress, isMobile }) {
  const groupRef = useRef();

  const chassisRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const opticRef = useRef();
  const capRef = useRef();
  const dishRef = useRef();

  // Burst exploded starting coordinates [x, y, z]
  const explodedPositions = {
    chassis: [0, 1.8, -1.2],
    leftWing: [isMobile ? -3.5 : -5.4, 3.2, 1.8],
    rightWing: [isMobile ? 3.5 : 5.4, -2.6, -1.8],
    optic: [0, -4.2, 2.5],
    cap: [0, 4.2, 1.0],
    dish: [isMobile ? 2.2 : 3.4, 2.8, 3.5],
  };

  // Fully locked assembled coordinates [x, y, z]
  const assembledPositions = {
    chassis: [0, 0, 0],
    leftWing: [-1.95, 0, 0],
    rightWing: [1.95, 0, 0],
    optic: [0, -0.85, 0],
    cap: [0, 0.85, 0],
    dish: [0, 0.15, 0.62],
  };

  useFrame((state, delta) => {
    const progress = Math.min(Math.max(scrollProgress / 0.3, 0), 1);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.4, Math.PI * 2 + 0.5, scrollProgress) + state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0.25, -0.15, scrollProgress);
    }

    const lerpMesh = (ref, key) => {
      if (!ref.current) return;
      const start = explodedPositions[key];
      const target = assembledPositions[key];

      ref.current.position.x = THREE.MathUtils.lerp(start[0], target[0], progress);
      ref.current.position.y = THREE.MathUtils.lerp(start[1], target[1], progress);
      ref.current.position.z = THREE.MathUtils.lerp(start[2], target[2], progress);

      ref.current.rotation.x = THREE.MathUtils.lerp(start[1] * 0.5, 0, progress);
      ref.current.rotation.z = THREE.MathUtils.lerp(start[0] * 0.3, 0, progress);
    };

    lerpMesh(chassisRef, "chassis");
    lerpMesh(leftWingRef, "leftWing");
    lerpMesh(rightWingRef, "rightWing");
    lerpMesh(opticRef, "optic");
    lerpMesh(capRef, "cap");
    lerpMesh(dishRef, "dish");
  });

  const baseScale = isMobile ? 0.72 : 1.0;

  return (
    <group ref={groupRef} position={[0, isMobile ? 0.4 : 0.1, 0]} scale={[baseScale, baseScale, baseScale]}>
      
      {/* 1. Main Avionics Bus & Kapton Gold MLI Thermal Insulation */}
      <group ref={chassisRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.05, 1.45, 0.95]} />
          <meshPhysicalMaterial 
            color="#334155" 
            metalness={0.85} 
            roughness={0.25} 
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* Gold MLI Thermal Blankets */}
        <mesh position={[0, 0, 0.48]}>
          <boxGeometry args={[0.9, 1.3, 0.02]} />
          <meshPhysicalMaterial 
            color="#d97706" 
            emissive="#78350f"
            emissiveIntensity={0.25}
            metalness={0.92} 
            roughness={0.3} 
            clearcoat={0.8}
          />
        </mesh>
        <mesh position={[0, 0, -0.48]}>
          <boxGeometry args={[0.9, 1.3, 0.02]} />
          <meshPhysicalMaterial 
            color="#d97706" 
            metalness={0.92} 
            roughness={0.3} 
          />
        </mesh>

        {/* Lateral Radiators */}
        <mesh position={[0.53, 0, 0]}>
          <boxGeometry args={[0.02, 1.2, 0.7]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.53, 0, 0]}>
          <boxGeometry args={[0.02, 1.2, 0.7]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Earth Observation Optical Payload (Multispectral Imager) */}
      <group ref={opticRef}>
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.28, 0.35, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 32]} />
          <meshPhysicalMaterial 
            color="#0284c7" 
            emissive="#38bdf8" 
            emissiveIntensity={1.8} 
            transmission={0.4} 
            roughness={0.05}
            reflectivity={1.0}
          />
        </mesh>
        <mesh position={[0, -0.34, 0]}>
          <ringGeometry args={[0.22, 0.32, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. Gold Thermal Cap & Star Trackers */}
      <group ref={capRef}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.42, 0.54, 0.32, 24]} />
          <meshPhysicalMaterial 
            color="#f59e0b" 
            emissive="#92400e"
            emissiveIntensity={0.25}
            metalness={0.95} 
            roughness={0.25} 
          />
        </mesh>
        <mesh position={[0.22, 0.3, 0.15]} rotation={[0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.18, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[-0.22, 0.3, -0.15]} rotation={[-0.4, -0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.18, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* 4. Left Shiny Photovoltaic Array */}
      <group ref={leftWingRef}>
        <PhotovoltaicPanel position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
      </group>

      {/* 5. Right Shiny Photovoltaic Array */}
      <group ref={rightWingRef}>
        <PhotovoltaicPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
      </group>

      {/* 6. Communications Radar Dish */}
      <group ref={dishRef} rotation={[Math.PI / 3.2, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.48, 0.22, 36, 1, true]} />
          <meshPhysicalMaterial 
            color="#f8fafc" 
            metalness={0.7} 
            roughness={0.2} 
            clearcoat={0.8}
            side={THREE.DoubleSide} 
          />
        </mesh>
        <mesh position={[0, -0.05, 0.18]}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.05, 0.3]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </group>

    </group>
  );
}

// --- Studio Scene Lighting ---
function Scene({ scrollProgress, isMobile }) {
  return (
    <>
      <ambientLight intensity={0.95} color="#cbd5e1" />
      <directionalLight position={[8, 10, 6]} intensity={3.0} color="#ffffff" />
      <directionalLight position={[-8, -6, -4]} intensity={2.4} color="#0284c7" />
      <pointLight position={[0, 3, 3]} intensity={2.0} color="#38bdf8" distance={14} />
      <pointLight position={[0, -4, 2]} intensity={1.5} color="#0ea5e9" distance={10} />

      <Float speed={1.6} rotationIntensity={0.16} floatIntensity={0.3}>
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

  const isAssembled = scrollProgress >= 0.22;

  return (
    <div className="relative w-full bg-[#050814] text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden">
      
      {/* Volumetric Radial Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-sky-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-700/10 rounded-full blur-[120px] sm:blur-[160px]" />
        <div className="absolute -bottom-32 left-1/3 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
      </div>

      {/* Fixed 3D Canvas Canvas Layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 0, isMobile ? 6.2 : 5.2], fov: isMobile ? 48 : 42 }}>
          <Scene scrollProgress={scrollProgress} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Top Glass Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl bg-[#050814]/80 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400">
            <Satellite size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
              OrbitEye <span className="text-[10px] bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded border border-sky-500/30 font-mono font-medium">Remote Sensing AI</span>
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate("/app")}
          className="bg-slate-900/90 hover:bg-sky-600 border border-slate-700 hover:border-sky-500 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl transition duration-300 flex items-center gap-1.5 shadow-lg shadow-black/40 backdrop-blur-md"
        >
          <span>Launch Platform</span>
          <ArrowRight size={13} />
        </button>
      </nav>

      {/* Scrollable Content Layers */}
      <div className="relative z-20 w-full">
        
        {/* Section 1: Formal Opening Hero */}
        <section className="h-screen flex flex-col justify-between items-center text-center px-4 sm:px-6 pt-28 sm:pt-36 pb-10">
          <div className="space-y-3 sm:space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md text-sky-400 text-[10px] sm:text-xs font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              EARTH OBSERVATION & SATELLITE TELEMETRY SUBSYSTEM
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Autonomous Municipal Risk Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                From Multi-Spectral Satellite Assets.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              OrbitEye continuously evaluates multi-temporal Sentinel-2 Earth Observation passes, applying spectral index differencing and automated diagnostic reasoning to identify civil and environmental hazards.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-slate-400 text-[11px] font-mono animate-bounce">
            <span>SCROLL TO INITIALIZE INSTRUMENTATION</span>
            <ChevronDown size={15} />
          </div>
        </section>

        {/* Section 2: Platform Locked & Operational Details */}
        <section className="min-h-screen flex flex-col justify-center items-start px-4 sm:px-12 md:px-20 max-w-4xl">
          <div className={`transition-all duration-700 transform ${isAssembled ? "opacity-100 translate-y-0" : "opacity-25 translate-y-8"} bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-10 rounded-2xl space-y-4 sm:space-y-5 shadow-2xl shadow-black/70`}>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={14} /> Multi-Spectral Sensor Array Operational
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Proactive Infrastructure Governance Powered by Remote Sensing.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              By evaluating spatial reflectance shifts across Short-Wave Infrared (SWIR), Near-Infrared (NIR), and Visible Green bands, the platform flags drainage obstructions, reservoir depletion, and illegal land clearings with sub-pixel precision.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block text-sm">ΔNDWI</span>
                <span className="text-slate-400 text-[11px]">Canal Water Depletion</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">ΔNDBI</span>
                <span className="text-slate-400 text-[11px]">Drainage Encroachment</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-emerald-400 font-bold block text-sm">ΔNDVI</span>
                <span className="text-slate-400 text-[11px]">Canopy & Forest Loss</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => navigate("/app")}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-sky-900/30"
              >
                Access Risk Radar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Architecture & System Capabilities */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-12 md:px-20 py-20 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono uppercase text-sky-400 tracking-wider">System Architecture</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Three-Tiered Inspection Framework</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit">
                <Layers size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">1. Multi-Temporal Ingestion</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Executes automated matrix differencing between historical baselines and current passes, filtering optical obstructions via Scene Classification cloud masks.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit">
                <Cpu size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">2. AI Civil Diagnostics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transforms raw spatial indices into root-cause civil assessments, severity scoring, and automated emergency mitigation directives.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 w-fit">
                <Eye size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">3. Ground-Truth Field CV</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Integrates on-site photographic crack analysis using OpenCV edge detection and exports high-resolution GIS evidence dossiers.
              </p>
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 p-5 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-semibold text-white">Ready to initiate territory risk evaluation?</h4>
              <p className="text-xs text-slate-400">Search any geographic coordinate, ward, or municipal zone globally.</p>
            </div>
            <button 
              onClick={() => navigate("/app")}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-900/30"
            >
              Launch Live Workspace <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}