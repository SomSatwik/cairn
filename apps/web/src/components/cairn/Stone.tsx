import React from 'react';

export interface StoneProps {
  index: number;
  width: number;
  height: number;
  variant: number; // 0 to 7 deterministic shape variant
  colorTone?: 'base' | 'cool' | 'warm' | 'ochre-accent' | 'disputed';
  rotation?: number;
  offsetX?: number;
  label?: string;
  sublabel?: string;
  isBase?: boolean;
}

// Hand-crafted SVG polygon profiles representing natural geological stones with faceted edges
const STONE_PATHS = [
  // 0: Broad stratified slate slab (rugged flat top & bottom)
  'M 12 10 Q 25 6 70 8 Q 130 9 188 12 Q 196 22 192 34 Q 160 38 100 37 Q 35 39 8 32 Q 5 20 12 10 Z',
  // 1: Granite river stone (gently weathered irregular oval)
  'M 18 12 C 45 7 120 6 182 14 C 195 24 190 35 178 38 C 130 42 60 41 18 36 C 6 28 8 18 18 12 Z',
  // 2: Angular basalt block (crisp geological fracture planes)
  'M 8 16 L 35 8 L 110 7 L 185 11 L 194 26 L 180 38 L 105 39 L 24 37 L 6 28 Z',
  // 3: Weathered limestone layer (subtle sedimentary crests)
  'M 15 14 Q 55 9 105 11 Q 155 8 185 15 Q 192 27 186 36 Q 135 40 85 38 Q 30 41 10 33 Q 8 22 15 14 Z',
  // 4: Tapered capstone (balanced apex stone)
  'M 35 14 Q 75 8 105 7 Q 135 9 165 15 Q 180 26 172 36 Q 120 40 85 39 Q 30 38 22 30 Q 24 20 35 14 Z',
  // 5: Heavy foundation boulder (broad, sturdy, deep base)
  'M 10 18 Q 40 10 100 9 Q 160 11 190 19 Q 196 32 188 42 Q 130 45 70 44 Q 12 43 5 30 Q 4 22 10 18 Z',
  // 6: Chiseled shale plate (thin stratified edge)
  'M 14 11 L 80 8 L 150 9 L 186 13 L 192 28 L 155 35 L 75 36 L 12 33 L 7 21 Z',
  // 7: Compact balanced marker stone
  'M 28 12 Q 65 7 110 8 Q 150 10 172 16 Q 182 28 170 38 Q 120 41 80 40 Q 35 39 20 32 Q 18 20 28 12 Z',
];

const COLOR_SCHEMES = {
  base: {
    fill: '#1c1e24',
    stroke: 'rgba(255, 255, 255, 0.12)',
    texture: 'rgba(255, 255, 255, 0.04)',
    accent: '#485060',
  },
  cool: {
    fill: '#252933',
    stroke: 'rgba(255, 255, 255, 0.14)',
    texture: 'rgba(255, 255, 255, 0.05)',
    accent: '#646D80',
  },
  warm: {
    fill: '#2b2925',
    stroke: 'rgba(255, 255, 255, 0.14)',
    texture: 'rgba(255, 255, 255, 0.06)',
    accent: '#8A867D',
  },
  'ochre-accent': {
    fill: '#2f1e14',
    stroke: '#D97736',
    texture: 'rgba(217, 119, 54, 0.12)',
    accent: '#D97736',
  },
  disputed: {
    fill: '#2b1717',
    stroke: '#b91c1c',
    texture: 'rgba(185, 28, 28, 0.15)',
    accent: '#ef4444',
  },
};

export const Stone: React.FC<StoneProps> = ({
  width,
  height,
  variant,
  colorTone = 'cool',
  rotation = 0,
  offsetX = 0,
  label,
  sublabel,
  isBase = false,
}) => {
  const path = STONE_PATHS[variant % STONE_PATHS.length] || STONE_PATHS[0]!;
  const colors = COLOR_SCHEMES[colorTone];

  return (
    <div
      className="relative flex flex-col items-center justify-center transition-transform duration-300"
      style={{
        transform: `rotate(${rotation}deg) translateX(${offsetX}px)`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg
        viewBox="0 0 200 48"
        preserveAspectRatio="none"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        <defs>
          <linearGradient
            id={`stone-grad-${variant}-${colorTone}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.fill} stopOpacity="1" />
            <stop
              offset="100%"
              stopColor={colorTone === 'ochre-accent' ? '#21130b' : '#14161a'}
              stopOpacity="1"
            />
          </linearGradient>
        </defs>

        {/* Natural stone silhouette */}
        <path
          d={path}
          fill={`url(#stone-grad-${variant}-${colorTone})`}
          stroke={colors.stroke}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />

        {/* Geological sedimentation fissures / strata lines */}
        <path
          d="M 30 20 Q 90 23 160 21"
          stroke={colors.texture}
          strokeWidth="1"
          fill="none"
          strokeDasharray="12 4 8 6"
        />
        <path
          d="M 45 28 Q 110 30 145 29"
          stroke={colors.texture}
          strokeWidth="0.75"
          fill="none"
        />

        {/* Subtle top edge highlight */}
        <path
          d="M 25 12 Q 95 9 170 14"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>

      {/* Embedded stone label for the column view */}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
          {label && (
            <span
              className={`text-[11px] font-medium tracking-wide truncate max-w-[90%] ${
                isBase ? 'text-stone-warm-100 font-semibold' : 'text-stone-warm-200'
              }`}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[9px] text-stone-warm-500 font-mono tabular truncate max-w-[85%]">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
