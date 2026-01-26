const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface TradeRequest {
  symbol: string;
  quantity: number;
}

export interface TradeResponse {
  message: string;
  trade?: {
    username: string;
    symbol: string;
    qty: number;
    price: number;
    type: string;
    timestamp: string;
  };
  symbol?: string;
  quantity?: number;
  price?: number;
  total_cost?: number;
  cash_balance?: number;
  [key: string]: any;
}

export const tradingService = {
  /**
   * Buy stocks
   */
  async buyStock(symbol: string, quantity: number): Promise<TradeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/trade/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbol, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to buy stock');
      }

      const result = await response.json();
      if (!result) {
        throw new Error('Invalid response from server');
      }
      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to buy stock');
    }
  },

  /**
   * Sell stocks
   */
  async sellStock(symbol: string, quantity: number): Promise<TradeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/trade/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbol, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to sell stock');
      }

      const result = await response.json();
      if (!result) {
        throw new Error('Invalid response from server');
      }
      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to sell stock');
    }
  },
};
