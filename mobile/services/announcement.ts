import api, { handleApiError } from "./api";
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "../types/announcement";

export const announcementService = {
  getAllAnnouncements: async (params?: {
    category?: string;
  }): Promise<AnnouncementDto[]> => {
    try {
      console.log("Fetching announcements with params:", params);

      let url = "/api/announcements";
      if (params?.category && params.category !== "ALL") {
        url += `?category=${params.category}`;
      }

      const response = await api.get(url);
      const announcements = response.data;

      console.log(`Fetched ${announcements.length} announcements`);

      // Fetch files for each announcement
      const announcementsWithFiles = await Promise.all(
        announcements.map(async (announcement: AnnouncementDto) => {
          try {
            const filesResponse = await api.get(
              `/api/files/announcement/${announcement.id}`
            );
            return {
              ...announcement,
              files: filesResponse.data || [],
            };
          } catch (fileError) {
            console.log(`No files found for announcement ${announcement.id}`);
            return {
              ...announcement,
              files: [],
            };
          }
        })
      );

      console.log(
        `Added files data to ${announcementsWithFiles.length} announcements`
      );
      return announcementsWithFiles;
    } catch (error: any) {
      const apiError = handleApiError(error);
      console.error("Error fetching announcements:", apiError);
      throw new Error(apiError.error);
    }
  },

  getAnnouncementById: async (id: number): Promise<AnnouncementDto> => {
    try {
      console.log(`Fetching announcement ${id}`);

      const response = await api.get(`/api/announcements/${id}`);
      const announcement = response.data;
      console.log(`Fetched announcement ${id}:`, announcement);

      // Fetch files for this announcement
      try {
        const filesResponse = await api.get(`/api/files/announcement/${id}`);
        announcement.files = filesResponse.data || [];
        console.log(
          `Fetched ${announcement.files.length} files for announcement ${id}`
        );
      } catch (fileError) {
        console.log(` No files found for announcement ${id}`);
        announcement.files = [];
      }

      return announcement;
    } catch (error: any) {
      const apiError = handleApiError(error);
      console.error(`Error fetching announcement ${id}:`, apiError);
      throw new Error(apiError.error);
    }
  },

  createAnnouncement: async (
    data: CreateAnnouncementRequest
  ): Promise<AnnouncementDto> => {
    try {
      console.log("Creating announcement:", data.title);

      const response = await api.post("/api/announcements", data);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      console.error("Error creating announcement:", apiError);
      throw new Error(apiError.error);
    }
  },
  deleteAnnouncement: async (announcementId: number): Promise<void> => {
    try {
      await api.delete(`/api/announcements/${announcementId}`, {
        timeout: 30000,
      });
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error || "Failed to delete announcement");
    }
  },
};

// Update announcement
export const updateAnnouncement = async (
  announcementId: number,
  updateData: UpdateAnnouncementRequest
): Promise<AnnouncementDto> => {
  try {
    console.log(`Updating announcement ${announcementId}:`, updateData);

    const response = await api.put(
      `/api/announcements/${announcementId}`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    const apiError = handleApiError(error);
    console.error("Error updating announcement:", apiError);
    throw new Error(apiError.error);
  }
};

export const deleteAnnouncement = async (
  announcementId: number
): Promise<void> => {
  try {
    console.log(`Deleting announcement ${announcementId}`);

    await api.delete(`/api/announcements/${announcementId}`);
    console.log(`Announcement ${announcementId} deleted successfully`);
  } catch (error: any) {
    const apiError = handleApiError(error);
    console.error("Error deleting announcement:", apiError);
    throw new Error(apiError.error);
  }
};

// Update announcement status only
export const updateAnnouncementStatus = async (
  announcementId: number,
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED"
): Promise<AnnouncementDto> => {
  try {
    console.log(`Updating announcement ${announcementId} status to:`, status);

    const response = await api.patch(
      `/api/announcements/${announcementId}/status`,
      {
        status,
      }
    );
    return response.data;
  } catch (error: any) {
    const apiError = handleApiError(error);
    console.error("Error updating announcement status:", apiError);
    throw new Error(apiError.error);
  }
};

// Helper function to get category icon name
export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "electronics":
      return "phone-portrait-outline";
    case "clothing":
      return "shirt-outline";
    case "documents":
      return "document-text-outline";
    case "bags":
      return "bag-outline";
    case "keys":
      return "key-outline";
    case "jewelry":
      return "diamond-outline";
    case "books":
      return "book-outline";
    case "household":
      return "home-outline";
    case "vehicle":
      return "car-outline";
    case "sports":
      return "football-outline";
    case "pets":
      return "paw-outline";
    case "wallet":
      return "wallet-outline";
    default:
      return "help-circle-outline";
  }
};

// Helper function to format time ago
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    }
  }
};
