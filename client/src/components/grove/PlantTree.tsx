import React from 'react';

interface PlantTreeProps {
  color?: string;
  opacity?: number;
}

const PlantTree: React.FC<PlantTreeProps> = ({ color = '#74C69D', opacity = 1 }) => (
  <svg width="220" height="310" viewBox="0 0 220 310" style={{ opacity }} className="plant plant-tree">
    {/* Ground shadow */}
    <ellipse cx="110" cy="298" rx="75" ry="12" fill="#0a1a0f" opacity="0.4" />
    {/* Soil/roots */}
    <ellipse cx="110" cy="295" rx="55" ry="15" fill="#1B4332" opacity="0.5" />

    {/* Trunk */}
    <path
      d="M110 290 Q108 250 105 210 Q102 180 98 150 Q95 125 92 100"
      stroke="#2D6A4F"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    {/* Trunk highlight */}
    <path
      d="M112 285 Q110 248 107 212 Q104 182 100 152"
      stroke="#3d8a6a"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.3"
    />

    {/* Major branches */}
    <path d="M100 170 Q70 145 45 130" stroke="#2D6A4F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M103 150 Q130 125 160 115" stroke="#2D6A4F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M96 120 Q65 95 50 75" stroke="#2D6A4F" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M94 105 Q115 80 140 65" stroke="#2D6A4F" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M92 90 Q85 60 80 35" stroke="#2D6A4F" strokeWidth="2.5" fill="none" strokeLinecap="round" />

    {/* Canopy - deep layer */}
    <ellipse cx="50" cy="115" rx="35" ry="30" fill={color} opacity="0.25" />
    <ellipse cx="155" cy="100" rx="35" ry="28" fill={color} opacity="0.25" />
    <ellipse cx="95" cy="60" rx="40" ry="35" fill={color} opacity="0.25" />
    <ellipse cx="55" cy="65" rx="30" ry="25" fill={color} opacity="0.25" />
    <ellipse cx="140" cy="55" rx="30" ry="25" fill={color} opacity="0.25" />
    <ellipse cx="85" cy="25" rx="30" ry="22" fill={color} opacity="0.25" />

    {/* Canopy - mid layer */}
    <ellipse cx="45" cy="120" rx="28" ry="24" fill={color} opacity="0.4" />
    <ellipse cx="150" cy="105" rx="28" ry="22" fill={color} opacity="0.4" />
    <ellipse cx="90" cy="70" rx="35" ry="28" fill={color} opacity="0.4" />
    <ellipse cx="50" cy="70" rx="25" ry="20" fill={color} opacity="0.4" />
    <ellipse cx="135" cy="60" rx="25" ry="20" fill={color} opacity="0.4" />
    <ellipse cx="80" cy="30" rx="25" ry="18" fill={color} opacity="0.4" />

    {/* Canopy - front highlights */}
    <ellipse cx="55" cy="105" rx="18" ry="15" fill={color} opacity="0.6" />
    <ellipse cx="140" cy="95" rx="16" ry="14" fill={color} opacity="0.55" />
    <ellipse cx="95" cy="55" rx="22" ry="18" fill={color} opacity="0.6" />
    <ellipse cx="70" cy="45" rx="15" ry="12" fill={color} opacity="0.55" />
    <ellipse cx="120" cy="50" rx="14" ry="12" fill={color} opacity="0.5" />
    <ellipse cx="85" cy="18" rx="16" ry="12" fill={color} opacity="0.5" />
  </svg>
);

export default PlantTree;
