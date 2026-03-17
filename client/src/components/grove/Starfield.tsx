import React, { useMemo } from 'react';

interface StarfieldProps {
  width: number;
  height: number;
  groundY?: number; // Stars only appear above this Y coordinate
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const Starfield: React.FC<StarfieldProps> = ({ width, height, groundY }) => {
  const stars = useMemo(() => {
    const rng = seededRandom(42);
    const maxY = groundY !== undefined ? groundY - 20 : height;
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      cx: (rng() - 0.5) * width * 2,
      // Place stars from top of sky down to just above ground
      cy: -height + rng() * (height + maxY),
      r: rng() * 1.5 + 0.5,
      delay: rng() * 6,
      duration: rng() * 4 + 2,
      baseOpacity: rng() * 0.4 + 0.1,
    }));
  }, [width, height, groundY]);

  return (
    <g className="starfield">
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          fill="#F8F5F0"
          opacity={star.baseOpacity}
          style={{
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </g>
  );
};

export default Starfield;
