import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Geometric Luxury Monogram */}
      <div className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br from-[#1C2844] to-[#0A1224] border border-[#C5A880]/30 shadow-md ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Architectural Pentagon / Diamond Motif */}
          <polygon
            points="20,4 36,15 30,34 10,34 4,15"
            stroke="#C5A880"
            strokeWidth="1.8"
            fill="none"
          />
          <polygon
            points="20,10 31,18 27,30 13,30 9,18"
            stroke="#DFCAAB"
            strokeWidth="1.2"
            fill="rgba(197, 168, 128, 0.08)"
          />
          {/* Central Stylized 'E' Pillar */}
          <path
            d="M17 16H24M17 20H22M17 24H24M17 16V24"
            stroke="#F9F8F6"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-serif font-bold tracking-wider text-white ${textSizes[size]}`}>
            ESTATE<span className="text-[#C5A880]">IQ</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-[#C5A880]/15 text-[#DFCAAB] border border-[#C5A880]/30">
            AI
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] tracking-widest uppercase font-medium text-[#8A99AD]">
            DarGlobal × Wasalt Intelligence
          </p>
        )}
      </div>
    </div>
  );
};
