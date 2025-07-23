import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { storage } from "../utils/storage";
import { ApiError, HttpStatus } from "../types/api";
import { AuthResponse, RefreshTokenRequest } from "../types/auth";

// Create axios instance with base config + ngrok headers
const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "User-Agent": "OPOSSUM-Mobile-App",
  },
});

const AUTH_NOT_REQUIRED_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/categories",
];

// **HELPER FUNCTION** - Check if endpoint needs auth
const shouldSkipAuth = (url: string | undefined, method = "GET"): boolean => {
  if (!url) return false;
  if (url.includes("/api/announcements")) {
    return method.toUpperCase() === "GET";
  }

  if (url.includes("/api/files")) {
    return method.toUpperCase() === "GET";
  }
  return AUTH_NOT_REQUIRED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

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

// **REQUEST INTERCEPTOR** - Add auth token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const skipAuth = shouldSkipAuth(config.url, config.method);
    const isFormData = config.data instanceof FormData;

    config.headers["ngrok-skip-browser-warning"] = "true";
    config.headers["User-Agent"] = "OPOSSUM-Mobile-App";

    if (!skipAuth) {
      const authData = await storage.getAuthData();
      if (authData?.accessToken) {
        config.headers.Authorization = `Bearer ${authData.accessToken}`;

        if (isFormData) {
          delete config.headers["Content-Type"];
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// **RESPONSE INTERCEPTOR** - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const skipRefresh = shouldSkipAuth(
      originalRequest.url,
      originalRequest.method
    );

    // Only attempt refresh for 401 errors on protected endpoints
    if (
      error.response?.status === HttpStatus.UNAUTHORIZED &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      if (isRefreshing) {
        // Queue this request while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
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
          { refreshToken: authData.refreshToken } as RefreshTokenRequest,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "User-Agent": "OPOSSUM-Mobile-App",
            },
          }
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
        await storage.clearAuthData();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// **HELPER FUNCTION** - Format API errors consistently
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
