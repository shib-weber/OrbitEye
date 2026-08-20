import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
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

// --- Folded & Crinkled Aerospace Aluminum Foil Texture ---

function useFoldedAluminumTexture() {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // High-contrast crinkle, crease lines, and micro-faceting
    const imgData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        // Sharp crease wave functions
        const fold1 = Math.abs(Math.sin(x * 0.05 + Math.cos(y * 0.04) * 3.0));
        const fold2 = Math.abs(Math.cos(y * 0.06 - Math.sin(x * 0.03) * 2.5));
        const fold3 = Math.sin((x * 0.707 + y * 0.707) * 0.08);
        const micro = (Math.random() - 0.5) * 0.08;

        const combined = Math.min(Math.max((fold1 * 0.5 + fold2 * 0.35 + fold3 * 0.15 + micro), 0), 1);
        const val = Math.floor(combined * 225 + 30);

        imgData.data[idx] = val;
        imgData.data[idx + 1] = val;
        imgData.data[idx + 2] = val;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);
}

// --- Ultra-Reflective Photovoltaic Solar Texture ---

function useSolarPanelTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Deep deep-space indigo backing
    ctx.fillStyle = "#010817";
    ctx.fillRect(0, 0, 1024, 512);

    const cols = 12;
    const rows = 4;
    const cw = 1024 / cols;
    const ch = 512 / rows;
    const padding = 3;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cw + padding;
        const y = r * ch + padding;
        const w = cw - padding * 2;
        const h = ch - padding * 2;

        const cellGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        cellGrad.addColorStop(0, "#1e3a8a");
        cellGrad.addColorStop(0.5, "#0c4a6e");
        cellGrad.addColorStop(1, "#082f49");

        ctx.fillStyle = cellGrad;
        ctx.fillRect(x, y, w, h);

        // Corner chamfers
        ctx.fillStyle = "#010817";
        const chamfer = 6;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + chamfer, y); ctx.lineTo(x, y + chamfer); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w, y); ctx.lineTo(x + w - chamfer, y); ctx.lineTo(x + w, y + chamfer); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y + h); ctx.lineTo(x + chamfer, y + h); ctx.lineTo(x, y + h - chamfer); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w, y + h); ctx.lineTo(x + w - chamfer, y + h); ctx.lineTo(x + w, y + h - chamfer); ctx.fill();

        // Silver Busbars
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.33, y);
        ctx.lineTo(x + w * 0.33, y + h);
        ctx.moveTo(x + w * 0.66, y);
        ctx.lineTo(x + w * 0.66, y + h);
        ctx.stroke();

        // Micro-grid lines
        ctx.strokeStyle = "rgba(224, 242, 254, 0.4)";
        ctx.lineWidth = 0.6;
        for (let i = 1; i <= 8; i++) {
          const ly = y + (h / 9) * i;
          ctx.beginPath();
          ctx.moveTo(x, ly);
          ctx.lineTo(x + w, ly);
          ctx.stroke();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);
}

// --- Glassy Solar Wing Assembly ---

