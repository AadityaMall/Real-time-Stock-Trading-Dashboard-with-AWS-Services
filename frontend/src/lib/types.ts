export interface User {
	username: string;
	balance: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    username: string;
    balance: number;
  };
}

export interface PortfolioResponse {
  username: string;
  cash_balance: number;
  total_invested: number;
  current_holdings_value: number;
  net_worth: number;
  holdings: Array<{
    symbol: string;
    quantity: number;
    avg_buy_price: number;
    live_price: number;
    invested_value: number;
    current_value: number;
    pnl: number;
  }>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  portfolio: Portfolio | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Stock & Market Data
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  description?: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface StockQuote extends Stock, StockPrice {
  // Combined stock info with current price
}

export interface MarketSummary {
  indices: MarketIndex[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  mostActive: StockQuote[];
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PriceHistory {
  symbol: string;
  data: PricePoint[];
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

// Portfolio & Trading
export interface Portfolio {
  userId: string;
  totalValue: number;
  cashBalance: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  symbol: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  lastUpdated: string;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface TradeOrder {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop';
  limitPrice?: number;
  stopPrice?: number;
}

// Chart & Visualization
export interface ChartData {
  labels: string[];
  prices: number[];
  volumes?: number[];
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal?: 'buy' | 'sell' | 'hold';
}

// API Response Patterns
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// UI State
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FilterState {
  search: string;
  sector?: string;
  sortBy: 'symbol' | 'price' | 'change' | 'volume';
  sortOrder: 'asc' | 'desc';
}
