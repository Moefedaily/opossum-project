import api from "./api";
import { FileDto } from "../types/announcement";
import { Platform } from "react-native";

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

      // Create FormData for multipart upload
      const formData = new FormData();
      console.log("Debug FormData entries:");
      formData.forEach((value, key) => {
        console.log(`  ${key}:`, value);
        console.log(`  ${key} type:`, typeof value);
        console.log(`  ${key} constructor:`, value.constructor.name);
      });

      const filename = `photo_${Date.now()}.jpg`;

      let fileObject: any;

      if (Platform.OS === "web") {
        //  WEB: Convert data URL to Blob
        if (photoUri.startsWith("data:")) {
          const response = await fetch(photoUri);
          const blob = await response.blob();
          fileObject = new File([blob], filename, { type: "image/jpeg" });
          console.log(" Debug fileObject:", fileObject);
          console.log(
            " Debug fileObject constructor:",
            fileObject.constructor.name
          );
          console.log(
            " Debug fileObject instanceof File:",
            fileObject instanceof File
          );
        } else {
          // Handle file URI for web
          throw new Error("Web platform expects data URLs, got file URI");
        }
      } else {
        //  MOBILE: Use React Native format
        if (photoUri.startsWith("data:")) {
          // Convert data URL to file URI first
          const FileSystem = require("expo-file-system");
          const tempFileUri = `${FileSystem.documentDirectory}temp_${filename}`;
          const base64Data = photoUri.split(",")[1];
          await FileSystem.writeAsStringAsync(tempFileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          fileObject = {
            uri: tempFileUri,
            type: "image/jpeg",
            name: filename,
          };
        } else {
          fileObject = {
            uri: photoUri,
            type: "image/jpeg",
            name: filename,
          };
        }
      }

      // Append to FormData
      formData.append("file", fileObject);
      formData.append("announcementId", announcementId.toString());

      console.log(" Platform:", Platform.OS);
      console.log(" FormData Debug:");
      console.log("  fileObject type:", typeof fileObject);
      console.log("  announcementId:", announcementId);
      console.log("  filename:", filename);

      console.log("Sending file upload request...");

      const uploadConfig: any = {
        timeout: 30000,
      };

      if (Platform.OS === "web") {
        //  WEB: browser will set Content-Type with boundary
        uploadConfig.headers = {};
      } else {
        //  MOBILE: React will Native handle it
        uploadConfig.headers = {};
      }

      // Upload request
      const response = await api.post(
        "/api/files/upload",
        formData,
        uploadConfig
      );

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
};
