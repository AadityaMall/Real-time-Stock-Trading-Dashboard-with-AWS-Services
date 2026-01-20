"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials } from "@/lib/types";

// Dummy user for development
const DUMMY_USER: User = {
  id: "user_001",
  name: "John Doe",
  email: "john.doe@example.com",
  mobileNumber: "+1234567890",
};

// Dummy credentials for login
const DUMMY_CREDENTIALS = {
  email: "john.doe@example.com",
  password: "password123",
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check localStorage for existing session
      const storedUser = localStorage.getItem("auth_user");
      const storedToken = localStorage.getItem("auth_token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Check against dummy credentials
        if (
          credentials.email === DUMMY_CREDENTIALS.email &&
          credentials.password === DUMMY_CREDENTIALS.password
        ) {
          // Generate a dummy token
          const dummyToken = `dummy_token_${Date.now()}`;

          // Store in localStorage
          localStorage.setItem("auth_user", JSON.stringify(DUMMY_USER));
          localStorage.setItem("auth_token", dummyToken);

          setUser(DUMMY_USER);
          setIsAuthenticated(true);
          return true;
        }

        // Invalid credentials
        return false;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export context for edge cases
export { AuthContext };
