import React from 'react';

interface PlantShrubProps {
  color?: string;
  opacity?: number;
}

const PlantShrub: React.FC<PlantShrubProps> = ({ color = '#74C69D', opacity = 1 }) => (
  <svg width="160" height="200" viewBox="0 0 160 200" style={{ opacity }} className="plant plant-shrub">
    {/* Ground shadow */}
    <ellipse cx="80" cy="190" rx="55" ry="10" fill="#0a1a0f" opacity="0.4" />
    {/* Soil mound */}
    <ellipse cx="80" cy="188" rx="45" ry="12" fill="#1B4332" opacity="0.6" />

    {/* Main trunk */}
    <path
      d="M80 185 Q78 155 75 130 Q72 110 68 90"
      stroke="#2D6A4F"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    {/* Left branch */}
    <path
      d="M76 140 Q55 120 40 105"
      stroke="#2D6A4F"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Right branch */}
    <path
      d="M77 125 Q95 105 110 95"
      stroke="#2D6A4F"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Leaf clusters - back layer */}
    <ellipse cx="45" cy="95" rx="28" ry="22" fill={color} opacity="0.35" />
    <ellipse cx="110" cy="85" rx="25" ry="20" fill={color} opacity="0.35" />
    <ellipse cx="75" cy="65" rx="30" ry="25" fill={color} opacity="0.35" />

    {/* Leaf clusters - front layer */}
    <ellipse cx="38" cy="100" rx="22" ry="18" fill={color} opacity="0.55" />
    <ellipse cx="105" cy="90" rx="20" ry="16" fill={color} opacity="0.55" />
    <ellipse cx="70" cy="72" rx="25" ry="20" fill={color} opacity="0.55" />
    <ellipse cx="85" cy="50" rx="18" ry="15" fill={color} opacity="0.5" />

    {/* Highlight leaves */}
    <ellipse cx="55" cy="80" rx="12" ry="10" fill={color} opacity="0.7" />
    <ellipse cx="95" cy="75" rx="10" ry="9" fill={color} opacity="0.65" />
    <ellipse cx="72" cy="45" rx="10" ry="8" fill={color} opacity="0.6" />
  </svg>
);

export default PlantShrub;
