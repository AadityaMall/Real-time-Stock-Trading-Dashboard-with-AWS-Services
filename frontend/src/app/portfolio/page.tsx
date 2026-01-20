'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { formatRupee, formatPercent, formatLargeNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  generateMockPortfolio,
  subscribeToPriceUpdates,
  generatePriceHistory,
} from '@/lib/mockData';
import type { Portfolio, Holding, PriceHistory } from '@/lib/types';

// Mini sparkline component for holdings
function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data
    .map((price, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-20 h-8">
      <defs>
        <linearGradient id={`sparkGradient-${isPositive}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#sparkGradient-${isPositive})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
      />
    </svg>
  );
}

// Donut chart component for allocation
function AllocationChart({ holdings, totalValue }: { holdings: Holding[]; totalValue: number }) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  
  let currentAngle = 0;
  const segments = holdings.map((holding, index) => {
    const percentage = (holding.currentValue / totalValue) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (currentAngle - 90) * (Math.PI / 180);
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      symbol: holding.symbol,
      percentage,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            className="transition-all duration-300 hover:opacity-80"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="50" cy="50" r="25" fill="rgba(17, 24, 39, 0.9)" />
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-400 w-12">{segment.symbol}</span>
            <span className="text-white font-medium">{segment.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Transaction history mock data
const mockTransactions = [
  { id: '1', symbol: 'AAPL', type: 'buy' as const, quantity: 5, price: 172.50, date: '2026-01-18', time: '10:30 AM' },
  { id: '2', symbol: 'NVDA', type: 'buy' as const, quantity: 2, price: 865.00, date: '2026-01-15', time: '2:15 PM' },
  { id: '3', symbol: 'MSFT', type: 'sell' as const, quantity: 3, price: 382.20, date: '2026-01-12', time: '11:45 AM' },
  { id: '4', symbol: 'AAPL', type: 'buy' as const, quantity: 5, price: 168.00, date: '2026-01-10', time: '9:35 AM' },
  { id: '5', symbol: 'MSFT', type: 'buy' as const, quantity: 8, price: 371.50, date: '2026-01-05', time: '3:20 PM' },
];

export default function PortfolioPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<string, number[]>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'transactions'>('overview');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Initial load
    const mockPortfolio = generateMockPortfolio();
    setPortfolio(mockPortfolio);

    // Generate price histories for sparklines
    const histories: Record<string, number[]> = {};
    mockPortfolio.holdings.forEach((holding) => {
      const history = generatePriceHistory(holding.symbol, '1W');
      histories[holding.symbol] = history.data.map((p) => p.price);
    });
    setPriceHistories(histories);

    // Subscribe to price updates
    const unsubscribeFunctions = mockPortfolio.holdings.map((holding) =>
      subscribeToPriceUpdates(holding.symbol, (price) => {
        setPortfolio((prev) => {
          if (!prev) return prev;
          const updatedHoldings = prev.holdings.map((h) => {
            if (h.symbol === holding.symbol) {
              const newCurrentValue = h.quantity * price.price;
              const newProfitLoss = newCurrentValue - h.totalCost;
              return {
                ...h,
                currentPrice: price.price,
                currentValue: newCurrentValue,
                profitLoss: newProfitLoss,
                profitLossPercent: (newProfitLoss / h.totalCost) * 100,
              };
            }
            return h;
          });
          const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
          const totalHoldingsValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
          const totalProfitLoss = totalHoldingsValue - totalInvested;
          return {
            ...prev,
            holdings: updatedHoldings,
            totalValue: totalHoldingsValue + prev.cashBalance,
            totalProfitLoss,
            totalProfitLossPercent: (totalProfitLoss / totalInvested) * 100,
          };
        });
      }, 3000)
    );

    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub());
    };
  }, []);

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (!portfolio) return null;
    
    const bestPerformer = [...portfolio.holdings].sort((a, b) => b.profitLossPercent - a.profitLossPercent)[0];
    const worstPerformer = [...portfolio.holdings].sort((a, b) => a.profitLossPercent - b.profitLossPercent)[0];
    const totalGains = portfolio.holdings.filter(h => h.profitLoss > 0).reduce((sum, h) => sum + h.profitLoss, 0);
    const totalLosses = portfolio.holdings.filter(h => h.profitLoss < 0).reduce((sum, h) => sum + Math.abs(h.profitLoss), 0);
    
    return {
      bestPerformer,
      worstPerformer,
      totalGains,
      totalLosses,
      holdingsCount: portfolio.holdings.length,
      investedAmount: portfolio.totalInvested,
    };
  }, [portfolio]);

  // Show loading while checking auth or loading data
  if (authLoading || !isAuthenticated) {
    return <Loading />;
  }

  if (!portfolio || !metrics) {
    return <Loading />;
  }

  const isPositive = portfolio.totalProfitLoss >= 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* Hero Header */}
        <div className="relative mb-8 sm:mb-12 pt-8 sm:pt-12 pb-8 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-2xl animate-pulse" />
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 -z-10 opacity-[0.02]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
                  Dashboard
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-blue-400">Portfolio</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                My Portfolio
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">
                Track your investments and monitor real-time performance
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-gray-400">Live Updates</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-xs sm:text-sm text-gray-400">{metrics.holdingsCount} Holdings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Value Card */}
        <Card className="bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-950 border-blue-500/20 shadow-2xl mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Value */}
              <div className="lg:col-span-2">
                <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                    {formatRupee(portfolio.totalValue)}
                  </span>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isPositive ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  }`}>
                    <svg 
                      className={`w-4 h-4 ${isPositive ? 'text-emerald-400' : 'text-red-400 rotate-180'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(portfolio.totalProfitLossPercent)}
                    </span>
                  </div>
                </div>
                
                {/* Sub metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Invested</p>
                    <p className="text-sm sm:text-base font-semibold text-white">{formatRupee(portfolio.totalInvested)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Returns</p>
                    <p className={`text-sm sm:text-base font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{formatRupee(portfolio.totalProfitLoss)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Cash Balance</p>
                    <p className="text-sm sm:text-base font-semibold text-white">{formatRupee(portfolio.cashBalance)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Day&apos;s Change</p>
                    <p className="text-sm sm:text-base font-semibold text-emerald-400">+₹2,450.00</p>
                  </div>
                </div>
              </div>
              
              {/* Allocation Chart */}
              <div className="flex flex-col items-center lg:items-end justify-center">
                <p className="text-xs text-gray-500 mb-3">Asset Allocation</p>
                <AllocationChart holdings={portfolio.holdings} totalValue={portfolio.totalValue - portfolio.cashBalance} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Best Performer */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Best Performer</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">{metrics.bestPerformer.symbol}</span>
                <span className="text-emerald-400 font-semibold">{formatPercent(metrics.bestPerformer.profitLossPercent)}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Worst Performer */}
          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Worst Performer</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">{metrics.worstPerformer.symbol}</span>
                <span className="text-red-400 font-semibold">{formatPercent(metrics.worstPerformer.profitLossPercent)}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Gains */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Total Realized Gains</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-emerald-400">{formatRupee(metrics.totalGains)}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Holdings Count */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Active Holdings</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">{metrics.holdingsCount} Stocks</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit mb-6">
          {(['overview', 'holdings', 'transactions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Holdings Table */}
        {(activeTab === 'overview' || activeTab === 'holdings') && (
          <Card className="bg-transparent border-gray-800/50 shadow-xl overflow-hidden mb-6">
            <CardHeader className="border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Your Holdings</CardTitle>
                  <CardDescription className="text-gray-500">Real-time stock positions</CardDescription>
                </div>
                <Link 
                  href="/stocks" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  Explore Stocks
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="text-right py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Qty</th>
                      <th className="text-right py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                      <th className="text-right py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="text-center py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Trend</th>
                      <th className="text-right py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                      <th className="text-right py-4 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/30">
                    {portfolio.holdings.map((holding) => {
                      const isProfitable = holding.profitLoss >= 0;
                      return (
                        <tr 
                          key={holding.symbol} 
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-4 px-4 sm:px-6">
                            <Link href={`/stocks/${holding.symbol}`} className="flex items-center gap-3">
                              <div className={`w-1 h-10 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <div>
                                <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {holding.symbol}
                                </div>
                                <div className="text-xs text-gray-500">{holding.stockName}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right text-white hidden sm:table-cell">
                            {holding.quantity}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right text-gray-400">
                            {formatRupee(holding.averagePrice)}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <span className="text-white font-medium">{formatRupee(holding.currentPrice)}</span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                            <div className="flex justify-center">
                              {priceHistories[holding.symbol] && (
                                <MiniSparkline 
                                  data={priceHistories[holding.symbol]} 
                                  isPositive={isProfitable}
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className={`flex flex-col items-end ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                              <span className="font-semibold">
                                {isProfitable ? '+' : ''}{formatRupee(holding.profitLoss)}
                              </span>
                              <span className="text-xs">
                                {formatPercent(holding.profitLossPercent)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right hidden md:table-cell">
                            <span className="text-white font-semibold">{formatRupee(holding.currentValue)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        {(activeTab === 'overview' || activeTab === 'transactions') && (
          <Card className="bg-transparent border-gray-800/50 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Recent Transactions</CardTitle>
                  <CardDescription className="text-gray-500">Your latest trading activity</CardDescription>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  View All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-800/30">
                {mockTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between py-4 px-4 sm:px-6 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'buy' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {transaction.type === 'buy' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 16l-4-4m4 4l4-4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{transaction.symbol}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${
                              transaction.type === 'buy' 
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                                : 'border-red-500/30 text-red-400 bg-red-500/10'
                            }`}
                          >
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.quantity} shares @ {formatRupee(transaction.price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${transaction.type === 'buy' ? 'text-white' : 'text-emerald-400'}`}>
                        {transaction.type === 'buy' ? '-' : '+'}{formatRupee(transaction.quantity * transaction.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/stocks"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buy Stocks
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200 border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200 border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}