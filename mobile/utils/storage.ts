// utils/storage.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { User } from "../types/auth";

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}

// Platform-specific storage wrapper
const platformStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      // Use localStorage for web
      return localStorage.getItem(key);
    } else {
      // Use SecureStore for mobile
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for mobile
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const storage = {
  // Save authentication data
  async saveAuthData(
    accessToken: string,
    refreshToken: string,
    user: User,
    expiresIn: number
  ): Promise<void> {
    try {
      const expiresAt = Date.now() + expiresIn;

      const authData: AuthData = {
        accessToken,
        refreshToken,
        user,
        expiresAt,
      };

      await platformStorage.setItem("auth_data", JSON.stringify(authData));
      console.log("✅ Auth data saved successfully");
    } catch (error) {
      console.error("❌ Error saving auth data:", error);
      throw error;
    }
  },

  // Get authentication data
  async getAuthData(): Promise<AuthData | null> {
    try {
      const data = await platformStorage.getItem("auth_data");

      if (!data) {
        return null;
      }

      const authData: AuthData = JSON.parse(data);
      return authData;
    } catch (error) {
      console.error("Error getting auth data:", error);
      return null;
    }
  },

  // Clear authentication data
  async clearAuthData(): Promise<void> {
    try {
      await platformStorage.removeItem("auth_data");
      console.log("✅ Auth data cleared");
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
    }
  },

  // Check if token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const authData = await this.getAuthData();

      if (!authData) {
        return true;
      }

      return Date.now() >= authData.expiresAt;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  },

  // Update access token (for refresh)
  async updateAccessToken(
    accessToken: string,
    expiresIn: number
  ): Promise<void> {
    try {
      const authData = await this.getAuthData();

      if (!authData) {
        throw new Error("No auth data to update");
      }

      authData.accessToken = accessToken;
      authData.expiresAt = Date.now() + expiresIn;

      await platformStorage.setItem("auth_data", JSON.stringify(authData));
      console.log("✅ Access token updated");
    } catch (error) {
      console.error("❌ Error updating access token:", error);
      throw error;
    }
  },
};
