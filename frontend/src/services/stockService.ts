const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

import type { StockQuote, StockPrice } from '@/lib/types';

// Fixed list of popular Indian stocks (managed on frontend)
export const FIXED_STOCKS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'HINDUNILVR',
  'ICICIBANK',
  'SBIN',
  'BHARTIARTL',
  'ITC',
  'KOTAKBANK',
  'LT',
  'AXISBANK',
  'HCLTECH',
  'ASIANPAINT',
  'MARUTI',
  'WIPRO',
  'BAJFINANCE',
  'ULTRACEMCO',
  'NESTLEIND',
  'TITAN',
];

// Stock metadata (name, exchange, sector) - can be extended
const STOCK_METADATA: Record<string, { name: string; exchange: string; sector?: string }> = {
  RELIANCE: { name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Oil & Gas' },
  TCS: { name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Technology' },
  HDFCBANK: { name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Financial Services' },
  INFY: { name: 'Infosys Ltd', exchange: 'NSE', sector: 'Technology' },
  HINDUNILVR: { name: 'Hindustan Unilever Ltd', exchange: 'NSE', sector: 'Consumer Goods' },
  ICICIBANK: { name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Financial Services' },
  SBIN: { name: 'State Bank of India', exchange: 'NSE', sector: 'Financial Services' },
  BHARTIARTL: { name: 'Bharti Airtel Ltd', exchange: 'NSE', sector: 'Telecommunications' },
  ITC: { name: 'ITC Ltd', exchange: 'NSE', sector: 'Consumer Goods' },
  KOTAKBANK: { name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Financial Services' },
  LT: { name: 'Larsen & Toubro Ltd', exchange: 'NSE', sector: 'Engineering' },
  AXISBANK: { name: 'Axis Bank Ltd', exchange: 'NSE', sector: 'Financial Services' },
  HCLTECH: { name: 'HCL Technologies Ltd', exchange: 'NSE', sector: 'Technology' },
  ASIANPAINT: { name: 'Asian Paints Ltd', exchange: 'NSE', sector: 'Consumer Goods' },
  MARUTI: { name: 'Maruti Suzuki India Ltd', exchange: 'NSE', sector: 'Automotive' },
  WIPRO: { name: 'Wipro Ltd', exchange: 'NSE', sector: 'Technology' },
  BAJFINANCE: { name: 'Bajaj Finance Ltd', exchange: 'NSE', sector: 'Financial Services' },
  ULTRACEMCO: { name: 'UltraTech Cement Ltd', exchange: 'NSE', sector: 'Construction Materials' },
  NESTLEIND: { name: 'Nestle India Ltd', exchange: 'NSE', sector: 'Consumer Goods' },
  TITAN: { name: 'Titan Company Ltd', exchange: 'NSE', sector: 'Consumer Goods' },
};

// Backend response type
interface BackendStockResponse {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  volume: number;
  market_cap?: number;
  currency: string;
  timestamp: string;
}

// Transform backend response to frontend StockQuote format
function transformStockData(backendData: BackendStockResponse): StockQuote | null {
  if (!backendData || !backendData.symbol || backendData.price === undefined) {
    return null;
  }

  const price = backendData.price || 0;
  const previousClose = backendData.previous_close || price;
  const change = price - previousClose;
  const changePercent = previousClose > 0 ? ((change / previousClose) * 100) : 0;

  const metadata = STOCK_METADATA[backendData.symbol] || {
    name: backendData.symbol,
    exchange: 'NSE',
    sector: undefined,
  };

  return {
    symbol: backendData.symbol.toUpperCase(),
    name: metadata.name,
    exchange: metadata.exchange,
    sector: metadata.sector,
    price: price,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: backendData.volume || 0,
    high: backendData.high || price,
    low: backendData.low || price,
    open: backendData.open || price,
    previousClose: previousClose,
    timestamp: backendData.timestamp || new Date().toISOString(),
  };
}

export const stockService = {
  /**
   * Fetch all fixed stocks from backend
   */
  async getAllStocks(): Promise<StockQuote[]> {
    try {
      // Use the existing /market/prices endpoint with fixed stocks list
      const response = await fetch(`${API_BASE_URL}/market/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbols: FIXED_STOCKS }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stocks');
      }

      const data: BackendStockResponse[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      return data.map(transformStockData).filter(Boolean);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch stocks');
    }
  },

  /**
   * Fetch single stock price
   */
  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      const response = await fetch(`${API_BASE_URL}/market/price/${symbol}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stock price');
      }

      const data: BackendStockResponse = await response.json();
      const quote = transformStockData(data);
      
      return {
        symbol: quote.symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changePercent || 0,
        volume: quote.volume || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        open: quote.open || 0,
        previousClose: quote.previousClose || 0,
        timestamp: quote.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(`Failed to fetch stock price for ${symbol}`);
    }
  },

  /**
   * Fetch multiple stock prices
   */
  async getMultipleStockPrices(symbols: string[]): Promise<StockQuote[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/market/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stock prices');
      }

      const data: BackendStockResponse[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      return data.map(transformStockData).filter(Boolean);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch stock prices');
    }
  },
};
