import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Chapter } from '../../types/course';
import { SoundEffects } from '../../services/audio';

interface OceanCanvasProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapter: Chapter | null) => void;
  motionIntensity: 'off' | 'calm' | 'full';
  completedLessonIds: string[];
}

export const OceanCanvas: React.FC<OceanCanvasProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  motionIntensity,
  completedLessonIds
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);
  const [sonarRings, setSonarRings] = useState<{ x: number; y: number; id: number }[]>([]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reefObjectsRef = useRef<{ [key: string]: THREE.Group }>({});
  const targetCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 65));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -8, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -8, 0));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-1000, -1000));
  const animFrameIdRef = useRef<number | null>(null);

  // Plankton particle system ref
  const planktonPointsRef = useRef<THREE.Points | null>(null);
  const jellyfishGroupRef = useRef<THREE.Group | null>(null);
  const currentsGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x03060b);
    scene.fog = new THREE.FogExp2(0x040914, 0.012);

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 70);
    cameraRef.current = camera;

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0x0a2238, 1.4);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x3ff2e6, 4, 80);
    coreLight.position.set(0, 10, 0);
    scene.add(coreLight);

    const deepLight = new THREE.DirectionalLight(0x5cc8ff, 0.8);
    deepLight.position.set(0, 50, 20);
    scene.add(deepLight);

    // 5. LUMEN CORE (Giant glowing coral formation at center)
    const lumenGroup = new THREE.Group();
    // Central crystal spire
    const crystalGeo = new THREE.OctahedronGeometry(5, 2);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x3ff2e6,
      emissive: 0x1f7a75,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.scale.set(1, 2.4, 1);
    crystalMesh.position.y = 8;
    lumenGroup.add(crystalMesh);

    // Surrounding crystal shards
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const shardGeo = new THREE.ConeGeometry(1.2, 7, 5);
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0x5cc8ff,
        emissive: 0x1a4563,
        roughness: 0.3,
        transparent: true,
        opacity: 0.75
      });
      const shardMesh = new THREE.Mesh(shardGeo, shardMat);
      shardMesh.position.set(Math.cos(angle) * 8, 4, Math.sin(angle) * 8);
      shardMesh.rotation.z = Math.sin(angle) * 0.35;
      shardMesh.rotation.x = Math.cos(angle) * 0.35;
      lumenGroup.add(shardMesh);
    }
    scene.add(lumenGroup);

    // 6. PLANKTON PARTICLES (Interactive drifting particulate)
    const particleCount = motionIntensity === 'off' ? 400 : motionIntensity === 'calm' ? 1200 : 2500;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x3ff2e6);
    const colorAqua = new THREE.Color(0x5cc8ff);
    const colorViolet = new THREE.Color(0x9b7bff);
    const colorGreen = new THREE.Color(0x7cffb2);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 160;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 120 - 10;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 160;

      const pick = Math.random();
      const col = pick < 0.4 ? colorCyan : pick < 0.7 ? colorAqua : pick < 0.9 ? colorViolet : colorGreen;
      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom glowing particle canvas texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(63, 242, 230, 0.8)');
      gradient.addColorStop(0.7, 'rgba(63, 242, 230, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = gradient;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 1.4,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const planktonPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(planktonPoints);
    planktonPointsRef.current = planktonPoints;

    // 7. JELLYFISH SILHOUETTES (Background living sea life)
    const jellyfishGroup = new THREE.Group();
    for (let j = 0; j < 5; j++) {
      const jMesh = createJellyfishMesh(j);
      jMesh.position.set(
        (j - 2) * 35 + (Math.random() - 0.5) * 15,
        15 + (Math.random() - 0.5) * 20,
        -40 - j * 12
      );
      jellyfishGroup.add(jMesh);
    }
    scene.add(jellyfishGroup);
    jellyfishGroupRef.current = jellyfishGroup;

    // 8. OCEAN FLOOR & TRENCH CRAGS
    const floorGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorPos = floorGeo.attributes.position;
    for (let i = 0; i < floorPos.count; i++) {
      const vx = floorPos.getX(i);
      const vz = floorPos.getZ(i);
      const dist = Math.sqrt(vx * vx + vz * vz);
      // Depress center into a deep trench canyon
      const depthOffset = -35 - Math.sin(vx * 0.05) * 5 - Math.cos(vz * 0.05) * 5;
      floorPos.setY(i, depthOffset);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050f1d,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floorMesh);

    // 9. REEF CITIES (Chapters)
    const reefObjects: { [key: string]: THREE.Group } = {};
    const reefCoordinates = [
      { x: -28, y: 12, z: 10, zone: 'twilight' },   // Chapter 1: Twilight Reef (Shallow)
      { x: 26, y: -2, z: 5, zone: 'midnight' },     // Chapter 2: Midnight Ridge
      { x: -18, y: -16, z: -15, zone: 'abyssal' },  // Chapter 3: Abyssal Spires
      { x: 18, y: -28, z: -25, zone: 'hadal' }      // Chapter 4: Hadal Trench
    ];

    chapters.forEach((chap, idx) => {
      const coord = reefCoordinates[idx] || { x: 0, y: -idx * 8, z: 0 };
      const reefGroup = createReefCityMesh(chap, coord, completedLessonIds);
      scene.add(reefGroup);
      reefObjects[chap.id] = reefGroup;
    });
    reefObjectsRef.current = reefObjects;

    // 10. LIGHT CURRENT RIBBONS (Connecting chapters in sequence)
    const currentsGroup = new THREE.Group();
    for (let c = 0; c < chapters.length - 1; c++) {
      const startCoord = reefCoordinates[c];
      const endCoord = reefCoordinates[c + 1];
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startCoord.x, startCoord.y, startCoord.z),
        new THREE.Vector3((startCoord.x + endCoord.x) * 0.5 + 4, (startCoord.y + endCoord.y) * 0.5 + 3, (startCoord.z + endCoord.z) * 0.5 + 5),
        new THREE.Vector3(endCoord.x, endCoord.y, endCoord.z)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.35, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(chapters[c].accentColor),
        transparent: true,
        opacity: 0.45,
        wireframe: true
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      currentsGroup.add(tubeMesh);
    }
    scene.add(currentsGroup);
    currentsGroupRef.current = currentsGroup;

    // 11. ANIMATION & RENDER LOOP
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const motionMult = motionIntensity === 'off' ? 0.001 : motionIntensity === 'calm' ? 0.4 : 1.0;

      // Rotate Lumen Core
      lumenGroup.rotation.y = elapsedTime * 0.12 * motionMult;

      // Animate Plankton
      if (planktonPointsRef.current) {
        const positions = planktonPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < positions.count; i++) {
          let y = positions.getY(i);
          y += 0.08 * motionMult;
          if (y > 60) y = -60;
          positions.setY(i, y);

          // Subtle cursor repulsion
          if (mouseRef.current.x > -900) {
            const px = positions.getX(i);
            const pz = positions.getZ(i);
            const dx = px - mouseRef.current.x * 40;
            const dz = pz - mouseRef.current.y * 30;
            const distSq = dx * dx + dz * dz;
            if (distSq < 150) {
              positions.setX(i, px + (dx / (Math.sqrt(distSq) + 0.1)) * 0.5 * motionMult);
              positions.setZ(i, pz + (dz / (Math.sqrt(distSq) + 0.1)) * 0.5 * motionMult);
            }
          }
        }
        positions.needsUpdate = true;
      }

      // Animate Jellyfish
      if (jellyfishGroupRef.current) {
        jellyfishGroupRef.current.children.forEach((jMesh, idx) => {
          jMesh.position.y += Math.sin(elapsedTime * 0.8 + idx) * 0.03 * motionMult;
          jMesh.rotation.y += 0.003 * motionMult;
          const bell = jMesh.getObjectByName('bell');
          if (bell) {
            const scaleY = 1 + Math.sin(elapsedTime * 1.5 + idx) * 0.18 * motionMult;
            bell.scale.set(1, scaleY, 1);
          }
        });
      }

      // Animate Reefs (breathing pulse and subtopic pods)
      Object.keys(reefObjectsRef.current).forEach((id, rIdx) => {
        const group = reefObjectsRef.current[id];
        const spire = group.getObjectByName('spire');
        if (spire) {
          spire.rotation.y = elapsedTime * 0.2 * motionMult;
        }
        const pods = group.getObjectByName('pods');
        if (pods) {
          pods.rotation.y = -elapsedTime * 0.3 * motionMult;
        }
      });

      // Smooth Camera Buoyant Easing to Target
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPosRef.current, 0.04);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.04);
        cameraRef.current.lookAt(currentLookAtRef.current);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 12. WINDOW RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [chapters, motionIntensity, completedLessonIds]);

  // Handle Chapter Camera Glide
  useEffect(() => {
    if (!selectedChapterId) {
      // Overview bridge position
      targetCameraPosRef.current.set(0, 16, 68);
      targetLookAtRef.current.set(0, -6, 0);
    } else {
      const selectedGroup = reefObjectsRef.current[selectedChapterId];
      if (selectedGroup) {
        const pos = selectedGroup.position;
        // Glide camera smoothly toward the selected reef with offset
        targetCameraPosRef.current.set(pos.x + 10, pos.y + 6, pos.z + 18);
        targetLookAtRef.current.set(pos.x, pos.y, pos.z);
      }
    }
  }, [selectedChapterId]);

  // Pointer Interaction (Raycasting & Sonar Pings)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const clickables: THREE.Object3D[] = [];
    Object.values(reefObjectsRef.current).forEach((grp) => {
      clickables.push(...grp.children);
    });

    const intersects = raycasterRef.current.intersectObjects(clickables, true);
    if (intersects.length > 0) {
      let currentObj: THREE.Object3D | null = intersects[0].object;
      while (currentObj && !currentObj.userData.chapterId && currentObj.parent) {
        currentObj = currentObj.parent;
      }
      if (currentObj && currentObj.userData.chapterId) {
        const chap = chapters.find((c) => c.id === currentObj?.userData.chapterId);
        if (chap && chap !== hoveredChapter) {
          setHoveredChapter(chap);
          SoundEffects.playClick();
        }
        return;
      }
    }
    if (hoveredChapter !== null) {
      setHoveredChapter(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Trigger visual sonar ping wave
    const id = Date.now();
    setSonarRings((prev) => [...prev.slice(-3), { x: screenX, y: screenY, id }]);
    setTimeout(() => {
      setSonarRings((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
    SoundEffects.playSonarPing();

    if (hoveredChapter) {
      onSelectChapter(hoveredChapter);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full cursor-crosshair overflow-hidden select-none"
    >
      {/* 2D Sonar Ring Overlay (Interaction Layer) */}
      {sonarRings.map((ring) => (
        <div
          key={ring.id}
          className="pointer-events-none absolute rounded-full border border-[#3FF2E6] animate-sonar"
          style={{
            left: ring.x - 50,
            top: ring.y - 50,
            width: 100,
            height: 100
          }}
        />
      ))}

      {/* Floating Hover Indicator when inspecting a reef */}
      {hoveredChapter && !selectedChapterId && (
        <div
          className="pointer-events-none absolute z-20 top-6 left-1/2 -translate-x-1/2 submersible-glass px-5 py-2.5 rounded-full flex items-center gap-3 border border-[#3FF2E6]/40 shadow-lg animate-fade-in"
        >
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: hoveredChapter.accentColor }}
          />
          <span className="font-mono text-xs uppercase tracking-wider text-[#3FF2E6]">
            Chapter {hoveredChapter.number} · {hoveredChapter.depthZone.toUpperCase()} ({hoveredChapter.depthMeters}M)
          </span>
          <span className="text-sm font-semibold text-[#E8F6FA]">
            {hoveredChapter.reefName}
          </span>
          <span className="text-xs text-[#8FA7B3] font-mono">[CLICK TO INSPECT REEF]</span>
        </div>
      )}
    </div>
  );
};

// Helper: Procedural 3D Mesh for a Reef City
function createReefCityMesh(chapter: Chapter, coord: { x: number; y: number; z: number }, completedLessonIds: string[]) {
  const group = new THREE.Group();
  group.position.set(coord.x, coord.y, coord.z);
  group.userData = { chapterId: chapter.id };

  const color = new THREE.Color(chapter.accentColor);

  // Central Reef Spire (Tower of the Reef City)
  const spireGeo = new THREE.CylinderGeometry(1.2, 3.8, 14, 8);
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0x071426,
    emissive: color,
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.6
  });
  const spireMesh = new THREE.Mesh(spireGeo, spireMat);
  spireMesh.name = 'spire';
  group.add(spireMesh);

  // Bioluminescent Coral Rings
  const ringGeo = new THREE.TorusGeometry(4.5, 0.35, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.85
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 2;
  group.add(ringMesh);

  // Subtopic Pods (Luminous polyps orbiting the reef spire)
  const podsGroup = new THREE.Group();
  podsGroup.name = 'pods';
  const podCount = chapter.topics.length || 3;
  for (let p = 0; p < podCount; p++) {
    const angle = (p / podCount) * Math.PI * 2;
    const isMastered = chapter.topics[p]?.isMastered || false;
    const podGeo = new THREE.SphereGeometry(isMastered ? 1.1 : 0.85, 16, 16);
    const podMat = new THREE.MeshStandardMaterial({
      color: isMastered ? 0x7cffb2 : color,
      emissive: isMastered ? 0x7cffb2 : color,
      emissiveIntensity: isMastered ? 0.9 : 0.5,
      roughness: 0.2
    });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.position.set(Math.cos(angle) * 7.5, Math.sin(p) * 2, Math.sin(angle) * 7.5);
    podsGroup.add(podMesh);
  }
  group.add(podsGroup);

  // Reef Base Aura
  const auraGeo = new THREE.CircleGeometry(8, 24);
  auraGeo.rotateX(-Math.PI / 2);
  const auraMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.position.y = -6.8;
  group.add(auraMesh);

  return group;
}

// Helper: Background Jellyfish
function createJellyfishMesh(seed: number) {
  const group = new THREE.Group();
  group.scale.set(0.7, 0.7, 0.7);

  // Jellyfish Translucent Bell
  const bellGeo = new THREE.SphereGeometry(2.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const bellMat = new THREE.MeshStandardMaterial({
    color: seed % 2 === 0 ? 0x9b7bff : 0x5cc8ff,
    emissive: seed % 2 === 0 ? 0x6e4ed9 : 0x2d87b3,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    side: THREE.DoubleSide
  });
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.name = 'bell';
  group.add(bell);

  // Trailing tentacles
  for (let t = 0; t < 6; t++) {
    const angle = (t / 6) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5),
      new THREE.Vector3(Math.cos(angle) * 1.8, -4, Math.sin(angle) * 1.8),
      new THREE.Vector3(Math.cos(angle) * 0.8, -9, Math.sin(angle) * 0.8)
    ]);
    const tentacleGeo = new THREE.TubeGeometry(curve, 12, 0.08, 4, false);
    const tentacleMat = new THREE.MeshBasicMaterial({
      color: 0x9b7bff,
      transparent: true,
      opacity: 0.5
    });
    const tentacle = new THREE.Mesh(tentacleGeo, tentacleMat);
    group.add(tentacle);
  }

  return group;
}
