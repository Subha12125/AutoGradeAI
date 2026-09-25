import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * AntigravityArena - 3D WebGL Multi-Player Physics & Vertical Elevation Arena
 * Built with Three.js, topic-adaptive dynamic procedural worlds, and optional WebXR.
 */
export const AntigravityArena = ({
  topic = 'General',
  participants = [],
  currentParticipantId = null,
  activeQuestion = null,
  isPaused = false,
  className = '',
}) => {
  const mountRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [xrAvailable, setXrAvailable] = useState(false);
  const [isXrActive, setIsXrActive] = useState(false);

  // References to keep animation loop & Three objects
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const platformsRef = useRef(new Map()); // participantId -> Group
  const particlesRef = useRef(null);
  const animFrameId = useRef(null);

  // Check WebXR support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr
        .isSessionSupported?.('immersive-vr')
        .then((supported) => setXrAvailable(supported))
        .catch(() => setXrAvailable(false));
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 38);
    camera.lookAt(0, 10, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x7c3aed, 1.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x2563eb, 2, 80);
    pointLight.position.set(-15, 20, -10);
    scene.add(pointLight);

    // 4. Topic-Themed Environment
    const lowerTopic = (topic || '').toLowerCase();
    let envColor = 0x090d16;
    let particleCount = 700;
    let particleColor = 0x38bdf8;

    if (lowerTopic.includes('physic') || lowerTopic.includes('space') || lowerTopic.includes('astron')) {
      // Space Station / Nebula
      envColor = 0x030712;
      particleColor = 0xa855f7;
    } else if (lowerTopic.includes('code') || lowerTopic.includes('computer') || lowerTopic.includes('tech') || lowerTopic.includes('data')) {
      // Cyber Data Arena
      envColor = 0x02131d;
      particleColor = 0x06b6d4;
    } else if (lowerTopic.includes('bio') || lowerTopic.includes('chem') || lowerTopic.includes('med')) {
      // Molecular Bio World
      envColor = 0x061e14;
      particleColor = 0x10b981;
    } else if (lowerTopic.includes('math') || lowerTopic.includes('stat') || lowerTopic.includes('calc')) {
      // Geometric Dimension
      envColor = 0x110e24;
      particleColor = 0xf59e0b;
    }

    scene.fog = new THREE.FogExp2(envColor, 0.012);

    // Ambient floating particle field
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 120;
      pPositions[i + 1] = Math.random() * 60 - 5;
      pPositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMaterial = new THREE.PointsMaterial({
      size: 1.2,
      color: particleColor,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Glowing coordinate base grid
    const gridHelper = new THREE.GridHelper(80, 40, particleColor, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle camera orbit
      camera.position.x = Math.sin(time * 0.12) * 35;
      camera.position.z = Math.cos(time * 0.12) * 35;
      camera.lookAt(0, 10, 0);

      // Rotate particles slowly
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.03;
      }

      // Smooth platform floating and altitude transitions
      platformsRef.current.forEach((group, pId) => {
        // Platform hover bobbing
        const hoverOffset = Math.sin(time * 2 + (group.userData.phase || 0)) * 0.35;
        // Smooth lerp towards target altitude
        group.position.y += (group.userData.targetY + hoverOffset - group.position.y) * (delta * 3.5);

        // Rotate streak halo if present
        const halo = group.getObjectByName('streakHalo');
        if (halo) {
          halo.rotation.z += delta * 2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      pGeometry.dispose();
      pMaterial.dispose();
      if (container) container.innerHTML = '';
    };
  }, [topic]);

  // Update floating platforms whenever participants or their scores update
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMap = platformsRef.current;
    const participantIds = new Set(participants.map((p) => p.id));

    // Remove platforms of players who left
    for (const [id, group] of currentMap.entries()) {
      if (!participantIds.has(id)) {
        scene.remove(group);
        currentMap.delete(id);
      }
    }

    // Radius for arranging platforms in a circle or stadium
    const totalCount = Math.max(participants.length, 1);
    const radius = Math.min(18, Math.max(8, totalCount * 2.2));

    participants.forEach((p, idx) => {
      const angle = (idx / totalCount) * Math.PI * 2;
      const targetX = Math.cos(angle) * radius;
      const targetZ = Math.sin(angle) * radius;

      // Vertical altitude represents score & rank! (Antigravity mechanics)
      // Base height 0, rises up to 25 units based on score
      const altitude = Math.min(28, (p.current_score || p.score || 0) / 35);
      const isCurrentPlayer = p.id === currentParticipantId;

      if (!currentMap.has(p.id)) {
        // Create new platform
        const group = new THREE.Group();
        group.position.set(targetX, 0, targetZ);
        group.userData = {
          targetY: altitude,
          phase: idx * 0.7,
        };

        // Hexagonal floating platform base
        const platformGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.6, 6);
        const platformMat = new THREE.MeshStandardMaterial({
          color: isCurrentPlayer ? 0x2563eb : 0x475569,
          metalness: 0.8,
          roughness: 0.2,
          emissive: isCurrentPlayer ? 0x1d4ed8 : 0x1e293b,
          emissiveIntensity: 0.4,
        });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        group.add(platform);

        // Glowing perimeter ring
        const ringGeo = new THREE.TorusGeometry(2.6, 0.08, 8, 6);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isCurrentPlayer ? 0x60a5fa : 0xa855f7,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.32;
        group.add(ring);

        // Avatar pedestal / energy core
        const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
        const coreMat = new THREE.MeshStandardMaterial({
          color: isCurrentPlayer ? 0x38bdf8 : 0xf43f5e,
          wireframe: false,
          metalness: 0.9,
          roughness: 0.1,
          emissive: isCurrentPlayer ? 0x0284c7 : 0xe11d48,
          emissiveIntensity: 0.8,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.4;
        group.add(core);

        // Text sprite canvas for player nickname and score
        const sprite = createPlayerSprite(p.nickname, p.current_score || p.score || 0, isCurrentPlayer);
        sprite.name = 'playerTag';
        sprite.position.y = 3.6;
        group.add(sprite);

        // Streak halo (if streak >= 2)
        if ((p.streak || 0) >= 2) {
          const haloGeo = new THREE.RingGeometry(2.8, 3.2, 32);
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.name = 'streakHalo';
          halo.rotation.x = Math.PI / 2;
          halo.position.y = 0.35;
          group.add(halo);
        }

        scene.add(group);
        currentMap.set(p.id, group);
      } else {
        // Update existing platform altitude
        const group = currentMap.get(p.id);
        group.userData.targetY = altitude;

        // Update player tag sprite
        const oldSprite = group.getObjectByName('playerTag');
        if (oldSprite) {
          group.remove(oldSprite);
          const newSprite = createPlayerSprite(p.nickname, p.current_score || p.score || 0, isCurrentPlayer);
          newSprite.name = 'playerTag';
          newSprite.position.y = 3.6;
          group.add(newSprite);
        }

        // Update streak halo
        const existingHalo = group.getObjectByName('streakHalo');
        if ((p.streak || 0) >= 2 && !existingHalo) {
          const haloGeo = new THREE.RingGeometry(2.8, 3.2, 32);
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.name = 'streakHalo';
          halo.rotation.x = Math.PI / 2;
          halo.position.y = 0.35;
          group.add(halo);
        } else if ((p.streak || 0) < 2 && existingHalo) {
          group.remove(existingHalo);
        }
      }
    });
  }, [participants, currentParticipantId]);

  // Helper: create crisp 2D text canvas rendered as 3D Sprite
  function createPlayerSprite(name, score, isCurrent) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Rounded background pill
    ctx.fillStyle = isCurrent ? 'rgba(37, 99, 235, 0.88)' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isCurrent ? '#60a5fa' : '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 108, 16);
    ctx.fill();
    ctx.stroke();

    // Nickname
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((name || 'Player').substring(0, 14), 128, 52);

    // Score & XP
    ctx.fillStyle = isCurrent ? '#fef08a' : '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${score} pts`, 128, 88);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4.5, 2.25, 1);
    return sprite;
  }

  // Handle optional WebXR toggle
  const toggleWebXR = async () => {
    if (!rendererRef.current || !navigator.xr) return;
    try {
      if (!isXrActive) {
        const session = await navigator.xr.requestSession('immersive-vr');
        rendererRef.current.xr.enabled = true;
        await rendererRef.current.xr.setSession(session);
        setIsXrActive(true);
        session.addEventListener('end', () => setIsXrActive(false));
      } else {
        // Exit XR
        setIsXrActive(false);
      }
    } catch (err) {
      console.warn('WebXR error:', err);
    }
  };

  if (!webglSupported) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <i className="ri-error-warning-line text-3xl text-warning mb-2" />
        <p className="font-bold text-white">WebGL 3D Acceleration Not Available</p>
        <p className="text-xs mt-1">Falling back gracefully to standard high-speed 2D arena.</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-80 sm:h-96 md:h-[440px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay: Antigravity HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-white tracking-wider uppercase font-headline">
            Antigravity Arena <span className="text-cyan-400">3D</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">({topic})</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {xrAvailable && (
            <button
              onClick={toggleWebXR}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                isXrActive ? 'bg-error text-white' : 'bg-primary text-white hover:bg-primary-container'
              }`}
            >
              <i className="ri-glasses-line" />
              <span>{isXrActive ? 'Exit VR' : 'WebXR VR'}</span>
            </button>
          )}

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-700">
            <i className="ri-user-voice-line text-primary mr-1" />
            <span>{participants.length} Floating</span>
          </div>
        </div>
      </div>

      {/* Bottom Altitude Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-1 text-emerald-400">
          <i className="ri-arrow-up-line" />
          <span>Correct = Rise</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <i className="ri-sparkler-line" />
          <span>Streaks = Aura</span>
        </div>
        <div className="flex items-center gap-1 text-sky-400">
          <i className="ri-medal-line" />
          <span>Altitude = Score</span>
        </div>
      </div>
    </div>
  );
};

export default AntigravityArena;