function PhotorealisticSolarWing({ isRight = false, solarTex }) {
  const dir = isRight ? 1 : -1;

  return (
    <group position={[0, 0, 0]}>
      {/* Titanium Actuator Hub */}
      <mesh position={[dir * 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
        <meshPhysicalMaterial color="#f1f5f9" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Titanium Structural Truss */}
      <mesh position={[dir * 0.65, 0, 0]}>
        <boxGeometry args={[0.9, 0.045, 0.045]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.95} roughness={0.1} clearcoat={1.0} />
      </mesh>

      {/* Photovoltaic Array Wing */}
      <group position={[dir * 2.35, 0, 0]}>
        {/* Specular Coated Silicon Glass Surface */}
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[2.5, 0.88, 0.015]} />
          <meshPhysicalMaterial
            map={solarTex}
            color="#ffffff"
            metalness={0.6}
            roughness={0.02}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            reflectivity={1.0}
            envMapIntensity={3.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer Titanium Rim */}
        <mesh position={[0, 0, -0.005]}>
          <boxGeometry args={[2.54, 0.92, 0.02]} />
          <meshPhysicalMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// --- Spacecraft Exploded-to-Assembled Assembly ---

function PhotorealisticSatellite({ scrollProgress, isMobile }) {
  const groupRef = useRef();

  const aluTex = useFoldedAluminumTexture();
  const solarTex = useSolarPanelTexture();

  const chassisRef = useRef();
  const hoodRef = useRef();
  const collarRef = useRef();
  const dishRef = useRef();
  const helixRef = useRef();
  const thrusterRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const batteryRef = useRef();

  // Burst coordinates
  const explodedPositions = {
    chassis: [0, 0, 0],
    hood: [0, isMobile ? 2.4 : 3.2, 0],
    collar: [0, isMobile ? 1.5 : 2.0, 0],
    dish: [isMobile ? -1.2 : -2.2, 1.8, 1.0],
    helix: [isMobile ? 1.0 : 1.8, 2.0, -0.8],
    thruster: [0, -2.6, 0],
    leftWing: [isMobile ? -2.2 : -4.8, 0, 0],
    rightWing: [isMobile ? 2.2 : 4.8, 0, 0],
    battery: [0, 0, 1.8],
  };

  // Locked assembled coordinates
  const assembledPositions = {
    chassis: [0, 0, 0],
    hood: [0, 0.88, 0],
    collar: [0, 0.60, 0],
    dish: [-0.62, 0.65, 0.38],
    helix: [0.55, 0.65, -0.35],
    thruster: [0, -0.66, 0],
    leftWing: [-0.60, 0, 0],
    rightWing: [0.60, 0, 0],
    battery: [0, 0, 0.58],
  };

  useFrame((state) => {
    const progress = Math.min(Math.max((scrollProgress - 0.08) / 0.20, 0), 1);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.35, Math.PI * 2 + 0.35, scrollProgress) + state.clock.elapsedTime * 0.12;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0.18, -0.06, scrollProgress);
    }

    const lerpMesh = (ref, key) => {
      if (!ref.current) return;
      const start = explodedPositions[key];
      const target = assembledPositions[key];

      ref.current.position.x = THREE.MathUtils.lerp(start[0], target[0], progress);
      ref.current.position.y = THREE.MathUtils.lerp(start[1], target[1], progress);
      ref.current.position.z = THREE.MathUtils.lerp(start[2], target[2], progress);
    };

    lerpMesh(chassisRef, "chassis");
    lerpMesh(hoodRef, "hood");
    lerpMesh(collarRef, "collar");
    lerpMesh(dishRef, "dish");
    lerpMesh(helixRef, "helix");
    lerpMesh(thrusterRef, "thruster");
    lerpMesh(leftWingRef, "leftWing");
    lerpMesh(rightWingRef, "rightWing");
    lerpMesh(batteryRef, "battery");
  });

  const baseScale = isMobile ? 0.50 : 0.90;
  const posY = isMobile ? 0.0 : 0.05;

  return (
    <group ref={groupRef} position={[0, posY, 0]} scale={[baseScale, baseScale, baseScale]}>
      
      {/* 1. Main Octagonal Core with Bright Folded Aluminum Thermal Foil */}
      <group ref={chassisRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.60, 0.60, 1.1, 8]} />
          <meshPhysicalMaterial 
            map={aluTex}
            bumpMap={aluTex}
            bumpScale={0.58}
            roughnessMap={aluTex}
            color="#fbbf24" 
            metalness={0.98} 
            roughness={0.16} 
            clearcoat={1.0} 
            clearcoatRoughness={0.08} 
            reflectivity={1.0}
            envMapIntensity={3.2}
          />
        </mesh>

        {/* Structural Edge Longerons */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const rad = (i * Math.PI) / 4 + Math.PI / 8;
          return (
            <mesh key={i} position={[Math.cos(rad) * 0.63, 0, Math.sin(rad) * 0.63]} rotation={[0, -rad, 0]}>
              <boxGeometry args={[0.025, 1.11, 0.025]} />
              <meshPhysicalMaterial color="#cbd5e1" metalness={1.0} roughness={0.05} />
            </mesh>
          );
        })}

        {/* Optical Sensor Aperture */}
        <group position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.26, 0.12, 32]} />
            <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <circleGeometry args={[0.18, 32]} />
            <meshPhysicalMaterial 
              color="#0ea5e9" 
              emissive="#38bdf8" 
              emissiveIntensity={2.5} 
              roughness={0.01} 
              metalness={0.95} 
              clearcoat={1.0} 
            />
          </mesh>
        </group>
      </group>

      {/* 2. Top Sunshield Hood */}
      <group ref={hoodRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.56, 0.44, 8, 1, true]} />
          <meshPhysicalMaterial 
            map={aluTex}
            bumpMap={aluTex}
            bumpScale={0.04}
            color="#e2e8f0" 
            metalness={0.92} 
            roughness={0.18} 
            clearcoat={0.9} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>

      {/* 3. Collar Ring Interface */}
      <group ref={collarRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.59, 0.61, 0.12, 8]} />
          <meshPhysicalMaterial color="#ffffff" metalness={1.0} roughness={0.04} clearcoat={1.0} />
        </mesh>
      </group>

      {/* 4. High-Gain Communications Dish */}
      <group ref={dishRef} rotation={[0.4, 0.6, -0.2]}>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.48, 0.18, 32, 1, true]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            metalness={0.95} 
            roughness={0.08} 
            clearcoat={1.0} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.26, 16]} />
          <meshPhysicalMaterial color="#fbbf24" metalness={1.0} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.31]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={3.0} />
        </mesh>
      </group>

      {/* 5. Low-Gain Helical Antenna */}
      <group ref={helixRef}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 16]} />
          <meshPhysicalMaterial color="#ffffff" metalness={1.0} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshPhysicalMaterial color="#fcd34d" metalness={1.0} roughness={0.05} />
        </mesh>
      </group>

      {/* 6. External Avionics / Power Module */}
      <group ref={batteryRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.44, 0.12]} />
          <meshPhysicalMaterial 
            map={aluTex} 
            bumpMap={aluTex} 
            bumpScale={0.05} 
            color="#f9f9f1" 
            metalness={0.98} 
            roughness={0.12} 
            clearcoat={1.0}
          />
        </mesh>
      </group>

      {/* 7. Hydrazine Thruster */}
      <group ref={thrusterRef}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.16, 8]} />
          <meshPhysicalMaterial color="#94a3b8" metalness={0.98} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.16, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 0.32, 32, 1, true]} />
          <meshPhysicalMaterial 
            color="#334155" 
            metalness={0.95} 
            roughness={0.1} 
            clearcoat={1.0} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>

      {/* 8. Left Solar Wing */}
      <group ref={leftWingRef}>
        <PhotorealisticSolarWing isRight={false} solarTex={solarTex} />
      </group>

      {/* 9. Right Solar Wing */}
      <group ref={rightWingRef}>
        <PhotorealisticSolarWing isRight={true} solarTex={solarTex} />
      </group>

    </group>
  );
}

