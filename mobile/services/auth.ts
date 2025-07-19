// services/auth.ts
import api, { handleApiError } from "./api";
import { storage } from "../utils/storage";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/auth";
import { ApiError } from "../types/api";

export const authService = {
  // Register new user
  register: async (
    data: RegisterRequest
  ): Promise<{ message: string; email: string }> => {
    try {
      const response = await api.post("/api/auth/register", data);

      // Your backend returns: { message: "Registration successful! Please check your email...", email: "..." }
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", data);
      console.log("Login response:", response.data);

      const { accessToken, refreshToken, user, expiresIn } = response.data;

      // Save to secure storage
      await storage.saveAuthData(accessToken, refreshToken, user, expiresIn);

      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);

      // Handle specific login errors
      if (error.response?.status === 401) {
        throw new Error("Invalid username or password");
      }

      // Check if it's email verification error
      if (
        apiError.error.includes("verify") ||
        apiError.error.includes("verification")
      ) {
        throw new Error("Please verify your email before logging in");
      }

      throw new Error(apiError.error);
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Call backend logout (invalidates token)
      await api.post("/api/auth/logout");
    } catch (error) {
      // Even if backend call fails, we still clear local storage
      console.log("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      await storage.clearAuthData();
    }
  },

  // Get current user (for app startup auth check)
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>("/api/auth/me");
      return response.data;
    } catch (error) {
      // If this fails, user needs to login again
      await storage.clearAuthData();
      return null;
    }
  },

  // NEW: Get stored auth data without network calls (for offline app startup)
  getStoredAuthData: async (): Promise<{
    user: User | null;
    accessToken: string | null;
  }> => {
    try {
      console.log("🔐 Getting stored auth data...");
      const authData = await storage.getAuthData();

      if (!authData) {
        console.log("🔐 No stored auth data found");
        return { user: null, accessToken: null };
      }

      // Check if token is expired (locally, no network call)
      const isExpired = await storage.isTokenExpired();

      if (isExpired) {
        console.log("🔐 Stored token is expired, clearing data");
        // Token expired, clear data and let user login again
        await storage.clearAuthData();
        return { user: null, accessToken: null };
      }

      console.log(
        "🔐 Found valid stored auth data for:",
        authData.user?.username
      );
      // Return stored data (we'll validate with network later if possible)
      return {
        user: authData.user,
        accessToken: authData.accessToken,
      };
    } catch (error) {
      console.log("🔐 Error getting stored auth data:", error);
      return { user: null, accessToken: null };
    }
  },

  // Check auth state with network validation (for when network is available)
  checkAuthState: async (): Promise<{
    user: User | null;
    accessToken: string | null;
  }> => {
    try {
      console.log("🔐 Checking auth state with network validation...");
      const authData = await storage.getAuthData();

      if (!authData) {
        console.log("🔐 No auth data for network validation");
        return { user: null, accessToken: null };
      }

      // Check if token is expired
      const isExpired = await storage.isTokenExpired();

      if (isExpired) {
        console.log("🔐 Token expired, attempting refresh...");
        // Try to refresh token
        try {
          const refreshResponse = await api.post<AuthResponse>(
            "/api/auth/refresh",
            {
              refreshToken: authData.refreshToken,
            }
          );

          const { accessToken, expiresIn, user } = refreshResponse.data;
          await storage.updateAccessToken(accessToken, expiresIn);

          console.log("🔐 Token refresh successful");
          return { user, accessToken };
        } catch (refreshError) {
          console.log("🔐 Token refresh failed:", refreshError);
          // Refresh failed - clear storage
          await storage.clearAuthData();
          return { user: null, accessToken: null };
        }
      }

      // Token is still valid - verify with backend
      console.log("🔐 Token still valid, verifying with backend...");
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log("🔐 Backend verification successful");
        return { user: currentUser, accessToken: authData.accessToken };
      } else {
        console.log("🔐 Backend verification failed");
        return { user: null, accessToken: null };
      }
    } catch (error) {
      console.log("🔐 Auth state check failed:", error);
      // Don't clear auth data here in case it's just a network error
      // Let the calling code decide what to do
      throw error; // Re-throw so caller can handle gracefully
    }
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<string> => {
    try {
      const response = await api.post("/api/auth/resend-verification", {
        email,
      });
      return response.data.message || "Verification email sent successfully";
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data.message || "Password reset email sent successfully";
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // NEW: Validate stored token with backend (optional, for when network is available)
  validateStoredToken: async (): Promise<{
    user: User | null;
    accessToken: string | null;
  }> => {
    try {
      console.log("🔐 Validating stored token with backend...");

      // This will try to make a network call to validate
      const result = await authService.checkAuthState();
      return result;
    } catch (error) {
      console.log(
        "🔐 Token validation failed (probably network issue):",
        error
      );
      // Return null but don't clear storage - let offline mode continue
      return { user: null, accessToken: null };
    }
  },

  // NEW: Check if user is authenticated (with stored data only, no network)
  isAuthenticatedLocally: async (): Promise<boolean> => {
    try {
      const storedData = await authService.getStoredAuthData();
      return !!(storedData.user && storedData.accessToken);
    } catch (error) {
      return false;
    }
  },
};
