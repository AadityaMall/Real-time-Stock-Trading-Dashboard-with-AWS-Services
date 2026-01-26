"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials, Portfolio } from "@/lib/types";
import { authService } from "@/services/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const portfolioData = await authService.getPortfolio();
      if (!portfolioData) {
        throw new Error("No portfolio data received");
      }
      
      const transformedPortfolio: Portfolio = {
        userId: portfolioData.username || "",
        totalValue: portfolioData.net_worth || 0,
        cashBalance: portfolioData.cash_balance || 0,
        totalInvested: portfolioData.total_invested || 0,
        totalProfitLoss: (portfolioData.net_worth || 0) - (portfolioData.total_invested || 0) - (portfolioData.cash_balance || 0),
        totalProfitLossPercent: (portfolioData.total_invested || 0) > 0
          ? (((portfolioData.current_holdings_value || 0) - (portfolioData.total_invested || 0)) / (portfolioData.total_invested || 0)) * 100
          : 0,
        holdings: (portfolioData.holdings || []).map((holding) => ({
          symbol: holding.symbol || "",
          stockName: holding.symbol || "",
          quantity: holding.quantity || 0,
          averagePrice: holding.avg_buy_price || 0,
          currentPrice: holding.live_price || 0,
          totalCost: holding.invested_value || 0,
          currentValue: holding.current_value || 0,
          profitLoss: holding.pnl || 0,
          profitLossPercent: (holding.invested_value || 0) > 0
            ? ((holding.pnl || 0) / (holding.invested_value || 0)) * 100
            : 0,
          lastUpdated: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPortfolio(transformedPortfolio);
    } catch (error: any) {
      // Silently handle error and set empty portfolio
      const emptyPortfolio: Portfolio = {
        userId: "",
        totalValue: 0,
        cashBalance: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        holdings: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPortfolio(emptyPortfolio);
    }
  }, []);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const verified = await authService.verify();
      if (verified) {
        const userData: User = {
          username: verified.username,
          balance: 0,
        };
        setUser(userData);
        setIsAuthenticated(true);
        await fetchPortfolio();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setPortfolio(null);
      }
    } catch (error) {
      // Silently handle error - user not authenticated
      setUser(null);
      setIsAuthenticated(false);
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPortfolio]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      try {
        const response = await authService.login(credentials);
        const userData: User = {
          username: response.user.username,
          balance: response.user.balance,
        };
        setUser(userData);
        setIsAuthenticated(true);
        await fetchPortfolio();
        return true;
      } catch (error) {
        // Return false on login failure
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPortfolio]
  );

  const register = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      try {
        const response = await authService.register(credentials);
        const userData: User = {
          username: response.user.username,
          balance: response.user.balance,
        };
        setUser(userData);
        setIsAuthenticated(true);
        try {
          await fetchPortfolio();
        } catch (portfolioError) {
          // Portfolio fetch failed but registration succeeded
        }
        return true;
      } catch (error: any) {
        // Return false on registration failure
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPortfolio]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Silently handle logout error - still clear local state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPortfolio(null);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    if (isAuthenticated) {
      await fetchPortfolio();
    }
  }, [isAuthenticated, fetchPortfolio]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    portfolio,
    login,
    register,
    logout,
    loadUser,
    refreshPortfolio,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };