import React from 'react';

interface PlantSeedlingProps {
  color?: string;
  opacity?: number;
}

const PlantSeedling: React.FC<PlantSeedlingProps> = ({ color = '#74C69D', opacity = 1 }) => (
  <svg width="90" height="130" viewBox="0 0 90 130" style={{ opacity }} className="plant plant-seedling">
    {/* Soil mound */}
    <ellipse cx="45" cy="122" rx="30" ry="8" fill="#1B4332" opacity="0.6" />
    {/* Main stem */}
    <path
      d="M45 120 Q44 95 42 70 Q40 50 38 35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.9"
    />
    {/* Left leaf */}
    <path
      d="M42 75 Q25 60 20 45 Q30 55 40 68"
      fill={color}
      opacity="0.7"
    />
    {/* Right leaf */}
    <path
      d="M43 60 Q58 45 65 30 Q55 48 44 55"
      fill={color}
      opacity="0.8"
    />
    {/* Top leaf unfurling */}
    <path
      d="M38 35 Q28 20 22 10 Q32 18 37 30"
      fill={color}
      opacity="0.75"
    />
    {/* Small inner leaf */}
    <path
      d="M40 42 Q50 30 55 22 Q48 33 41 38"
      fill={color}
      opacity="0.5"
    />
  </svg>
);

export default PlantSeedling;
