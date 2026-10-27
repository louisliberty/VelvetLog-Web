import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { type User as SelectUser, type InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  refreshUser: () => Promise<void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('velvetlog_token');
        const userData = localStorage.getItem('velvetlog_user');
        
        if (token && userData) {
          // Verify the token is still valid with the server
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            const serverUser = data.user || data;
            setUser(serverUser);
            // Update local storage with fresh user data
            localStorage.setItem('velvetlog_user', JSON.stringify(serverUser));
          } else {
            // Token is invalid or expired, clear auth data
            console.log('Token validation failed, clearing auth data');
            localStorage.removeItem('velvetlog_token');
            localStorage.removeItem('velvetlog_user');
            localStorage.removeItem('velvetlog_onboarding_complete');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('velvetlog_token');
        localStorage.removeItem('velvetlog_user');
        localStorage.removeItem('velvetlog_onboarding_complete');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (data: { user: SelectUser; token: string }) => {
      console.log("✅ Login successful, setting user:", data.user);
      setUser(data.user);
      localStorage.setItem('velvetlog_user', JSON.stringify(data.user));
      localStorage.setItem('velvetlog_token', data.token);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("🔧 Frontend sending registration data:", credentials);
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      console.log("🔧 Registration response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("🔧 Registration error response:", errorData);
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    onSuccess: (data: { user: SelectUser; token: string }) => {
      console.log("✅ Registration successful, setting user:", data.user);
      setUser(data.user);
      localStorage.setItem('velvetlog_user', JSON.stringify(data.user));
      localStorage.setItem('velvetlog_token', data.token);
    },
    onError: (error: Error) => {
      console.error("❌ Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('velvetlog_user');
      localStorage.removeItem('velvetlog_token');
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      if (!token) return;
      
      const res = await apiRequest("GET", "/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('velvetlog_user', JSON.stringify(data.user));
        console.log("✅ User data refreshed from server:", data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    loginMutation,
    logoutMutation,
    registerMutation,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}