'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatRupee } from '@/lib/utils';
import type { StockQuote } from '@/types';

interface StockCardProps {
  stock: StockQuote;
  showDetails?: boolean;
}

export function StockCard({ stock, showDetails = false }: StockCardProps) {
  const isPositive = stock.changePercent >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeIcon = isPositive ? '↑' : '↓';

  return (
    <Link href={`/stock/${stock.symbol}`} className="block h-full">
      <Card hover className="h-full transition-transform duration-300 hover:scale-[1.02]">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{stock.symbol}</h3>
              <Badge variant="info" className="text-[10px] sm:text-xs shrink-0">
                {stock.exchange}
              </Badge>
            </div>
            <p className="mb-3 text-xs sm:text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">{stock.name}</p>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatRupee(stock.price)}
              </div>
              <div className={`text-xs sm:text-sm font-semibold ${changeColor} flex items-center gap-1`}>
                <span>{changeIcon}</span>
                <span>{Math.abs(stock.change).toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-800/50 grid grid-cols-2 gap-3 sm:gap-4 text-[10px] sm:text-xs">
              <div>
                <p className="text-gray-500 mb-1">Open</p>
                <p className="text-gray-300 font-medium">{formatRupee(stock.open)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">High</p>
                <p className="text-green-400 font-medium">{formatRupee(stock.high)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Low</p>
                <p className="text-red-400 font-medium">{formatRupee(stock.low)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Volume</p>
                <p className="text-gray-300 font-medium">
                  {(stock.volume / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
