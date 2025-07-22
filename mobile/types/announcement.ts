export interface AnnouncementDto {
  id: number;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED";
  category: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  incidentDate: string;
  contactInfo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  username: string;
  userEmail: string;
  userFullName: string;

  files: FileDto[];
}

export interface FileDto {
  id: number;
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  isActive: boolean;
  createdAt: string;
  uploadedBy?: {
    id: number;
    username: string;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  category: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  incidentDate: string;
  contactInfo?: string;
}
