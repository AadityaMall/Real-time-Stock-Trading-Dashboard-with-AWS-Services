'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StockCard } from '@/components/features/StockCard';
import { MarketIndexCard } from '@/components/features/MarketIndexCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { formatRupee } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useStocks } from '@/context/StockContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, portfolio } = useAuth();
  const { stocks, marketSummary, isLoading: stocksLoading } = useStocks();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking auth or loading data
  if (authLoading || !isAuthenticated || stocksLoading) {
    return <Loading />;
  }

  if (!marketSummary || !portfolio || !stocks || stocks.length === 0) {
    return <Loading />;
  }

  const isPositive = (portfolio.totalProfitLoss || 0) >= 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* Hero / Feature Section */}
        <div className="relative mb-12 sm:mb-16 pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-75 h-75 bg-blue-400/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-62.5 h-62.5 bg-blue-300/5 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 -z-10 opacity-[0.02]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="text-center relative">
            {/* Accent line */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 sm:w-20 bg-linear-to-r from-transparent to-blue-400/50" />
              <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-400/70 font-medium">
                Welcome to the future
              </span>
              <div className="h-px w-12 sm:w-20 bg-linear-to-l from-transparent to-blue-400/50" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-linear-to-r from-white via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Trade
              </span>
              <span className="bg-linear-to-r from-blue-300 via-blue-400 to-blue-300 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            
            {/* Tagline */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light max-w-3xl mx-auto mb-4 leading-relaxed">
              Real-time insights.{' '}
              <span className="text-blue-400 font-normal">Smarter decisions.</span>
            </p>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Track markets, manage your portfolio, and stay ahead with lightning-fast live updates
            </p>
            
            {/* Stats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-gray-400">Live Markets</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-xs sm:text-sm text-gray-400">50+ Stocks</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-xs sm:text-sm text-gray-400">Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-6 sm:mb-8">
          <Card className="bg-transparent border-blue-500/20 shadow-xl">
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
            {marketSummary.indices && marketSummary.indices.length > 0 ? (
              marketSummary.indices.map((index) => (
                <MarketIndexCard key={index.symbol} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No market indices available
              </div>
            )}
          </div>
        </div>

        {/* Market Categories */}
        <div className="mb-8 sm:mb-10">
          <h2 className="mb-4 sm:mb-5 text-lg sm:text-xl font-bold text-white">Explore Markets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {[
              { name: 'IPO', icon: '🚀', description: 'Initial Public Offerings' },
              { name: 'F&O', icon: '📊', description: 'Futures & Options' },
              { name: 'ETFs', icon: '📈', description: 'Exchange Traded Funds' },
              { name: 'Mutual Funds', icon: '💼', description: 'Diversified Portfolios' },
              { name: 'Commodities', icon: '🥇', description: 'Gold, Silver & More' },
              { name: 'Bonds', icon: '📜', description: 'Fixed Income Securities' },
              { name: 'Crypto', icon: '₿', description: 'Digital Assets' },
              { name: 'Global', icon: '🌍', description: 'International Markets' },
            ].map((category) => (
              <button
                key={category.name}
                className="group flex flex-col items-center justify-center gap-2 px-4 py-5 sm:py-6 rounded-xl 
                           bg-white/5 border border-white/10 
                           hover:bg-blue-500/10 hover:border-blue-400/30 
                           transition-all duration-200 cursor-pointer"
                title={category.description}
              >
                <span className="text-2xl sm:text-3xl">{category.icon}</span>
                <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-medium transition-colors">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Top Gainers */}
          <div>
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">Top Gainers</h2>
              <Badge className="text-[10px] sm:text-xs">Live</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {marketSummary.topGainers && marketSummary.topGainers.length > 0 ? (
                marketSummary.topGainers.slice(0, 2).map((stock) => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-4">
                  No gainers available
                </div>
              )}
            </div>
            <Link href="/stocks" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Explore more <span className="text-xs">→</span>
            </Link>
          </div>

          {/* Top Losers */}
          <div>
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">Top Losers</h2>
              <Badge className="text-[10px] sm:text-xs">Live</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {marketSummary.topLosers && marketSummary.topLosers.length > 0 ? (
                marketSummary.topLosers.slice(0, 2).map((stock) => (
                  <StockCard key={stock.symbol} stock={stock} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-4">
                  No losers available
                </div>
              )}
            </div>
            <Link href="/stocks" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Explore more <span className="text-xs">→</span>
            </Link>
          </div>
        </div>

        {/* All Stocks */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">All Stocks</h2>
            <Badge  className="text-[10px] sm:text-xs">Live Updates</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stocks && stocks.length > 0 ? (
              stocks.slice(0, 4).map((stock) => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No stocks available
              </div>
            )}
          </div>
          <Link href="/stocks" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Explore more <span className="text-xs">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
