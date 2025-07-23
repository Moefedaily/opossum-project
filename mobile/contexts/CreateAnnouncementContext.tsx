import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  CreateAnnouncementContextType,
  CreateAnnouncementFormData,
  LocationData,
  PhotoData,
} from "../types/announcement";
import { fileUploadService } from "../services/fileUpload";

// Initial form data
const initialFormData: CreateAnnouncementFormData = {
  // Step 1
  type: null,
  category: null,
  title: "",
  description: "",
  incidentDate: new Date().toISOString(),
  contactInfo: "",

  // Step 2
  photos: [],

  // Step 3
  location: null,
};

// Create context
const CreateAnnouncementContext = createContext<
  CreateAnnouncementContextType | undefined
>(undefined);

// Context provider component
export const CreateAnnouncementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] =
    useState<CreateAnnouncementFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info methods
  const updateBasicInfo = (data: Partial<CreateAnnouncementFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Step 2: Photos methods
  const addPhoto = (photo: PhotoData) => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, photo],
    }));
  };

  const removePhoto = (photoId: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== photoId),
    }));
  };

  const updatePhotos = (photos: PhotoData[]) => {
    setFormData((prev) => ({ ...prev, photos }));
  };

  // Step 3: Location methods
  const updateLocation = (location: LocationData | null) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  // Validation functions
  const validateStep1 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.type) {
      errors.push("Please select if this is a lost or found item");
    }

    if (!formData.category) {
      errors.push("Please select a category");
    }

    if (!formData.title.trim()) {
      errors.push("Title is required");
    } else if (formData.title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }

    if (!formData.description.trim()) {
      errors.push("Description is required");
    } else if (formData.description.length > 2000) {
      errors.push("Description must be less than 2000 characters");
    }

    if (!formData.incidentDate) {
      errors.push("Incident date is required");
    }

    if (formData.contactInfo.length > 500) {
      errors.push("Contact info must be less than 500 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateStep2 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Photos are optional, but if provided, validate them
    if (formData.photos.length > 10) {
      errors.push("Maximum 10 photos allowed");
    }

    // Check for valid photo data
    formData.photos.forEach((photo, index) => {
      if (!photo.uri) {
        errors.push(`Photo ${index + 1} is missing file data`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateStep3 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Location is optional, but if provided, validate it
    if (formData.location) {
      if (!formData.location.latitude || !formData.location.longitude) {
        errors.push("Invalid location coordinates");
      }

      if (formData.location.address && formData.location.address.length > 500) {
        errors.push("Address must be less than 500 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Navigation helper
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return validateStep1().isValid;
      case 3:
        return validateStep1().isValid && validateStep2().isValid;
      default:
        return true;
    }
  };

  // Submission logic
  const submitAnnouncement = async (): Promise<{
    success: boolean;
    announcementId?: number;
    error?: string;
  }> => {
    try {
      setIsSubmitting(true);

      // Final validation
      const step1Valid = validateStep1();
      const step2Valid = validateStep2();
      const step3Valid = validateStep3();

      if (!step1Valid.isValid || !step2Valid.isValid || !step3Valid.isValid) {
        const allErrors = [
          ...step1Valid.errors,
          ...step2Valid.errors,
          ...step3Valid.errors,
        ];
        return {
          success: false,
          error: allErrors.join(", "),
        };
      }

      // Prepare data for API
      const createRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type!,
        category: formData.category!,
        latitude: formData.location?.latitude,
        longitude: formData.location?.longitude,
        address: formData.location?.address,
        isLocationApproximate:
          formData.location?.isLocationApproximate || false,
        incidentDate: formData.incidentDate,
        contactInfo: formData.contactInfo.trim() || undefined,
      };

      // Import announcement service
      const { announcementService } = await import("../services/announcement");

      // Create announcement
      const createdAnnouncement = await announcementService.createAnnouncement(
        createRequest
      );

      if (formData.photos.length > 0) {
        try {
          const photoUris = formData.photos.map((photo) => photo.uri);
          const uploadedFiles = await fileUploadService.uploadMultiplePhotos(
            photoUris,
            createdAnnouncement.id,
            (uploaded, total) => {
              console.log(`Upload progress: ${uploaded}/${total} photos`);
            }
          );
        } catch (uploadError) {
          console.error(
            "Photo upload failed, but announcement was created:",
            uploadError
          );
        }
      }

      return {
        success: true,
        announcementId: createdAnnouncement.id,
      };
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      return {
        success: false,
        error: error.message || "Failed to create announcement",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSubmitting(false);
  };

  const contextValue: CreateAnnouncementContextType = {
    // Form data
    formData,

    // Step 1
    updateBasicInfo,

    // Step 2
    addPhoto,
    removePhoto,
    updatePhotos,

    // Step 3
    updateLocation,

    // Navigation
    currentStep,
    setCurrentStep,
    canProceedToStep,

    // Validation
    validateStep1,
    validateStep2,
    validateStep3,

    // Submission
    isSubmitting,
    submitAnnouncement,

    // Reset
    resetForm,
  };

  return (
    <CreateAnnouncementContext.Provider value={contextValue}>
      {children}
    </CreateAnnouncementContext.Provider>
  );
};

// Custom hook to use the context
export const useCreateAnnouncement = (): CreateAnnouncementContextType => {
  const context = useContext(CreateAnnouncementContext);
  if (!context) {
    throw new Error(
      "useCreateAnnouncement must be used within a CreateAnnouncementProvider"
    );
  }
  return context;
};

export default CreateAnnouncementContext;
