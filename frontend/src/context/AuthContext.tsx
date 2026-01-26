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
      console.log(portfolioData);
      const transformedPortfolio: Portfolio = {
        userId: portfolioData.username,
        totalValue: portfolioData.net_worth,
        cashBalance: portfolioData.cash_balance,
        totalInvested: portfolioData.total_invested,
        totalProfitLoss: portfolioData.net_worth - portfolioData.total_invested - portfolioData.cash_balance,
        totalProfitLossPercent: portfolioData.total_invested > 0
          ? ((portfolioData.current_holdings_value - portfolioData.total_invested) / portfolioData.total_invested) * 100
          : 0,
        holdings: portfolioData.holdings.map((holding) => ({
          symbol: holding.symbol,
          stockName: holding.symbol,
          quantity: holding.quantity,
          averagePrice: holding.avg_buy_price,
          currentPrice: holding.live_price,
          totalCost: holding.invested_value,
          currentValue: holding.current_value,
          profitLoss: holding.pnl,
          profitLossPercent: holding.invested_value > 0
            ? (holding.pnl / holding.invested_value) * 100
            : 0,
          lastUpdated: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log(transformedPortfolio);
      setPortfolio(transformedPortfolio);
    } catch (error: any) {
      console.error("Failed to fetch portfolio:", error);
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
      console.error("Failed to load user:", error);
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
        console.error("Login failed:", error);
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
          console.error("Portfolio fetch after registration failed:", portfolioError);
        }
        return true;
      } catch (error: any) {
        console.error("Registration failed:", error);
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
      console.error("Logout failed:", error);
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