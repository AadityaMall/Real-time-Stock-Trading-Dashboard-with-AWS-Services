'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PriceChart } from '@/components/features/PriceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { formatRupee } from '@/lib/utils';
import { useStocks } from '@/context/StockContext';
import { useAuth } from '@/context/AuthContext';
import { tradingService } from '@/services/tradingService';
import type { StockQuote, PriceHistory, PricePoint } from '@/lib/types';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string;
  const { getStockBySymbol } = useStocks();
  const { refreshPortfolio, portfolio } = useAuth();

  const [timeframe, setTimeframe] = useState<PriceHistory['timeframe']>('1D');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stock = useMemo(() => {
    if (!symbol) return null;
    return getStockBySymbol(symbol);
  }, [symbol, getStockBySymbol]);

  // Generate simple price history based on current price
  const priceHistory = useMemo<PriceHistory | null>(() => {
    if (!stock || stock.price === undefined) return null;

    const points = timeframe === '1D' ? 100 : timeframe === '1W' ? 35 : timeframe === '1M' ? 30 : 100;
    const data: PricePoint[] = [];
    const now = new Date();
    let currentPrice = stock.price || 0;
    const isPositive = (stock.changePercent || 0) >= 0;
    const variation = (stock.price || 0) * 0.1; // 10% variation

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute intervals
      const trend = isPositive ? 1 : -1;
      const randomVariation = (Math.random() - 0.5) * variation;
      currentPrice = (stock.price || 0) + (trend * (points - i) / points * variation * 0.3) + randomVariation;
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: Math.max(0, currentPrice),
        volume: Math.floor(Math.random() * 50000000 + 10000000),
      });
    }

    return {
      symbol: stock.symbol,
      data,
      timeframe,
    };
  }, [stock, timeframe]);

  useEffect(() => {
    if (!symbol || !stock) {
      router.push('/stocks');
    }
  }, [symbol, stock, router]);

  const handleTrade = async () => {
    if (!stock || !quantity || parseFloat(quantity) <= 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const qty = parseInt(quantity, 10);
      
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      // Check if user has enough cash for buy orders
      if (orderType === 'buy' && portfolio && stock.price) {
        const totalCost = qty * stock.price;
        if (totalCost > (portfolio.cashBalance || 0)) {
          throw new Error(`Insufficient funds. You need ${formatRupee(totalCost)} but only have ${formatRupee(portfolio.cashBalance || 0)}`);
        }
      }

      // Check if user has enough shares for sell orders
      if (orderType === 'sell' && portfolio) {
        const holding = portfolio.holdings?.find(h => h.symbol === stock.symbol);
        if (!holding || (holding.quantity || 0) < qty) {
          throw new Error(`Insufficient shares. You only have ${holding?.quantity || 0} shares of ${stock.symbol}`);
        }
      }

      // Execute the trade
      const result = orderType === 'buy' 
        ? await tradingService.buyStock(stock.symbol, qty)
        : await tradingService.sellStock(stock.symbol, qty);

      // Refresh portfolio after successful trade
      await refreshPortfolio();

      // Show success message
      const tradePrice = result.trade?.price || result.price || stock.price || 0;
      setSuccess(
        `Successfully ${orderType === 'buy' ? 'bought' : 'sold'} ${qty} shares of ${stock.symbol} at ${formatRupee(tradePrice)} per share`
      );
      
      // Clear quantity input
      setQuantity('');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to ${orderType} stock. Please try again.`;
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stock || !priceHistory) {
    return <Loading />;
  }

  const isPositive = (stock.changePercent || 0) >= 0;
  const totalCost = parseFloat(quantity || '0') * (stock.price || 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute top-20 right-1/4 w-96 h-96 ${isPositive ? 'bg-green-500/8' : 'bg-red-500/8'} rounded-full blur-3xl transition-colors duration-1000`} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className={`absolute top-1/2 right-1/3 w-64 h-64 ${isPositive ? 'bg-emerald-400/5' : 'bg-rose-400/5'} rounded-full blur-2xl animate-pulse`} />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="group mb-4 sm:mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-200">
              ←
            </span>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Stock Hero Section */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-linear-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
            {/* Glow effect based on stock performance */}
            <div className={`absolute inset-0 rounded-2xl ${isPositive ? 'bg-green-500/5' : 'bg-red-500/5'} blur-xl -z-10`} />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                {/* Stock Icon */}
                <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${isPositive ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border backdrop-blur-sm`}>
                  <span className="text-2xl sm:text-3xl font-black text-white">{stock.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {stock.symbol}
                    </h1>
                    <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border px-3 py-1`}>
                      {stock.exchange}
                    </Badge>
                  </div>
                  <p className="text-base sm:text-lg text-gray-400">{stock.name}</p>
                  
                  {/* Live indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:text-right">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 tabular-nums">
                  {formatRupee(stock.price)}
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-lg sm:text-xl font-bold ${
                    isPositive 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isPositive ? '↑' : '↓'}
                  </span>
                  <span>{isPositive ? '+' : ''}{formatRupee(stock.change || 0)}</span>
                  <span className="text-base opacity-80">({isPositive ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-white mb-1">Price Chart</CardTitle>
                    <p className="text-sm text-gray-500">Historical price movement</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-gray-900/50 border border-white/5">
                    {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`
                          rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300
                          ${
                            timeframe === tf
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {priceHistory && <PriceChart data={priceHistory} height={350} />}
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Open', value: formatRupee(stock.open || 0), color: 'text-white', icon: '○' },
                { label: 'High', value: formatRupee(stock.high || 0), color: 'text-green-400', icon: '↑' },
                { label: 'Low', value: formatRupee(stock.low || 0), color: 'text-red-400', icon: '↓' },
                { label: 'Volume', value: `${((stock.volume || 0) / 1000000).toFixed(2)}M`, color: 'text-blue-400', icon: '◈' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="group relative p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 text-center overflow-hidden"
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-blue-500/5 to-transparent" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <span className={`text-xs ${metric.color} opacity-60`}>{metric.icon}</span>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{metric.label}</span>
                    </div>
                    <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${metric.color} tabular-nums`}>
                      {metric.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Stats */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-lg text-white">Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Day Range</p>
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-linear-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-900 shadow-lg"
                        style={{ 
                          left: `${Math.min(100, Math.max(0, stock.high && stock.low && stock.high !== stock.low 
                            ? (((stock.price || 0) - stock.low) / (stock.high - stock.low)) * 100 
                            : 50))}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatRupee(stock.low)}</span>
                      <span>{formatRupee(stock.high)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prev Close</p>
                    <p className="text-lg font-semibold text-white">{formatRupee((stock.price || 0) - (stock.change || 0))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Cap</p>
                    <p className="text-lg font-semibold text-white">₹{(((stock.price || 0) * (stock.volume || 0)) / 10000000000).toFixed(2)}B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card className="bg-white/[0.02] border-white/10 backdrop-blur-sm overflow-hidden">
                {/* Header with gradient */}
                <div className={`px-6 py-4 ${orderType === 'buy' ? 'bg-linear-to-r from-green-500/10 to-transparent' : 'bg-linear-to-r from-red-500/10 to-transparent'} border-b border-white/5`}>
                  <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${orderType === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {orderType === 'buy' ? '↗' : '↘'}
                    </span>
                    Place Order
                  </CardTitle>
                </div>
                
                <CardContent className="pt-6">
                  {/* Order Type Toggle */}
                  <div className="mb-6 p-1 flex gap-1 rounded-xl bg-gray-900/50 border border-white/5">
                    <button
                      onClick={() => setOrderType('buy')}
                      className={`
                        flex-1 rounded-lg py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                        ${
                          orderType === 'buy'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <span>↗</span> Buy
                    </button>
                    <button
                      onClick={() => setOrderType('sell')}
                      className={`
                        flex-1 rounded-lg py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                        ${
                          orderType === 'sell'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <span>↘</span> Sell
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Quantity Input */}
                    <div>
                      <label className="mb-2 block text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Quantity
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Enter shares"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          min="1"
                          step="1"
                          className="text-lg font-semibold bg-gray-900/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300 pr-16 text-white"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">shares</span>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div>
                      <label className="mb-2 block text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Price per share
                      </label>
                      <div className="relative p-4 rounded-xl bg-gray-900/50 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white">{formatRupee(stock.price)}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-gray-500">Market Price</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Total */}
                    <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm text-gray-400">Estimated Total</span>
                        <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                          {formatRupee(totalCost)}
                        </span>
                      </div>
                      {quantity && parseFloat(quantity) > 0 && (
                        <p className="text-xs text-gray-500">
                          {quantity} share{parseFloat(quantity) > 1 ? 's' : ''} × {formatRupee(stock.price)}
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {success && (
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-green-400">{success}</p>
                        </div>
                      </div>
                    )}

                    {/* Trade Button */}
                    <Button
                      className={`w-full py-6 text-base font-bold transition-all duration-300 ${
                        orderType === 'buy'
                          ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-600/30'
                          : 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/30'
                      }`}
                      onClick={handleTrade}
                      disabled={!quantity || parseFloat(quantity) <= 0 || isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {orderType === 'buy' ? '↗' : '↘'} {orderType === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="space-y-1.5 text-[10px] sm:text-xs text-gray-500">
                      <p className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        Market orders execute at current price
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        Virtual trading for demo purposes only
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="bg-white/[0.02] border-white/10 backdrop-blur-sm">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">52W Range</span>
                    <span className="text-sm font-semibold text-white">
                      {formatRupee((stock.low || 0) * 0.7)} - {formatRupee((stock.high || 0) * 1.3)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
