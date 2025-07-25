import { Double } from "react-native/Libraries/Types/CodegenTypes";

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
  distanceKm?: Double;
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

export interface PhotoData {
  id: string;
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  isLocationApproximate?: boolean;
}

export interface CreateAnnouncementFormData {
  type: "LOST" | "FOUND" | null;
  category:
    | "ELECTRONICS"
    | "CLOTHING"
    | "DOCUMENTS"
    | "BAGS"
    | "KEYS"
    | "JEWELRY"
    | "BOOKS"
    | "HOUSEHOLD"
    | "VEHICLE"
    | "SPORTS"
    | "PETS"
    | "WALLET"
    | null;
  title: string;
  description: string;
  incidentDate: string;
  contactInfo: string;

  photos: PhotoData[];

  location: LocationData | null;
}
export interface CreateAnnouncementContextType {
  // Form data
  formData: CreateAnnouncementFormData;

  // Step 1: Basic Info methods
  updateBasicInfo: (data: Partial<CreateAnnouncementFormData>) => void;

  // Step 2: Photos methods
  addPhoto: (photo: PhotoData) => void;
  removePhoto: (photoId: string) => void;
  updatePhotos: (photos: PhotoData[]) => void;

  // Step 3: Location methods
  updateLocation: (location: LocationData | null) => void;

  // Navigation & Flow
  currentStep: number;
  setCurrentStep: (step: number) => void;
  canProceedToStep: (step: number) => boolean;

  // Validation
  validateStep1: () => { isValid: boolean; errors: string[] };
  validateStep2: () => { isValid: boolean; errors: string[] };
  validateStep3: () => { isValid: boolean; errors: string[] };

  // Submission
  isSubmitting: boolean;
  submitAnnouncement: () => Promise<{
    success: boolean;
    announcementId?: number;
    error?: string;
  }>;

  // Reset
  resetForm: () => void;
}
