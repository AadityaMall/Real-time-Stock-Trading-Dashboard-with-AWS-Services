'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupee } from '@/lib/utils';
import type { PriceHistory } from '@/lib/types';

interface PriceChartProps {
  data: PriceHistory;
  height?: number;
}

export function PriceChart({ data, height = 300 }: PriceChartProps) {
  // Extract prices and create a simple visualization
  const prices = data.data.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Simple SVG line chart
  const points = data.data
    .map((point, index) => {
      const x = (index / (data.data.length - 1)) * 100;
      const y = 100 - ((point.price - minPrice) / priceRange) * 90;
      return `${x},${y}`;
    })
    .join(' ');

  const latestPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const chartChange = latestPrice - firstPrice;
  const chartChangePercent = ((chartChange / firstPrice) * 100).toFixed(2);
  const isPositive = chartChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{data.symbol} Price Chart</CardTitle>
          <div className="text-right">
            <div className="text-sm text-gray-400">Period: {data.timeframe}</div>
            <div
              className={`text-lg font-semibold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {chartChangePercent}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={points}
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="0.5"
            />
            <polygon
              points={`0,100 ${points} 100,100`}
              fill="url(#gradient)"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
            <span>₹{minPrice.toFixed(2)}</span>
            <span>₹{maxPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div>
            <span className="text-gray-500">Current: </span>
            <span className="font-semibold text-white">{formatRupee(latestPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Change: </span>
            <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{formatRupee(chartChange)} ({isPositive ? '+' : ''}
              {chartChangePercent}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
