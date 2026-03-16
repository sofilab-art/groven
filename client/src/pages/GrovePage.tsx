import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { useGroveNavigation, WorldState } from '../hooks/useGroveNavigation';
import Starfield from '../components/grove/Starfield';
import DecoPlants from '../components/grove/DecoPlants';
import GroveCard from '../components/grove/GroveCard';

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

interface CardPosition {
  space: SpaceData;
  x: number;
  y: number;
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

// Base viewBox dimensions at zoom=1
const BASE_WIDTH = 1400;
const BASE_HEIGHT = 1000;

// World spread for card placement — horizontal grove layout
const WORLD_SPREAD_X = 1200;
const GROUND_Y = 180; // Ground line in world coordinates
const DEPTH_SPREAD = 120; // How much cards vary in depth (Y)

const GrovePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: doLogout } = useAuth();
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [cards, setCards] = useState<CardPosition[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [flyOverlay, setFlyOverlay] = useState(0); // 0-1 opacity for fly-through dark overlay

  // SVG ref for viewBox manipulation
  const svgRef = useRef<SVGSVGElement>(null);

  // Layer group refs for parallax offsets
  const layer0Ref = useRef<SVGGElement>(null);

  // Track current state for semantic zoom calculations — start centered on the ground
  const currentState = useRef<WorldState>({ x: 0, y: GROUND_Y - 60, zoom: 1 });
  const [, forceUpdate] = useState(0);
  const updateTimerRef = useRef<number>(0);

  const handleNavigationUpdate = useCallback((state: WorldState) => {
    currentState.current = state;

    // Update viewBox: higher zoom = smaller viewBox = closer
    const vbWidth = BASE_WIDTH / state.zoom;
    const vbHeight = BASE_HEIGHT / state.zoom;
    const vbX = state.x - vbWidth / 2;
    const vbY = state.y - vbHeight / 2;

    if (svgRef.current) {
      svgRef.current.setAttribute('viewBox', `${vbX} ${vbY} ${vbWidth} ${vbHeight}`);
    }

    // Parallax: background layers counteract camera to move slower
    if (layer0Ref.current) {
      layer0Ref.current.setAttribute('transform', `translate(${state.x * 0.9}, ${state.y * 0.9})`);
    }

    // Throttled React re-render for semantic zoom (10fps)
    if (!updateTimerRef.current) {
      updateTimerRef.current = window.setTimeout(() => {
        updateTimerRef.current = 0;
        forceUpdate((n) => n + 1);
      }, 100);
    }
  }, []);

  const { containerRef, stateRef, targetRef, interactedRef, restorePosition, savePosition, zoomTo } = useGroveNavigation({
    onUpdate: handleNavigationUpdate,
    initialState: { x: 0, y: GROUND_Y - 60, zoom: 1 },
  });

  // Merge refs
  const setSvgRef = useCallback((el: SVGSVGElement | null) => {
    (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
    (containerRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
  }, [containerRef]);

  // Hide hint after first interaction
  useEffect(() => {
    if (interactedRef.current && showHint) {
      const timer = setTimeout(() => setShowHint(false), 1500);
      return () => clearTimeout(timer);
    }
  });

  // Fetch spaces and compute card positions
  useEffect(() => {
    api.getSpaces().then((data: SpaceData[]) => {
      setSpaces(data);

      // Spread cards along X with depth (Y) variation — like trees at different distances
      const spacing = WORLD_SPREAD_X / Math.max(data.length, 1);
      const positioned: CardPosition[] = data.map((space, i) => {
        const rng = seededRandom(space.id);
        const x = (i - (data.length - 1) / 2) * spacing + (rng() - 0.5) * spacing * 0.3;
        // Stagger depth: each card at a different distance from viewer
        const depthOffset = (rng() - 0.5) * DEPTH_SPREAD;
        const y = GROUND_Y + depthOffset;
        return { space, x, y };
      });

      setCards(positioned);
    });
  }, []);

  // Restore position on mount — if returning from a space, zoom out from card
  useEffect(() => {
    const zoomTarget = sessionStorage.getItem('grove-zoom-target');
    if (zoomTarget) {
      try {
        const { x, y } = JSON.parse(zoomTarget);
        // Start camera deep inside the card (where the fly-through ended)
        stateRef.current = { x, y, zoom: 14 };
        targetRef.current = { x, y, zoom: 14 };
        handleNavigationUpdate({ x, y, zoom: 14 });
        setFlyOverlay(1); // Start fully dark

        // Then pull back out to the saved overview position
        const saved = sessionStorage.getItem('grove-position');
        const overview = saved ? JSON.parse(saved) : { x: 0, y: GROUND_Y - 60, zoom: 1 };

        const pullBackDuration = 1000;
        requestAnimationFrame(async () => {
          // Fade the dark overlay out during the zoom-out
          let start: number | null = null;
          const animateOverlay = (time: number) => {
            if (!start) start = time;
            const progress = Math.min((time - start) / pullBackDuration, 1);
            const eased = Math.pow(1 - progress, 3); // 1→0 fast fade at start
            setFlyOverlay(eased);
            if (progress < 1) requestAnimationFrame(animateOverlay);
          };
          requestAnimationFrame(animateOverlay);

          // Zoom out ease-out (fast → slow), pan ease-in (slow → fast settling into overview)
          await zoomTo(overview, pullBackDuration, 'ease-out', 'ease-in');
        });
      } catch { /* ignore */ }
      sessionStorage.removeItem('grove-zoom-target');
    } else {
      restorePosition();
    }
  }, [restorePosition, stateRef, targetRef, zoomTo, handleNavigationUpdate]);

  const handleCardClick = async (e: React.MouseEvent, spaceId: string, cardX: number, cardY: number) => {
    e.stopPropagation();
    if (transitioning) return; // Double-click protection
    savePosition();
    setTransitioning(true);

    // Save zoom target so we can zoom back out on return
    sessionStorage.setItem('grove-zoom-target', JSON.stringify({ x: cardX, y: cardY }));

    // Fly into the card: zoom ease-in (slow → fast), pan ease-out (fast → slow)
    const flyDuration = 1200;
    zoomTo({ x: cardX, y: cardY, zoom: 14 }, flyDuration, 'ease-in', 'ease-out');

    // Fade dark overlay in sync — same ease-in curve
    let start: number | null = null;
    const animateOverlay = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / flyDuration, 1);
      const eased = progress * progress * progress; // cubic ease-in to match
      setFlyOverlay(eased);
      if (progress < 1) requestAnimationFrame(animateOverlay);
    };
    requestAnimationFrame(animateOverlay);

    // Navigate after the fly-through completes
    await new Promise((r) => setTimeout(r, flyDuration));
    navigate(`/spaces/${spaceId}`);
  };

  const handleCreateSpace = async () => {
    if (!newTitle.trim()) return;
    try {
      const result = await api.createSpace(newTitle, newDesc);
      savePosition();
      navigate(`/spaces/${result.id}`);
    } catch (err) {
      console.error('Failed to create space:', err);
    }
  };

  // Filter by search
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

  // Semantic zoom visibility based on zoom level and distance from center
  const getVisibility = (card: CardPosition): 'minimal' | 'title' | 'author' | 'sentence' | 'full' => {
    const state = currentState.current;
    const vbWidth = BASE_WIDTH / state.zoom;

    const dx = card.x - state.x;
    const dy = card.y - state.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const normalizedDist = dist / vbWidth;

    // Card apparent width: larger cards at higher zoom
    const cardCount = Number(card.space.card_count) || 1;
    const cardW = cardCount <= 2 ? 140 : cardCount <= 5 ? 170 : cardCount <= 12 ? 200 : 240;
    const apparentSize = cardW / vbWidth;

    // Progressive reveal thresholds
    if (apparentSize < 0.08 || normalizedDist > 0.8) return 'minimal';
    if (apparentSize < 0.14 || normalizedDist > 0.5) return 'title';
    if (apparentSize < 0.22 || normalizedDist > 0.35) return 'author';
    if (apparentSize < 0.35 || normalizedDist > 0.2) return 'sentence';
    return 'full';
  };

  return (
    <div className={`grove-page${transitioning ? ' grove-transitioning' : ''}`}>
      <svg
        ref={setSvgRef}
        width="100%"
        height="100%"
        viewBox={`${-BASE_WIDTH / 2} ${-BASE_HEIGHT / 2} ${BASE_WIDTH} ${BASE_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ touchAction: 'none' }}
      >
        {/* Layer 0: Stars (slowest parallax) */}
        <g ref={layer0Ref}>
          <Starfield width={WORLD_SPREAD_X * 3} height={1200} groundY={GROUND_Y} />
        </g>

        {/* Decorative plants on the ground — clearly visible, rooted at ground level */}
        <DecoPlants count={20} width={WORLD_SPREAD_X} height={GROUND_Y} depthSpread={DEPTH_SPREAD} seed={13} scaleRange={[1.5, 3.0]} opacityRange={[0.3, 0.6]} />
        <DecoPlants count={15} width={WORLD_SPREAD_X} height={GROUND_Y} depthSpread={DEPTH_SPREAD} seed={77} scaleRange={[2.5, 5.0]} opacityRange={[0.35, 0.65]} />

        {/* Ground plane — deep fog + gradient at the ground line */}
        <defs>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B4332" stopOpacity="0.15" />
            <stop offset="30%" stopColor="#2D6A4F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#080f07" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="groundFog" cx="50%" cy="0%" rx="50%" ry="100%">
            <stop offset="0%" stopColor="#74C69D" stopOpacity="0.12" />
            <stop offset="40%" stopColor="#2D6A4F" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#080f07" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="groundFog2" cx="50%" cy="20%" rx="50%" ry="100%">
            <stop offset="0%" stopColor="#74C69D" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#40916C" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#080f07" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          x={-WORLD_SPREAD_X * 1.5}
          y={GROUND_Y}
          width={WORLD_SPREAD_X * 3}
          height={500}
          fill="url(#groundGrad)"
        />
        {/* Deep ground fog — multiple overlapping layers for volume */}
        <ellipse
          cx={0}
          cy={GROUND_Y + 10}
          rx={WORLD_SPREAD_X * 1.4}
          ry={80}
          fill="url(#groundFog)"
          style={{ animation: 'fogDrift 30s ease-in-out infinite' }}
        />
        <ellipse
          cx={200}
          cy={GROUND_Y + 25}
          rx={WORLD_SPREAD_X * 1.0}
          ry={60}
          fill="url(#groundFog2)"
          style={{ animation: 'fogDrift 45s ease-in-out 3s infinite reverse' }}
        />
        <ellipse
          cx={-400}
          cy={GROUND_Y + 5}
          rx={WORLD_SPREAD_X * 0.7}
          ry={45}
          fill="#74C69D"
          opacity={0.04}
          style={{ animation: 'fogDrift 35s ease-in-out 8s infinite' }}
        />
        <ellipse
          cx={100}
          cy={GROUND_Y + 40}
          rx={WORLD_SPREAD_X * 1.2}
          ry={100}
          fill="#2D6A4F"
          opacity={0.05}
          style={{ animation: 'fogDrift 50s ease-in-out 12s infinite reverse' }}
        />
        {/* Subtle ground horizon line */}
        <line
          x1={-WORLD_SPREAD_X * 1.5}
          y1={GROUND_Y - DEPTH_SPREAD / 2}
          x2={WORLD_SPREAD_X * 1.5}
          y2={GROUND_Y - DEPTH_SPREAD / 2}
          stroke="#2D6A4F"
          strokeWidth={0.3}
          opacity={0.08}
        />

        {/* Layer 3: Cards (1:1 with camera via viewBox) — sorted by Y so farther cards render first */}
        <g>
          {[...cards].sort((a, b) => a.y - b.y).map((card) => {
            const vis = getVisibility(card);
            const isMatch = matchingIds === null || matchingIds.has(card.space.id);
            // Depth-based scale: cards farther away (lower Y) are slightly smaller
            const depthNorm = (card.y - (GROUND_Y - DEPTH_SPREAD / 2)) / DEPTH_SPREAD; // 0=far, 1=near
            const depthScale = 0.75 + depthNorm * 0.25; // 0.75 to 1.0
            const depthOpacity = 0.6 + depthNorm * 0.4; // 0.6 to 1.0 — farther = slightly faded
            return (
              <g key={card.space.id} transform={`translate(${card.x}, ${card.y}) scale(${depthScale})`} opacity={depthOpacity}>
                <GroveCard
                  title={card.space.title}
                  cardCount={Number(card.space.card_count) || 0}
                  fragment={card.space.fragment}
                  fragmentAuthor={card.space.fragment_author}
                  description={card.space.description}
                  visibility={vis}
                  isMatch={isMatch}
                  onClick={(e) => handleCardClick(e, card.space.id, card.x, card.y)}
                />
              </g>
            );
          })}
        </g>
      </svg>

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
        <div className="grove-hint" style={{ opacity: interactedRef.current ? 0 : 1 }}>
          Scroll to dive &middot; Drag to explore
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
        <div
          className="grove-fly-overlay"
          style={{ opacity: flyOverlay }}
        />
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
