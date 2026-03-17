import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceData {
  id: string;
  title: string;
  description: string;
  card_count: number;
  room_count: number;
  fragment: string | null;
  fragment_author: string | null;
  fragment_date: string | null;
  oldest_card_date: string | null;
  created_at: string;
}

interface Card3D {
  space: SpaceData;
  x: number; // lateral position
  z: number; // depth into the grove (negative = further away)
  y: number; // slight vertical offset
}

// Seeded random for consistent placement
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  let s = Math.abs(hash) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Layout constants
const DEPTH_RANGE = 30; // cards spread 30 units deep into the scene
const LATERAL_RANGE = 12; // cards spread 12 units wide
const CAMERA_START_Z = 12; // camera starts at the near edge

// ──────────────────────────────────────────
// 3D Card component — an HTML card floating in 3D space
// ──────────────────────────────────────────
interface GroveCard3DProps {
  card: Card3D;
  onClick: () => void;
  isMatch: boolean;
}

function getFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : text.slice(0, 100);
}

const GroveCard3D: React.FC<GroveCard3DProps> = ({ card, onClick, isMatch }) => {
  const cardCount = Number(card.space.card_count) || 1;
  const baseWidth = cardCount <= 2 ? 2.0 : cardCount <= 5 ? 2.4 : cardCount <= 12 ? 2.8 : 3.2;
  const dots = Math.min(cardCount, 12);
  const htmlRef = useRef<HTMLDivElement>(null);

  // Use a single useFrame with direct DOM updates — NO React state updates
  const { camera } = useThree();
  const pos = useMemo(() => new THREE.Vector3(card.x, card.y, card.z), [card.x, card.y, card.z]);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const toCard = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!htmlRef.current) return;
    const dist = camera.position.distanceTo(pos);

    // Compute opacity via direct DOM manipulation — no setState
    camDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    toCard.subVectors(pos, camera.position);
    const behind = camDir.dot(toCard);
    let alpha = 1;
    if (behind < -2) alpha = 0;
    else if (behind < 1) alpha = (behind + 2) / 3;
    else if (dist > 15) alpha = Math.max(0.1, 1 - (dist - 15) / 15);
    alpha *= isMatch ? 1 : 0.15;
    htmlRef.current.style.opacity = String(alpha);
    htmlRef.current.style.pointerEvents = alpha > 0.1 ? 'auto' : 'none';
  });

  // Determine initial visibility from fragment availability (static — fog handles distance)
  const hasFragment = !!card.space.fragment;
  const hasAuthor = !!card.space.fragment_author;

  // Forward wheel events to the canvas so trackpad scrolling works through cards
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Re-dispatch the wheel event on the canvas so the camera controller picks it up
    const canvas = (e.target as HTMLElement).closest('.grove-page')?.querySelector('canvas');
    if (canvas) {
      canvas.parentElement?.dispatchEvent(new WheelEvent('wheel', {
        deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode,
        ctrlKey: e.ctrlKey, clientX: e.clientX, clientY: e.clientY,
        bubbles: true, cancelable: true,
      }));
    }
  }, []);

  return (
    <group position={[card.x, card.y, card.z]}>
      <Html
        transform
        distanceFactor={8}
        style={{ width: `${baseWidth * 60}px`, pointerEvents: 'none' }}
      >
        <div
          ref={htmlRef}
          className="grove3d-card"
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onWheel={handleWheel}
        >
          <div className="grove3d-card-title">
            {card.space.title.length > 30 ? card.space.title.slice(0, 28) + '\u2026' : card.space.title}
            <span className="grove3d-card-count">{cardCount}</span>
          </div>

          {hasAuthor && (
            <div className="grove3d-card-author">{card.space.fragment_author}</div>
          )}

          {hasFragment && (
            <div className="grove3d-card-fragment">
              {getFirstSentence(card.space.fragment!).slice(0, 100)}
            </div>
          )}

          <div className="grove3d-card-dots">
            {Array.from({ length: dots }, (_, i) => (
              <span key={i} className="grove3d-dot" style={{ opacity: 0.3 + (i / dots) * 0.5 }} />
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
};

// ──────────────────────────────────────────
// Camera controller — drag to pan, scroll to move forward/back
// ──────────────────────────────────────────
interface CameraControllerProps {
  transitioning: boolean;
  flyTarget: { x: number; y: number; z: number } | null;
  onFlyComplete: () => void;
}

const CameraController: React.FC<CameraControllerProps> = ({ transitioning, flyTarget, onFlyComplete }) => {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, z: 0 });
  const targetPos = useRef(new THREE.Vector3(0, 1.6, CAMERA_START_Z));
  const flyProgress = useRef(0);
  const flyFrom = useRef(new THREE.Vector3());
  const interacted = useRef(false);

  // Restore saved position
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('grove-camera');
      if (saved) {
        const { x, y, z } = JSON.parse(saved);
        camera.position.set(x, y, z);
        targetPos.current.set(x, y, z);
      } else {
        camera.position.set(0, 1.6, CAMERA_START_Z);
        targetPos.current.set(0, 1.6, CAMERA_START_Z);
      }
    } catch { /* ignore */ }
    camera.lookAt(0, 1, -10);
  }, [camera]);

  useEffect(() => {
    // Attach to the parent container (not canvas) so events aren't blocked by Html overlays
    const el = gl.domElement.parentElement || gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      interacted.current = true;

      if (e.ctrlKey) {
        // Trackpad pinch → zoom (walk forward/back faster)
        const speed = e.deltaY * 0.05;
        targetPos.current.z -= speed;
      } else {
        // Two-finger swipe: deltaX → lateral, deltaY → walk forward/back
        targetPos.current.z -= e.deltaY * 0.015;
        targetPos.current.x += e.deltaX * 0.015;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, z: 0 };
      el.style.cursor = 'grabbing';
      interacted.current = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.02;
      const dy = (e.clientY - lastMouse.current.y) * 0.02;
      targetPos.current.x -= dx;
      targetPos.current.z -= dy; // drag up = move forward into grove
      velocity.current = { x: -dx, z: -dy };
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };

    // Touch handlers
    let touchStart = { x: 0, y: 0 };
    let touchWorldStart = { x: 0, z: 0 };
    let lastPinchDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      interacted.current = true;
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStart = { x: t.clientX, y: t.clientY };
        touchWorldStart = { x: targetPos.current.x, z: targetPos.current.z };
        velocity.current = { x: 0, z: 0 };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const dx = (t.clientX - touchStart.x) * 0.02;
        const dy = (t.clientY - touchStart.y) * 0.02;
        targetPos.current.x = touchWorldStart.x - dx;
        targetPos.current.z = touchWorldStart.z - dy;
      } else if (e.touches.length === 2) {
        // Pinch to zoom (walk forward/back)
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist > 0) {
          const delta = (dist - lastPinchDist) * 0.03;
          targetPos.current.z -= delta; // pinch out = walk forward
        }
        lastPinchDist = dist;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [gl, camera]);

  // Start fly animation when flyTarget changes
  useEffect(() => {
    if (flyTarget) {
      flyFrom.current.copy(camera.position);
      flyProgress.current = 0;
    }
  }, [flyTarget, camera]);

  useFrame((_, delta) => {
    if (transitioning && flyTarget) {
      // Fly-through animation
      flyProgress.current = Math.min(flyProgress.current + delta * 0.8, 1);
      const t = flyProgress.current;
      const ease = t * t * (3 - 2 * t); // smoothstep
      camera.position.lerpVectors(
        flyFrom.current,
        new THREE.Vector3(flyTarget.x, flyTarget.y + 0.5, flyTarget.z + 1.5),
        ease
      );
      camera.lookAt(flyTarget.x, flyTarget.y + 0.5, flyTarget.z);
      if (t >= 1) onFlyComplete();
      return;
    }

    // Normal movement with lerp + inertia
    if (!isDragging.current) {
      targetPos.current.x += velocity.current.x * 0.5;
      targetPos.current.z += velocity.current.z * 0.5;
      velocity.current.x *= 0.92;
      velocity.current.z *= 0.92;
    }

    camera.position.lerp(targetPos.current, 0.08);
    camera.lookAt(camera.position.x, 1, camera.position.z - 15);

    // Save position
    sessionStorage.setItem('grove-camera', JSON.stringify({
      x: camera.position.x, y: camera.position.y, z: camera.position.z
    }));
  });

  return null;
};