// --- High-Intensity Studio & Orbital Lighting Setup ---

function Scene({ scrollProgress, isMobile }) {
  return (
    <>
      <Environment preset="studio" />
      
      {/* High-Key Ambient Visibility Light */}
      <ambientLight intensity={2.8} color="#ffffff" />
      
      {/* Primary Key Sunlight */}
      <directionalLight position={[10, 14, 12]} intensity={9.0} color="#ffffff" />
      
      {/* High-Intensity Fill Light (Opposite Corner) */}
      <directionalLight position={[-10, 8, 8]} intensity={7.0} color="#f0f9ff" />
      
      {/* Frontal Camera Fill Light to prevent dark silhouettes */}
      <directionalLight position={[0, 0, 12]} intensity={5.0} color="#ffffff" />
      
      {/* Planetary Albedo Rim Light (Vibrant Blue/Cyan) */}
      <directionalLight position={[0, -12, -8]} intensity={6.0} color="#38bdf8" />
      
      {/* Point Highlights */}
      <pointLight position={[2, 4, 4]} intensity={4.0} color="#ffffff" distance={12} />
      <pointLight position={[-2, -3, 4]} intensity={3.5} color="#e0f2fe" distance={12} />

      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.15}>
        <PhotorealisticSatellite scrollProgress={scrollProgress} isMobile={isMobile} />
      </Float>
    </>
  );
}

