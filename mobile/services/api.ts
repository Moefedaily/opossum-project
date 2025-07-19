import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { storage } from "../utils/storage";
import { ApiError, HttpStatus } from "../types/api";
import { AuthResponse, RefreshTokenRequest } from "../types/auth";

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Process queued requests after refresh
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// REQUEST INTERCEPTOR - Add auth token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for login/register endpoints
    const authNotRequired = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/verify-email",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/categories",
      "/api/announcements",
    ];

    const skipAuth = authNotRequired.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!skipAuth) {
      const authData = await storage.getAuthData();
      if (authData?.accessToken) {
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and we haven't already tried to refresh
    if (
      error.response?.status === HttpStatus.UNAUTHORIZED &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue this request while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry original request with new token
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authData = await storage.getAuthData();

        if (!authData?.refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const refreshResponse = await axios.post<AuthResponse>(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken: authData.refreshToken } as RefreshTokenRequest
        );

        const { accessToken, expiresIn } = refreshResponse.data;

        // Update stored token
        await storage.updateAccessToken(accessToken, expiresIn);

        // Update default auth header
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed - clear auth data (logout)
        await storage.clearAuthData();

        // You might want to redirect to login here
        // For now, we'll just reject
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to format API errors
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      error: error.response.data.error || "An error occurred",
      message: error.response.data.message,
    };
  }

  if (error.message) {
    return {
      error: error.message,
    };
  }

  return {
    error: "Network error - please check your connection",
  };
};

export default api;
