"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { StockQuote, MarketSummary, MarketIndex } from "@/lib/types";
import { stockService } from "@/services/stockService";

interface StockContextType {
  stocks: StockQuote[];
  marketSummary: MarketSummary | null;
  isLoading: boolean;
  error: string | null;
  getStockBySymbol: (symbol: string) => StockQuote | undefined;
  refreshStocks: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

interface StockProviderProps {
  children: ReactNode;
}

export function StockProvider({ children }: StockProviderProps) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMarketSummary = useCallback((stockList: StockQuote[]): MarketSummary => {
    if (!stockList || stockList.length === 0) {
      return {
        indices: [],
        topGainers: [],
        topLosers: [],
        mostActive: [],
        marketStatus: 'closed',
      };
    }

    const sortedByChange = [...stockList].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));

    // Static market indices (can be replaced with real API data later)
    const indices: MarketIndex[] = [
      {
        symbol: 'NIFTY50',
        name: 'Nifty 50',
        value: 22000,
        change: 0,
        changePercent: 0,
      },
      {
        symbol: 'SENSEX',
        name: 'Sensex',
        value: 73000,
        change: 0,
        changePercent: 0,
      },
      {
        symbol: 'BANKNIFTY',
        name: 'Bank Nifty',
        value: 48000,
        change: 0,
        changePercent: 0,
      },
    ];

    return {
      indices,
      topGainers: sortedByChange.filter(s => (s.changePercent || 0) > 0).slice(0, 5),
      topLosers: sortedByChange.filter(s => (s.changePercent || 0) < 0).slice(-5).reverse(),
      mostActive: [...stockList].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 5),
      marketStatus: 'open',
    };
  }, []);

  const fetchStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedStocks = await stockService.getAllStocks();
      setStocks(fetchedStocks);
      
      // Generate market summary from fetched stocks
      if (fetchedStocks && fetchedStocks.length > 0) {
        const summary = generateMarketSummary(fetchedStocks);
        setMarketSummary(summary);
      } else {
        setMarketSummary({
          indices: [],
          topGainers: [],
          topLosers: [],
          mostActive: [],
          marketStatus: 'closed',
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch stocks");
      setStocks([]);
      setMarketSummary({
        indices: [],
        topGainers: [],
        topLosers: [],
        mostActive: [],
        marketStatus: 'closed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateMarketSummary]);

  const getStockBySymbol = useCallback((symbol: string): StockQuote | undefined => {
    return stocks.find((stock) => stock.symbol.toUpperCase() === symbol.toUpperCase());
  }, [stocks]);

  const refreshStocks = useCallback(async () => {
    await fetchStocks();
  }, [fetchStocks]);

  // Fetch stocks on initial load only
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const value: StockContextType = {
    stocks,
    marketSummary,
    isLoading,
    error,
    getStockBySymbol,
    refreshStocks,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStocks(): StockContextType {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStocks must be used within a StockProvider");
  }
  return context;
}

export { StockContext };
