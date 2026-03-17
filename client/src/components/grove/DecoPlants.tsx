import React, { useMemo } from 'react';

interface DecoPlantsProps {
  count: number;
  width: number;
  height: number; // Used as center ground Y position
  depthSpread?: number; // How much Y variation (depth)
  seed?: number;
  scaleRange?: [number, number]; // [min, max] scale
  opacityRange?: [number, number]; // [min, max] opacity
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Decorative grass, ferns, and sprouts along the ground line of the grove
const DecoPlants: React.FC<DecoPlantsProps> = ({
  count,
  width,
  height,
  depthSpread = 120,
  seed = 7,
  scaleRange = [0.3, 0.9],
  opacityRange = [0.05, 0.2],
}) => {
  const plants = useMemo(() => {
    const rng = seededRandom(seed);
    const groundY = height;
    const [minScale, maxScale] = scaleRange;
    const [minOpacity, maxOpacity] = opacityRange;

    return Array.from({ length: count }, (_, i) => {
      const x = (rng() - 0.5) * width;
      // Plants spread across the depth range, matching card depth
      const depthOffset = (rng() - 0.5) * depthSpread;
      const y = groundY + depthOffset;
      // Depth-based adjustments: farther plants (lower Y) are slightly smaller/fainter
      const depthNorm = (depthOffset + depthSpread / 2) / depthSpread; // 0=far, 1=near
      const scale = (rng() * (maxScale - minScale) + minScale) * (0.7 + depthNorm * 0.3);
      const type = Math.floor(rng() * 5);
      const opacity = (rng() * (maxOpacity - minOpacity) + minOpacity) * (0.7 + depthNorm * 0.3);
      const swayDuration = rng() * 4 + 5;
      const swayDelay = rng() * 5;
      return { id: i, x, y, scale, type, opacity, swayDuration, swayDelay };
    });
  }, [count, width, height, depthSpread, seed, scaleRange, opacityRange]);

  return (
    <g className="deco-plants">
      {plants.map((p) => (
        <g
          key={p.id}
          transform={`translate(${p.x}, ${p.y}) scale(${p.scale})`}
          opacity={p.opacity}
        >
          {/* Inner group for sway animation — keeps it separate from positioning transform */}
          <g style={{
            animation: `plantSway ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite`,
            transformOrigin: '0px 0px',
          }}>
          {p.type === 0 && (
            /* Grass tuft — 3 blades */
            <>
              <line x1="0" y1="0" x2="-4" y2="-20" stroke="#40916C" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="1" y2="-26" stroke="#74C69D" strokeWidth="1" strokeLinecap="round" />
              <line x1="0" y1="0" x2="5" y2="-17" stroke="#40916C" strokeWidth="1" strokeLinecap="round" />
            </>
          )}
          {p.type === 1 && (
            /* Fern curl */
            <path
              d="M0 0 Q-5 -12 -2 -20 Q0 -14 2 -20 Q5 -12 0 0"
              fill="#2D6A4F"
              stroke="none"
            />
          )}
          {p.type === 2 && (
            /* Sprout with leaves */
            <>
              <line x1="0" y1="0" x2="0" y2="-16" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
              <ellipse cx="-4" cy="-16" rx="4" ry="3" fill="#40916C" opacity="0.7" />
              <ellipse cx="3" cy="-12" rx="3" ry="2.5" fill="#74C69D" opacity="0.5" />
            </>
          )}
          {p.type === 3 && (
            /* Tall grass — single elegant blade */
            <>
              <path d="M0 0 Q-2 -15 -1 -30" stroke="#40916C" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M0 0 Q1 -10 3 -24" stroke="#2D6A4F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </>
          )}
          {p.type === 4 && (
            /* Cluster of tiny dots — moss/ground cover */
            <>
              <circle cx="-3" cy="-2" r="1.5" fill="#2D6A4F" />
              <circle cx="2" cy="-4" r="1" fill="#40916C" />
              <circle cx="0" cy="-6" r="1.2" fill="#2D6A4F" />
              <circle cx="-1" cy="-1" r="0.8" fill="#74C69D" opacity="0.6" />
              <circle cx="4" cy="-2" r="1" fill="#40916C" opacity="0.5" />
            </>
          )}
          </g>
        </g>
      ))}
    </g>
  );
};

export default DecoPlants;
