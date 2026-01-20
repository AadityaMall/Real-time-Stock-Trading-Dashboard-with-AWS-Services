'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { formatRupee, formatLargeNumber } from '@/lib/utils';
import type { StockQuote } from '@/lib/types';

interface StockCardProps {
  stock: StockQuote;
  showDetails?: boolean;
}


export function StockCard({ stock, showDetails = false }: StockCardProps) {
  const isPositive = stock.changePercent >= 0;
  const seed = stock.symbol.charCodeAt(0) + stock.symbol.charCodeAt(stock.symbol.length - 1);
  
  // Dynamic colors based on performance
  const accentColor = isPositive ? 'emerald' : 'red';
  const glowColor = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  
  return (
    <Link href={`/stocks/${stock.symbol}`} className="block h-full group">
      <div 
        className={`
          relative h-full rounded-xl overflow-hidden
          bg-linear-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95
          border border-gray-800/50
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:border-${accentColor}-500/30
          hover:shadow-xl
          group-hover:-translate-y-1
        `}
        style={{ 
          boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px -4px ${glowColor}`,
        }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br ${isPositive ? 'from-emerald-500/5' : 'from-red-500/5'} to-transparent pointer-events-none`} />
        
        <div className="relative p-4 flex flex-col h-full">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Stock Symbol with accent bar */}
                <div className={`w-1 h-5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  {stock.symbol}
                </h3>
              </div>
              <p className="mt-0.5 text-[11px] text-gray-500 truncate pl-3">
                {stock.name}
              </p>
            </div>
            
            {/* Exchange Badge */}
            <span className={`
              px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide
              ${stock.exchange === 'NASDAQ' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }
            `}>
              {stock.exchange}
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-auto">
            <div className="relative z-10 flex items-end justify-between gap-2">
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  {formatRupee(stock.price)}
                </div>
                <div className={`
                  mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold
                  ${isPositive 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'bg-red-500/15 text-red-400'
                  }
                `}>
                  <svg 
                    className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>{Math.abs(stock.changePercent).toFixed(2)}%</span>
                </div>
              </div>
              
              {/* Change Amount */}
              <div className={`text-right text-xs ${isPositive ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                <span className="font-medium">
                  {isPositive ? '+' : ''}{formatRupee(stock.change)}
                </span>
              </div>
            </div>
          </div>

          {/* Extended Details Section */}
          {showDetails && (
            <div className="relative z-10 mt-4 pt-3 border-t border-gray-800/40">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Vol:</span>
                  <span className="text-gray-300 font-medium">{formatLargeNumber(stock.volume)}</span>
                </div>
                {stock.sector && (
                  <span className="text-gray-400 truncate ml-2">{stock.sector}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Live indicator pulse */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </span>
        </div>
      </div>
    </Link>
  );
}