// ──────────────────────────────────────────
// Particle ground — small glowing dots scattered on the ground
// ──────────────────────────────────────────
const GroundParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, opacities } = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const opa = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * LATERAL_RANGE * 2.5;
      pos[i * 3 + 1] = Math.random() * 0.1;
      pos[i * 3 + 2] = Math.random() * -DEPTH_RANGE * 1.2;
      opa[i] = Math.random() * 0.5 + 0.1;
    }
    return { positions: pos, opacities: opa };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    const t = clock.elapsedTime;
    for (let i = 0; i < opacities.length; i++) {
      (posAttr.array as Float32Array)[i * 3 + 1] =
        Math.sin(t * 0.5 + i) * 0.05 + 0.05;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#74C69D" size={0.06} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

// ──────────────────────────────────────────
// Main GrovePage component
// ──────────────────────────────────────────
const GrovePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: doLogout } = useAuth();
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [cards, setCards] = useState<Card3D[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const [flyOverlay, setFlyOverlay] = useState(0);
  const flySpaceId = useRef('');

  // Fetch spaces and compute 3D positions
  useEffect(() => {
    api.getSpaces().then((data: SpaceData[]) => {
      setSpaces(data);

      // Place cards in 3D: spread in X and Z, slight Y variation
      const cols = Math.ceil(Math.sqrt(data.length * 0.8));
      const rows = Math.ceil(data.length / cols);
      const cellW = LATERAL_RANGE / cols;
      const cellD = DEPTH_RANGE / rows;

      const positioned: Card3D[] = data.map((space, i) => {
        const rng = seededRandom(space.id);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * cellW + (rng() - 0.5) * cellW * 0.5;
        const z = -(row * cellD + rng() * cellD * 0.4); // negative Z = deeper into scene
        const y = 0.8 + rng() * 0.8; // cards float between 0.8 and 1.6 height
        return { space, x, y, z };
      });

      setCards(positioned);
    });
  }, []);

  // Search filtering
  const matchingIds = searchText.trim()
    ? new Set(
        spaces
          .filter((s) => {
            const q = searchText.toLowerCase();
            return (
              s.title.toLowerCase().includes(q) ||
              (s.description || '').toLowerCase().includes(q) ||
              (s.fragment || '').toLowerCase().includes(q)
            );
          })
          .map((s) => s.id)
      )
    : null;

  const handleCardClick = useCallback((spaceId: string, x: number, y: number, z: number) => {
    if (transitioning) return;
    setTransitioning(true);
    flySpaceId.current = spaceId;
    setFlyTarget({ x, y, z });

    // Fade overlay
    let start: number | null = null;
    const animate = (time: number) => {
      if (!start) start = time;
      const t = Math.min((time - start) / 1200, 1);
      setFlyOverlay(t * t * t);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [transitioning]);

  const handleFlyComplete = useCallback(() => {
    navigate(`/spaces/${flySpaceId.current}`);
  }, [navigate]);

  const handleCreateSpace = async () => {
    if (!newTitle.trim()) return;
    try {
      const result = await api.createSpace(newTitle, newDesc);
      navigate(`/spaces/${result.id}`);
    } catch (err) {
      console.error('Failed to create space:', err);
    }
  };

  return (
    <div className="grove-page">
      <Canvas
        camera={{ position: [0, 1.6, CAMERA_START_Z], fov: 60, near: 0.1, far: 60 }}
        style={{ background: '#080f07' }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={['#080f07', 8, 35]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={0.2} color="#74C69D" />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -DEPTH_RANGE / 2]} receiveShadow>
          <planeGeometry args={[LATERAL_RANGE * 4, DEPTH_RANGE * 2]} />
          <meshStandardMaterial color="#0a1a10" />
        </mesh>

        {/* Ground particles */}
        <GroundParticles />

        {/* Camera controller */}
        <CameraController
          transitioning={transitioning}
          flyTarget={flyTarget}
          onFlyComplete={handleFlyComplete}
        />

        {/* 3D Cards */}
        {cards.map((card) => (
          <GroveCard3D
            key={card.space.id}
            card={card}
            isMatch={matchingIds === null || matchingIds.has(card.space.id)}
            onClick={() => handleCardClick(card.space.id, card.x, card.y, card.z)}
          />
        ))}
      </Canvas>

      {/* Fixed UI overlay */}
      <div className="grove-wordmark">Groven</div>

      <div className="grove-user-info">
        {user && (
          <>
            <span className="grove-username">{user.display_name}</span>
            <button className="grove-logout-btn" onClick={doLogout}>Logout</button>
          </>
        )}
      </div>

      {showHint && (
        <div className="grove-hint">
          Drag to move through &middot; Scroll to walk
        </div>
      )}

      <div className="grove-concern-input">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchText.trim() && matchingIds && matchingIds.size === 0) {
              setNewTitle(searchText);
              setShowNewSpace(true);
            }
          }}
          className="grove-concern-field"
        />
        {searchText.trim() && matchingIds && matchingIds.size === 0 && (
          <button
            className="grove-start-new"
            onClick={() => {
              setNewTitle(searchText);
              setShowNewSpace(true);
            }}
          >
            Start a new conversation
          </button>
        )}
      </div>

      {/* Fly-through dark overlay */}
      {flyOverlay > 0 && (
        <div className="grove-fly-overlay" style={{ opacity: flyOverlay }} />
      )}

      {/* New space modal */}
      {showNewSpace && (
        <div className="modal-overlay" onClick={() => setShowNewSpace(false)}>
          <div className="grove-new-space-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Plant a new seed</h3>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="form-input"
              autoFocus
            />
            <textarea
              placeholder="What is this conversation about?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="form-textarea"
              rows={3}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowNewSpace(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateSpace}>Plant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrovePage;
