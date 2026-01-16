'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PriceChart } from '@/components/features/PriceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { formatRupee } from '@/lib/utils';
import {
  getStockQuote,
  generatePriceHistory,
  subscribeToPriceUpdates,
} from '@/lib/mockData';
import type { StockQuote, PriceHistory, StockPrice } from '@/types';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string;

  const [stock, setStock] = useState<StockQuote | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [timeframe, setTimeframe] = useState<PriceHistory['timeframe']>('1D');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const stockQuote = getStockQuote(symbol);
    if (!stockQuote) {
      router.push('/dashboard');
      return;
    }

    setStock(stockQuote);
    setPriceHistory(generatePriceHistory(symbol, timeframe));

    // Subscribe to real-time price updates
    const unsubscribe = subscribeToPriceUpdates(symbol, (price: StockPrice) => {
      setStock((prev) => (prev ? { ...prev, ...price } : null));
    }, 2000);

    return () => unsubscribe();
  }, [symbol, timeframe, router]);

  useEffect(() => {
    if (symbol) {
      const history = generatePriceHistory(symbol, timeframe);
      setPriceHistory(history);
    }
  }, [timeframe, symbol]);

  const handleTrade = async () => {
    if (!stock || !quantity || parseFloat(quantity) <= 0) return;

    setIsLoading(true);
    // Simulate trade execution
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed for ${quantity} shares of ${stock.symbol}`);
    setIsLoading(false);
    setQuantity('');
  };

  if (!stock || !priceHistory) {
    return <Loading />;
  }

  const isPositive = stock.changePercent >= 0;
  const totalCost = parseFloat(quantity) * stock.price || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            ← Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stock.symbol}</h1>
                <Badge variant="info" className="text-xs sm:text-sm">{stock.exchange}</Badge>
              </div>
              <p className="mt-1 text-sm sm:text-base text-gray-400">{stock.name}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {formatRupee(stock.price)}
              </div>
              <div
                className={`text-base sm:text-lg font-semibold flex items-center gap-1 ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{isPositive ? '+' : ''}{formatRupee(stock.change)}</span>
                <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg">Price Chart</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`
                          rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200
                          ${
                            timeframe === tf
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                          }
                        `}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {priceHistory && <PriceChart data={priceHistory} height={300} />}
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Open</div>
                <div className="text-base sm:text-lg font-semibold text-white">
                  {formatRupee(stock.open)}
                </div>
              </Card>
              <Card className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">High</div>
                <div className="text-base sm:text-lg font-semibold text-green-400">
                  {formatRupee(stock.high)}
                </div>
              </Card>
              <Card className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Low</div>
                <div className="text-base sm:text-lg font-semibold text-red-400">
                  {formatRupee(stock.low)}
                </div>
              </Card>
              <Card className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Volume</div>
                <div className="text-base sm:text-lg font-semibold text-white">
                  {(stock.volume / 1000000).toFixed(2)}M
                </div>
              </Card>
            </div>
          </div>

          {/* Trading Panel */}
          <div>
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Place Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={`
                      flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200
                      ${
                        orderType === 'buy'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={`
                      flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200
                      ${
                        orderType === 'sell'
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-300">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      step="1"
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs sm:text-sm font-medium text-gray-300">
                      Price per share
                    </label>
                    <Input
                      type="text"
                      value={formatRupee(stock.price)}
                      disabled
                      className="bg-gray-800 text-sm sm:text-base"
                    />
                  </div>

                  <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-400">Estimated Total</span>
                      <span className="text-base sm:text-lg font-semibold text-white">
                        {formatRupee(totalCost)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={orderType === 'buy' ? 'primary' : 'danger'}
                    className="w-full text-sm sm:text-base"
                    onClick={handleTrade}
                    isLoading={isLoading}
                    disabled={!quantity || parseFloat(quantity) <= 0}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
                  </Button>
                </div>

                <div className="mt-6 space-y-1.5 text-[10px] sm:text-xs text-gray-500">
                  <p>• Market orders execute immediately</p>
                  <p>• All trades are virtual for demo purposes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
