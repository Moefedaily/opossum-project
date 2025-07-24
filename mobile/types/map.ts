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
  search?: string;
}

export interface MapProps {
  region: MapRegion;
  announcements: AnnouncementDto[];
  userLocation: UserLocation | null;
  onRegionChange: (region: MapRegion) => void;
  onMarkerPress: (announcement: AnnouncementDto) => void;
  style?: any;
  filters: FilterState;
  onOpenFilters?: () => void;
}

export interface FilterState {
  type: "ALL" | "LOST" | "FOUND";
  radius: number;
  category: string;
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
