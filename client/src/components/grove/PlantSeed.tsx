import React from 'react';

interface PlantSeedProps {
  color?: string;
  opacity?: number;
}

const PlantSeed: React.FC<PlantSeedProps> = ({ color = '#74C69D', opacity = 1 }) => (
  <svg width="50" height="70" viewBox="0 0 50 70" style={{ opacity }} className="plant plant-seed">
    {/* Soil mound */}
    <ellipse cx="25" cy="65" rx="18" ry="5" fill="#1B4332" opacity="0.6" />
    {/* Stem */}
    <path
      d="M25 64 Q25 50 23 40"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Single unfurling leaf */}
    <path
      d="M23 40 Q15 30 18 20 Q22 28 25 35"
      fill={color}
      opacity="0.8"
    />
    {/* Tiny bud at top */}
    <circle cx="17" cy="21" r="2.5" fill={color} opacity="0.6" />
  </svg>
);

export default PlantSeed;
