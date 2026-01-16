'use client';

import { Card } from '@/components/ui/Card';
import { formatRupee } from '@/lib/utils';
import type { MarketIndex } from '@/types';

interface MarketIndexCardProps {
  index: MarketIndex;
}

export function MarketIndexCard({ index }: MarketIndexCardProps) {
  const isPositive = index.changePercent >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <Card hover className="transition-transform duration-300 hover:scale-[1.02]">
      <div className="mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-300">{index.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{index.symbol}</p>
      </div>
      <div className="mt-4">
        <p className="text-xl sm:text-2xl font-bold text-white">
          {formatRupee(index.value)}
        </p>
        <p className={`mt-2 text-xs sm:text-sm font-semibold ${changeColor} flex items-center gap-1`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{isPositive ? '+' : ''}{index.change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)</span>
        </p>
      </div>
    </Card>
  );
}
