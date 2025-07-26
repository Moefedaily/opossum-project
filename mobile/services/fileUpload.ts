import api, { handleApiError } from "./api";
import { FileDto } from "../types/announcement";

export const fileUploadService = {
  uploadAnnouncementPhoto: async (
    photoUri: string,
    announcementId: number
  ): Promise<FileDto> => {
    try {
      console.log(
        ` Uploading photo for announcement ${announcementId}:`,
        photoUri.substring(0, 50) + "..."
      );

      const formData = new FormData();
      const filename = `photo_${Date.now()}.jpg`;

      const fileObject = {
        uri: photoUri,
        type: "image/jpeg",
        name: filename,
      } as any;

      formData.append("file", fileObject);
      formData.append("announcementId", announcementId.toString());

      console.log("Sending file upload request...");

      const response = await api.post("/api/files/upload", formData, {
        timeout: 45000,
        headers: {},
      });

      console.log("Photo uploaded successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error uploading photo:", error);

      if (error.response?.data) {
        console.error("Server response:", error.response.data);
        throw new Error(
          `Upload failed: ${
            error.response.data.message || error.response.data.error
          }`
        );
      } else if (error.message) {
        throw new Error(`Upload failed: ${error.message}`);
      } else {
        throw new Error("Upload failed: Unknown error occurred");
      }
    }
  },

  uploadMultiplePhotos: async (
    photoUris: string[],
    announcementId: number,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<FileDto[]> => {
    const uploadedFiles: FileDto[] = [];

    console.log(
      `Uploading ${photoUris.length} photos for announcement ${announcementId}`
    );

    for (let i = 0; i < photoUris.length; i++) {
      try {
        const file = await fileUploadService.uploadAnnouncementPhoto(
          photoUris[i],
          announcementId
        );
        uploadedFiles.push(file);

        if (onProgress) {
          onProgress(i + 1, photoUris.length);
        }

        console.log(`Uploaded photo ${i + 1}/${photoUris.length}`);
      } catch (error) {
        console.error(
          `Failed to upload photo ${i + 1}/${photoUris.length}:`,
          error
        );
      }
    }

    return uploadedFiles;
  },

  uploadMultiplePhotosAtOnce: async (
    photoUris: string[],
    announcementId: number,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<FileDto[]> => {
    try {
      console.log(
        `Uploading ${photoUris.length} photos at once for announcement ${announcementId}`
      );

      const formData = new FormData();

      for (let i = 0; i < photoUris.length; i++) {
        const photoUri = photoUris[i];
        const filename = `photo_${Date.now()}_${i}.jpg`;

        const fileObject = {
          uri: photoUri,
          type: "image/jpeg",
          name: filename,
        } as any;

        formData.append("files", fileObject);
      }

      formData.append("announcementId", announcementId.toString());

      const response = await api.post("/api/files/upload-multiple", formData, {
        headers: {},
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            const estimatedUploaded = Math.floor(
              (percentCompleted / 100) * photoUris.length
            );
            onProgress(estimatedUploaded, photoUris.length);
          }
        },
      });

      console.log(`Successfully uploaded ${photoUris.length} photos at once`);
      return response.data;
    } catch (error: any) {
      console.error("Error uploading multiple photos at once:", error);
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  getAnnouncementPhotosForEdit: async (
    announcementId: number
  ): Promise<{
    files: FileDto[];
    canEdit: boolean;
    announcementId: number;
  }> => {
    try {
      const response = await api.get(
        `/api/files/announcement/${announcementId}`
      );

      if (typeof response.data === "object" && "files" in response.data) {
        return response.data;
      } else {
        return {
          files: response.data,
          canEdit: true,
          announcementId,
        };
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  deletePhoto: async (fileId: number): Promise<void> => {
    try {
      await api.delete(`/api/files/${fileId}`);
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },
};
