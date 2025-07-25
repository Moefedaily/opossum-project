import { FileDto } from "./announcement";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserAnnouncementResponse {
  id: number;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  category: string;
  status: "ACTIVE" | "RESOLVED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactInfo?: string;
  files?: FileDto[];
}
