'use client';

import { useEffect, useState } from 'react';
import { StockCard } from '@/components/features/StockCard';
import { MarketIndexCard } from '@/components/features/MarketIndexCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { formatRupee } from '@/lib/utils';
import {
  getAllStockQuotes,
  getMarketSummary,
  generateMockPortfolio,
  subscribeToPriceUpdates,
} from '@/lib/mockData';
import type { StockQuote, MarketSummary, Portfolio } from '@/types';

export default function DashboardPage() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    // Initial load
    const initialStocks = getAllStockQuotes();
    const summary = getMarketSummary();
    const mockPortfolio = generateMockPortfolio();

    setStocks(initialStocks);
    setMarketSummary(summary);
    setPortfolio(mockPortfolio);

    // Subscribe to price updates for all stocks
    const unsubscribeFunctions = initialStocks.map((stock) =>
      subscribeToPriceUpdates(stock.symbol, (price) => {
        setStocks((prev) =>
          prev.map((s) =>
            s.symbol === stock.symbol
              ? { ...s, ...price }
              : s
          )
        );
      }, 3000)
    );

    // Update portfolio periodically
    const portfolioInterval = setInterval(() => {
      const updatedPortfolio = generateMockPortfolio();
      setPortfolio(updatedPortfolio);
    }, 5000);

    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub());
      clearInterval(portfolioInterval);
    };
  }, []);

  if (!marketSummary || !portfolio) {
    return <Loading />;
  }

  const isPositive = portfolio.totalProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Portfolio Summary */}
        <div className="mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 via-gray-900/60 to-gray-900/40 border-blue-500/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base text-gray-400 font-medium">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-4 space-y-2 sm:space-y-0">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {formatRupee(portfolio.totalValue)}
                </span>
                <span
                  className={`text-lg sm:text-xl font-semibold flex items-center gap-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <span>{isPositive ? '↑' : '↓'}</span>
                  <span>{isPositive ? '+' : ''}{formatRupee(portfolio.totalProfitLoss)}</span>
                  <span>({isPositive ? '+' : ''}{portfolio.totalProfitLossPercent.toFixed(2)}%)</span>
                </span>
              </div>
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Cash:</span>
                  <span className="text-gray-200 font-medium">{formatRupee(portfolio.cashBalance)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Invested:</span>
                  <span className="text-gray-200 font-medium">{formatRupee(portfolio.totalInvested)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Indices */}
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-white">Market Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {marketSummary.indices.map((index) => (
              <MarketIndexCard key={index.symbol} index={index} />
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">Top Gainers</h2>
            <Badge variant="success" className="text-[10px] sm:text-xs">Live</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {marketSummary.topGainers.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">Top Losers</h2>
            <Badge variant="danger" className="text-[10px] sm:text-xs">Live</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {marketSummary.topLosers.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>

        {/* All Stocks */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">All Stocks</h2>
            <Badge variant="info" className="text-[10px] sm:text-xs">Live Updates</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} showDetails />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