// --- Main Landing Page Component ---

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

  const heroOpacity = Math.max(1 - (scrollProgress / 0.10), 0);
  const heroTranslate = scrollProgress * -160;
  const isAssembled = scrollProgress >= 0.22;

  return (
    <div className="relative w-full bg-[#040711] text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden">
      
      {/* Background Volumetric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-[280px] sm:w-[550px] h-[280px] sm:h-[550px] bg-sky-500/15 rounded-full blur-[80px] sm:blur-[140px]" />
        <div className="absolute top-1/2 -right-24 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-600/15 rounded-full blur-[90px] sm:blur-[160px]" />
        <div className="absolute -bottom-24 left-1/3 w-[260px] sm:w-[500px] h-[260px] sm:h-[500px] bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[140px]" />
      </div>

      {/* Fixed 3D Canvas Layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Canvas 
          camera={{ 
            position: [0, 0, isMobile ? 6.2 : 5.0], 
            fov: isMobile ? 52 : 38 
          }}
          gl={{ antialias: true, alpha: true, toneMappingExposure: 1.6 }}
        >
          <Scene scrollProgress={scrollProgress} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* Glass Navigation Header */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl bg-[#040711]/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-sky-500/10 rounded-lg border border-sky-500/30 text-sky-400">
            <Satellite size={16} className="animate-pulse sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <span className="text-xs sm:text-base font-bold text-white tracking-wider flex items-center gap-1.5 sm:gap-2">
              OrbitEye <span className="text-[9px] sm:text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30 font-mono font-medium">Earth Observation</span>
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

      {/* Scrollable Content Container */}
      <div className="relative z-20 w-full">
        
        {/* Section 1: Hero */}
        <section className="min-h-[100dvh] w-full flex flex-col justify-between items-center text-center px-4 sm:px-8 pt-20 pb-8 relative">
          <div className="w-full" />
          
          <div 
            style={{ 
              opacity: heroOpacity, 
              transform: `translateY(${heroTranslate}px)`,
              pointerEvents: heroOpacity > 0.1 ? 'auto' : 'none'
            }}
            className="transition-opacity bg-transparent duration-300 w-full max-w-2xl sm:max-w-3xl flex flex-col items-center justify-center space-y-4 sm:space-y-6   p-6 sm:p-0 rounded-3xl border border-slate-800/60 sm:border-none shadow-2xl sm:shadow-none"
          >

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
              Autonomous Municipal Risk Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300">
                From Multi-Spectral Satellite Passes.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              OrbitEye continuously evaluates Sentinel-2 Earth Observation passes, applying spectral index differencing and automated diagnostics to flag civil hazards.
            </p>
          </div>

          <div 
            style={{ opacity: heroOpacity }}
            className="flex flex-col items-center gap-2 text-slate-400 text-[11px] font-mono animate-bounce"
          >
            <span>SCROLL TO CONVERGE HARDWARE</span>
            <ChevronDown size={16} />
          </div>
        </section>

        {/* Section 2: Assembly Viewport */}
        <section className="h-[90dvh] flex items-center justify-center pointer-events-none" />

        {/* Section 3: Radar Card */}
        <section className="min-h-[100dvh] flex flex-col justify-center items-start px-4 sm:px-12 md:px-20 py-16 max-w-4xl">
          <div className={`transition-all duration-700 transform ${isAssembled ? "opacity-100 translate-y-0" : "opacity-10 translate-y-12"} bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-5 sm:p-10 rounded-3xl space-y-4 sm:space-y-6 shadow-2xl shadow-black/80 w-full`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={14} /> Multi-Spectral Sensor Array Operational
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Proactive Infrastructure Governance Powered by Remote Sensing.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              By evaluating spatial reflectance shifts across Short-Wave Infrared (SWIR), Near-Infrared (NIR), and Visible Green bands, the platform flags drainage obstructions, reservoir depletion, and illegal land clearings.
            </p>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-sky-400 font-bold block text-sm sm:text-base">ΔNDWI</span>
                <span className="text-slate-400 text-[10px] sm:text-xs">Water Receding</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm sm:text-base">ΔNDBI</span>
                <span className="text-slate-400 text-[10px] sm:text-xs">Encroachment</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-emerald-400 font-bold block text-sm sm:text-base">ΔNDVI</span>
                <span className="text-slate-400 text-[10px] sm:text-xs">Canopy Loss</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => navigate("/app")}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
              >
                Access Risk Radar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: System Architecture */}
        <section className="min-h-[100dvh] flex flex-col justify-center px-4 sm:px-12 md:px-20 py-20 max-w-6xl mx-auto space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono uppercase text-sky-400 tracking-wider">System Architecture</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Three-Tiered Inspection Framework</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit">
                <Layers size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">1. Multi-Temporal Ingestion</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated matrix differencing between historical baselines and current passes with Scene Classification cloud masking.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit">
                <Cpu size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">2. AI Civil Diagnostics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transforms raw spatial indices into root-cause civil assessments, severity scoring, and emergency mitigation directives.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 w-fit">
                <Eye size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">3. Ground-Truth Field CV</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                On-site photographic crack analysis using OpenCV edge detection and high-resolution GIS evidence dossiers.
              </p>
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-semibold text-white">Ready to initiate territory risk evaluation?</h4>
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