import React from 'react';

interface FogBandsProps {
  width: number;
  height: number;
}

const bands = [
  { y: -200, rx: 1200, ry: 60, opacity: 0.04, duration: 35, delay: 0 },
  { y: 400, rx: 900, ry: 45, opacity: 0.06, duration: 28, delay: 5 },
  { y: 900, rx: 1400, ry: 70, opacity: 0.035, duration: 40, delay: 12 },
];

const FogBands: React.FC<FogBandsProps> = ({ width: _width, height: _height }) => (
  <g className="fog-bands">
    {bands.map((band, i) => (
      <ellipse
        key={i}
        cx={0}
        cy={band.y}
        rx={band.rx}
        ry={band.ry}
        fill="#74C69D"
        opacity={band.opacity}
        style={{
          animation: `fogDrift ${band.duration}s ease-in-out ${band.delay}s infinite`,
        }}
      />
    ))}
  </g>
);

export default FogBands;
