import { AnnouncementDto } from "./announcement";
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number; // Zoom level
  longitudeDelta: number; // Zoom level
}

export interface MapSearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: string;
  type?: "LOST" | "FOUND";
}

export interface MapMarkerData {
  announcement: AnnouncementDto;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// GPS permission status
export type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "restricted";
