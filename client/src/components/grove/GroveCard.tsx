import React from 'react';

interface GroveCardProps {
  title: string;
  cardCount: number;
  fragment?: string | null;
  fragmentAuthor?: string | null;
  description?: string | null;
  visibility: 'minimal' | 'title' | 'author' | 'sentence' | 'full';
  isMatch?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

// Card size scales with activity
function getCardSize(cardCount: number): { width: number; height: number } {
  if (cardCount <= 2) return { width: 140, height: 80 };
  if (cardCount <= 5) return { width: 170, height: 95 };
  if (cardCount <= 12) return { width: 200, height: 110 };
  return { width: 240, height: 130 };
}

function getFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : text.slice(0, 100);
}

function getFirstTwoSentences(text: string): string {
  const sentences = text.match(/[^.!?]*[.!?]/g);
  if (!sentences) return text.slice(0, 180);
  return sentences.slice(0, 2).join(' ').trim();
}

const GroveCard: React.FC<GroveCardProps> = ({
  title,
  cardCount,
  fragment,
  fragmentAuthor,
  description,
  visibility,
  isMatch = true,
  onClick,
}) => {
  const { width, height } = getCardSize(cardCount);
  const opacity = isMatch ? 1 : 0.12;

  // Activity indicator: small dots along the bottom edge
  const dots = Math.min(cardCount, 12);

  return (
    <g
      style={{ cursor: 'pointer', transition: 'opacity 0.4s' }}
      opacity={opacity}
      onClick={onClick}
    >
      {/* Card background — anchored at bottom (y=0 is ground) */}
      <rect
        x={-width / 2}
        y={-height}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="rgba(14, 42, 30, 0.92)"
        stroke="rgba(116, 198, 157, 0.25)"
        strokeWidth={1}
      />

      {/* Subtle glow on the card */}
      <rect
        x={-width / 2 + 1}
        y={-height + 1}
        width={width - 2}
        height={height - 2}
        rx={7}
        ry={7}
        fill="none"
        stroke="rgba(116, 198, 157, 0.1)"
        strokeWidth={1}
      />

      {/* Small ground root marks */}
      <line x1={-width / 4} y1={0} x2={-width / 4 - 6} y2={8} stroke="#2D6A4F" strokeWidth={1} opacity={0.3} />
      <line x1={width / 4} y1={0} x2={width / 4 + 5} y2={6} stroke="#2D6A4F" strokeWidth={1} opacity={0.2} />

      {/* Activity dots along bottom edge (at ground level) */}
      {Array.from({ length: dots }, (_, i) => (
        <circle
          key={i}
          cx={-width / 2 + 12 + i * 8}
          cy={-6}
          r={2}
          fill="#74C69D"
          opacity={0.3 + (i / dots) * 0.3}
        />
      ))}

      {/* Title — always visible */}
      <text
        x={0}
        y={-height + 22}
        textAnchor="middle"
        fill="#74C69D"
        fontSize={visibility === 'minimal' ? 9 : 11}
        fontFamily="Outfit, sans-serif"
        fontWeight="500"
        opacity={visibility === 'minimal' ? 0.5 : 0.85}
      >
        {title.length > 26 ? title.slice(0, 24) + '\u2026' : title}
      </text>

      {/* Card count badge */}
      {visibility !== 'minimal' && (
        <text
          x={width / 2 - 14}
          y={-height + 22}
          textAnchor="middle"
          fill="#74C69D"
          fontSize="8"
          fontFamily="Outfit, sans-serif"
          opacity="0.35"
        >
          {cardCount}
        </text>
      )}

      {/* Fragment text — progressive reveal */}
      {visibility === 'author' && fragment && (
        <foreignObject
          x={-width / 2 + 10}
          y={-height + 30}
          width={width - 20}
          height={height - 44}
        >
          <div className="grove-fragment" style={{ opacity: 0.5 }}>
            {fragmentAuthor && (
              <div className="grove-fragment-author">{fragmentAuthor}</div>
            )}
            <div className="grove-fragment-text">
              {getFirstSentence(fragment).slice(0, 50)}...
            </div>
          </div>
        </foreignObject>
      )}

      {visibility === 'sentence' && fragment && (
        <foreignObject
          x={-width / 2 + 10}
          y={-height + 30}
          width={width - 20}
          height={height - 38}
        >
          <div className="grove-fragment" style={{ opacity: 0.75 }}>
            {fragmentAuthor && (
              <div className="grove-fragment-author">{fragmentAuthor}</div>
            )}
            <div className="grove-fragment-text">
              {getFirstSentence(fragment)}
            </div>
          </div>
        </foreignObject>
      )}

      {visibility === 'full' && fragment && (
        <foreignObject
          x={-width / 2 + 10}
          y={-height + 30}
          width={width - 20}
          height={height + 60}
        >
          <div className="grove-fragment" style={{ opacity: 1 }}>
            {fragmentAuthor && (
              <div className="grove-fragment-author">{fragmentAuthor}</div>
            )}
            <div className="grove-fragment-text">
              {getFirstTwoSentences(fragment)}
            </div>
            {description && (
              <div className="grove-fragment-context">
                {description.slice(0, 120)}
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default GroveCard;
