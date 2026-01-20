'use client';

import { formatRupee } from '@/lib/utils';
import type { MarketIndex } from '@/lib/types';

interface MarketIndexCardProps {
  index: MarketIndex;
}

export function MarketIndexCard({ index }: MarketIndexCardProps) {
  const isPositive = index.changePercent >= 0;
  const glowColor = isPositive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)';
  const accentGradient = isPositive 
    ? 'from-emerald-500 via-emerald-400 to-teal-400' 
    : 'from-red-500 via-red-400 to-rose-400';

  return (
    <div className="group relative">
      <div 
        className={`
          relative overflow-hidden rounded-2xl
          bg-linear-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95
          border border-gray-800/60
          backdrop-blur-xl
          transition-all duration-500 ease-out
          hover:border-opacity-80
          ${isPositive ? 'hover:border-emerald-500/40' : 'hover:border-red-500/40'}
          hover:shadow-2xl
          group-hover:-translate-y-1
        `}
        style={{ 
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.04), 
            0 4px 32px -8px ${glowColor},
            0 8px 16px -8px rgba(0,0,0,0.4)
          `,
        }}
      >
        {/* Animated gradient border effect on hover */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 
          transition-opacity duration-500
          bg-linear-to-br ${isPositive ? 'from-emerald-500/8' : 'from-red-500/8'} via-transparent to-transparent
          pointer-events-none
        `} />

        {/* Subtle top accent line */}
        <div className={`
          absolute top-0 left-0 right-0 h-0.5 
          bg-linear-to-r ${accentGradient}
          opacity-60 group-hover:opacity-100
          transition-opacity duration-300
        `} />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                {/* Pulsing indicator dot */}
                <div className="relative flex h-2.5 w-2.5">
                  <span className={`
                    animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                    ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}
                  `} />
                  <span className={`
                    relative inline-flex rounded-full h-2.5 w-2.5
                    ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}
                  `} />
                </div>
                <h3 className="text-sm font-bold text-white/90 tracking-wide uppercase truncate">
                  {index.name}
                </h3>
              </div>
              <p className="mt-1 text-[11px] text-gray-500 font-medium tracking-wider pl-5">
                {index.symbol}
              </p>
            </div>
            
            {/* Live Badge */}
            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase
              ${isPositive 
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20' 
                : 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20'
              }
            `}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </span>
              Live
            </div>
          </div>

          {/* Value Section */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {formatRupee(index.value)}
              </p>
            </div>
            
            {/* Change Indicators */}
            <div className="flex items-center gap-3">
              {/* Percentage Change Pill */}
              <div className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold
                ${isPositive 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-red-500/15 text-red-400'
                }
                transition-all duration-300 group-hover:scale-105
              `}>
                <svg 
                  className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
                <span>{isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%</span>
              </div>
              
              {/* Points Change */}
              <span className={`
                text-xs font-medium
                ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}
              `}>
                {isPositive ? '+' : ''}{index.change.toFixed(2)} pts
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-16 
          bg-linear-to-t ${isPositive ? 'from-emerald-950/20' : 'from-red-950/20'} to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none
        `} />
      </div>
    </div>
  );
}
