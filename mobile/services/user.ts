// services/user.ts
import api, { handleApiError } from "./api";
import { User } from "../types/auth";
import {
  UpdateProfileRequest,
  UserAnnouncementResponse,
  UserProfileResponse,
} from "../types/profile";

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfileResponse> => {
    try {
      const response = await api.get<UserProfileResponse>("/api/auth/me");
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Update user profile (firstName, lastName, phone)
  updateProfile: async (
    profileData: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    try {
      // Get current user ID first
      const currentUser = await userService.getCurrentUser();

      const response = await api.patch<UserProfileResponse>(
        `/api/users/${currentUser.id}/profile`,
        profileData,
        {
          timeout: 30000, // 30 seconds for profile updates
        }
      );
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Get user's announcements
  getUserAnnouncements: async (): Promise<UserAnnouncementResponse[]> => {
    try {
      // Get announcements for current user
      const response = await api.get<UserAnnouncementResponse[]>(
        "/api/announcements/my",
        {
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Upload profile avatar (if you want to implement this)
  uploadAvatar: async (imageFile: FormData): Promise<UserProfileResponse> => {
    try {
      // Get current user ID first
      const currentUser = await userService.getCurrentUser();

      const response = await api.post<UserProfileResponse>(
        `/api/users/${currentUser.id}/avatar`,
        imageFile,
        {
          timeout: 60000,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    try {
      const currentUser = await userService.getCurrentUser();

      await api.delete(`/api/users/${currentUser.id}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Check username/email availability
  checkAvailability: async (
    username?: string,
    email?: string
  ): Promise<{
    usernameAvailable: boolean;
    emailAvailable: boolean;
  }> => {
    try {
      const params = new URLSearchParams();
      if (username) params.append("username", username);
      if (email) params.append("email", email);

      const response = await api.get<{
        usernameAvailable: boolean;
        emailAvailable: boolean;
      }>(`/api/users/check-availability?${params.toString()}`);

      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // Get user statistics (for profile insights)
  getUserStats: async (): Promise<{
    totalAnnouncements: number;
    activeAnnouncements: number;
    resolvedAnnouncements: number;
  }> => {
    try {
      // I calculate from getUserAnnouncements for now
      const announcements = await userService.getUserAnnouncements();

      return {
        totalAnnouncements: announcements.length,
        activeAnnouncements: announcements.filter((a) => a.status === "ACTIVE")
          .length,
        resolvedAnnouncements: announcements.filter(
          (a) => a.status === "RESOLVED"
        ).length,
      };
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<string> => {
    try {
      const response = await api.post<{ message: string }>(
        "/api/auth/change-password",
        passwordData,
        {
          timeout: 30000,
        }
      );
      return response.data.message || "Password changed successfully";
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },
};
