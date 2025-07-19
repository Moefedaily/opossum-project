// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { authService } from "../services/auth";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthContextType,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication state on app startup
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);

      // STEP 1: Get stored data first (no network calls)
      console.log("🔐 Checking stored auth data...");
      const storedAuthData = await authService.getStoredAuthData();

      if (storedAuthData.user && storedAuthData.accessToken) {
        console.log(
          "🔐 Found stored auth data for:",
          storedAuthData.user.username
        );
        setUser(storedAuthData.user);
        setAccessToken(storedAuthData.accessToken);

        // STEP 2: Try to validate with backend (optional, fail silently)
        try {
          console.log("🔐 Validating with backend...");
          const validatedAuthData = await authService.checkAuthState();

          if (validatedAuthData.user && validatedAuthData.accessToken) {
            console.log("🔐 Backend validation successful");
            setUser(validatedAuthData.user);
            setAccessToken(validatedAuthData.accessToken);
          }
        } catch (networkError) {
          console.log(
            "🔐 Backend validation failed (network issue), using stored data:",
            networkError
          );
          // Continue with stored data - this is fine for offline use
        }
      } else {
        console.log("🔐 No valid stored auth data found");
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.log("🔐 Auth state check failed:", error);
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DEFINE login function
  const login = async (loginData: LoginRequest) => {
    try {
      setIsLoading(true);

      console.log("🔐 Starting login...");
      const response = await authService.login(loginData);

      setUser(response.user);
      setAccessToken(response.accessToken);

      Toast.show({
        type: "success",
        text1: "Welcome back! 👋",
        text2: `Hello ${response.user.firstName || response.user.username}!`,
      });

      return response; // Return for navigation
    } catch (error: any) {
      console.error("🔐 Login failed:", error);

      // Show specific error messages
      let errorMessage = error.message || "Please check your credentials";

      // Check for network errors
      if (
        error.message?.includes("Network error") ||
        error.message?.includes("timeout")
      ) {
        errorMessage = "Network error - please check your connection";
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DEFINE register function
  const register = async (registerData: RegisterRequest) => {
    try {
      setIsLoading(true);

      const response = await authService.register(registerData);

      // Show success message with email verification instructions
      Toast.show({
        type: "success",
        text1: "Registration Successful! 🎉",
        text2: "Please check your email for verification",
        visibilityTime: 5000, // Show longer for important message
      });

      // Don't set user - they need to verify email first
      return response;
    } catch (error: any) {
      let errorMessage = error.message || "Registration failed";

      // Handle specific registration errors
      if (errorMessage.includes("username")) {
        errorMessage = "Username already exists";
      } else if (errorMessage.includes("email")) {
        errorMessage = "Email already registered";
      }

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DEFINE logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      await authService.logout();

      setUser(null);
      setAccessToken(null);

      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "See you next time! 👋",
      });
    } catch (error) {
      console.log("Logout error:", error);
      // Even if logout fails on backend, clear local state
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DEFINE resendVerification function
  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);

      await authService.resendVerification(email);

      Toast.show({
        type: "success",
        text1: "Verification Email Sent",
        text2: "Please check your inbox",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Send Email",
        text2: error.message || "Please try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NOW the value object can use these functions
  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
