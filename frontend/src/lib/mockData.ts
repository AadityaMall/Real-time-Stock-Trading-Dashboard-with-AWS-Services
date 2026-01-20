// Mock data utilities for development
import type {
  Stock,
  StockPrice,
  StockQuote,
  MarketSummary,
  MarketIndex,
  Portfolio,
  Holding,
  PriceHistory,
  PricePoint,
} from '@/lib/types';

// Sample stocks
const STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare' },
];

// Generate random price with realistic variation
function generatePrice(basePrice: number, volatility: number = 0.02): number {
  const change = (Math.random() - 0.5) * volatility * basePrice;
  return Math.max(0.01, basePrice + change);
}

// Base prices for stocks
const BASE_PRICES: Record<string, number> = {
  AAPL: 175.50,
  GOOGL: 142.30,
  MSFT: 378.85,
  AMZN: 151.20,
  TSLA: 248.50,
  META: 485.20,
  NVDA: 875.30,
  JPM: 195.40,
  V: 275.60,
  JNJ: 158.90,
};

// Generate mock stock price
export function generateStockPrice(symbol: string): StockPrice {
  const basePrice = BASE_PRICES[symbol] || 100;
  const currentPrice = generatePrice(basePrice);
  const previousClose = basePrice;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  const high = currentPrice * (1 + Math.random() * 0.03);
  const low = currentPrice * (1 - Math.random() * 0.03);
  const open = previousClose * (1 + (Math.random() - 0.5) * 0.01);
  const volume = Math.floor(Math.random() * 50000000 + 10000000);

  return {
    symbol,
    price: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume,
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    open: Number(open.toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

// Get stock quote (stock + price)
export function getStockQuote(symbol: string): StockQuote | null {
  const stock = STOCKS.find((s) => s.symbol === symbol);
  if (!stock) return null;

  const price = generateStockPrice(symbol);
  return { ...stock, ...price };
}

// Get all stock quotes
export function getAllStockQuotes(): StockQuote[] {
  return STOCKS.map((stock) => {
    const price = generateStockPrice(stock.symbol);
    return { ...stock, ...price };
  });
}

// Generate market summary
export function getMarketSummary(): MarketSummary {
  const quotes = getAllStockQuotes();
  const sortedByChange = [...quotes].sort((a, b) => b.changePercent - a.changePercent);

  const indices: MarketIndex[] = [
    {
      symbol: 'SPX',
      name: 'S&P 500',
      value: 5420.15,
      change: 12.45,
      changePercent: 0.23,
    },
    {
      symbol: 'DJI',
      name: 'Dow Jones',
      value: 39118.86,
      change: -45.32,
      changePercent: -0.12,
    },
    {
      symbol: 'IXIC',
      name: 'NASDAQ',
      value: 17688.20,
      change: 89.15,
      changePercent: 0.51,
    },
  ];

  return {
    indices,
    topGainers: sortedByChange.slice(0, 5),
    topLosers: sortedByChange.slice(-5).reverse(),
    mostActive: [...quotes].sort((a, b) => b.volume - a.volume).slice(0, 5),
    marketStatus: 'open',
  };
}

// Generate price history
export function generatePriceHistory(
  symbol: string,
  timeframe: PriceHistory['timeframe'] = '1D'
): PriceHistory {
  const basePrice = BASE_PRICES[symbol] || 100;
  const now = new Date();
  const data: PricePoint[] = [];

  let points = 100;
  let intervalMs = 60000; // 1 minute

  switch (timeframe) {
    case '1D':
      points = 390; // Trading minutes in a day
      intervalMs = 60000;
      break;
    case '1W':
      points = 35; // 5 days * 7 hours
      intervalMs = 3600000; // 1 hour
      break;
    case '1M':
      points = 30;
      intervalMs = 86400000; // 1 day
      break;
    case '3M':
      points = 90;
      intervalMs = 86400000;
      break;
    case '6M':
      points = 180;
      intervalMs = 86400000;
      break;
    case '1Y':
      points = 252; // Trading days
      intervalMs = 86400000;
      break;
    case '5Y':
      points = 1260; // 5 years of trading days
      intervalMs = 86400000;
      break;
  }

  let currentPrice = basePrice;
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    currentPrice = generatePrice(currentPrice, 0.015);
    const volume = Math.floor(Math.random() * 50000000 + 10000000);

    data.push({
      timestamp: timestamp.toISOString(),
      price: Number(currentPrice.toFixed(2)),
      volume,
    });
  }

  return {
    symbol,
    data,
    timeframe,
  };
}

// Generate mock portfolio
export function generateMockPortfolio(userId: string = 'user-1'): Portfolio {
  const holdings: Holding[] = [
    {
      symbol: 'AAPL',
      stockName: 'Apple Inc.',
      quantity: 10,
      averagePrice: 170.00,
      currentPrice: generateStockPrice('AAPL').price,
      totalCost: 1700.00,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      symbol: 'MSFT',
      stockName: 'Microsoft Corporation',
      quantity: 5,
      averagePrice: 375.00,
      currentPrice: generateStockPrice('MSFT').price,
      totalCost: 1875.00,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      symbol: 'NVDA',
      stockName: 'NVIDIA Corporation',
      quantity: 2,
      averagePrice: 850.00,
      currentPrice: generateStockPrice('NVDA').price,
      totalCost: 1700.00,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Calculate current values and P/L
  holdings.forEach((holding) => {
    holding.currentValue = holding.quantity * holding.currentPrice;
    holding.profitLoss = holding.currentValue - holding.totalCost;
    holding.profitLossPercent = (holding.profitLoss / holding.totalCost) * 100;
  });

  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent = (totalProfitLoss / totalInvested) * 100;
  const cashBalance = 10000.00;

  return {
    userId,
    totalValue: totalValue + cashBalance,
    cashBalance,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercent,
    holdings,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Simulate real-time price updates
export function subscribeToPriceUpdates(
  symbol: string,
  callback: (price: StockPrice) => void,
  interval: number = 2000
): () => void {
  const intervalId = setInterval(() => {
    const price = generateStockPrice(symbol);
    callback(price);
  }, interval);

  return () => clearInterval(intervalId);
}
