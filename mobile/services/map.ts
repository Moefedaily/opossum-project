// services/map.ts - FIXED VERSION
import * as Location from "expo-location";
import api, { handleApiError } from "./api";
import { AnnouncementDto } from "../types/announcement";
import {
  MapSearchParams,
  UserLocation,
  LocationPermissionStatus,
  MapRegion,
} from "../types/map";

export const mapService = {
  requestLocationPermission: async (): Promise<LocationPermissionStatus> => {
    try {
      console.log("Requesting location permission...");

      const { status } = await Location.requestForegroundPermissionsAsync();

      console.log("Location permission status:", status);

      switch (status) {
        case Location.PermissionStatus.GRANTED:
          return "granted";
        case Location.PermissionStatus.DENIED:
          return "denied";
        default:
          return "undetermined";
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return "denied";
    }
  },

  getCurrentLocation: async (): Promise<UserLocation> => {
    try {
      console.log("Getting current location...");

      const permission = await mapService.requestLocationPermission();
      if (permission !== "granted") {
        throw new Error("Location permission not granted");
      }

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Location request timed out")), 10000)
      );
      const location = await Promise.race([locationPromise, timeoutPromise]);

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      console.log("Got user location:", userLocation);
      return userLocation;
    } catch (error: any) {
      console.error("Error getting current location:", error);
      throw new Error(`Failed to get location: ${error.message}`);
    }
  },

  reverseGeocode: async (params: {
    latitude: number;
    longitude: number;
  }): Promise<string> => {
    try {
      console.log("Reverse geocoding:", params);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: params.latitude,
        longitude: params.longitude,
      });

      if (address) {
        const addressParts = [
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);

        const formattedAddress = addressParts.join(", ");
        console.log("Reverse geocoded address:", formattedAddress);
        return formattedAddress;
      }

      return "Unknown location";
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return "Unknown location";
    }
  },

  // FIXED: Handle backend response properly
  getNearbyAnnouncements: async (
    params: MapSearchParams
  ): Promise<AnnouncementDto[]> => {
    try {
      console.log("Fetching nearby announcements:", params);

      if (!mapService.validateCoordinates(params.latitude, params.longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      if (params.radiusKm <= 0 || params.radiusKm > 100) {
        throw new Error("Radius must be between 0 and 100 km");
      }

      let url = `/api/announcements/nearby?latitude=${params.latitude}&longitude=${params.longitude}&radiusKm=${params.radiusKm}`;

      if (params.category && params.category !== "ALL") {
        url += `&category=${params.category}`;
      }
      if (params.type) {
        url += `&type=${params.type}`;
      }

      console.log("API call:", url);

      const response = await api.get(url);

      // FIX: Handle different response formats
      let announcements = response.data;

      // Check if response is wrapped in an object
      if (
        announcements &&
        typeof announcements === "object" &&
        !Array.isArray(announcements)
      ) {
        // Try common wrapper property names
        if (announcements.data && Array.isArray(announcements.data)) {
          announcements = announcements.data;
        } else if (
          announcements.announcements &&
          Array.isArray(announcements.announcements)
        ) {
          announcements = announcements.announcements;
        } else if (announcements.items && Array.isArray(announcements.items)) {
          announcements = announcements.items;
        } else if (
          announcements.content &&
          Array.isArray(announcements.content)
        ) {
          announcements = announcements.content;
        } else {
          console.error("Unexpected response format:", announcements);
          throw new Error("Invalid response format from server");
        }
      }

      // Ensure we have an array
      if (!Array.isArray(announcements)) {
        console.error(
          "Response is not an array:",
          typeof announcements,
          announcements
        );
        throw new Error("Server response is not an array");
      }

      console.log(`Found ${announcements.length} nearby announcements`);

      // Calculate distances and add files
      const announcementsWithDistance = announcements.map(
        (announcement: AnnouncementDto) => ({
          ...announcement,
          distanceKm:
            announcement.latitude && announcement.longitude
              ? mapService.calculateDistance({
                  lat1: params.latitude,
                  lng1: params.longitude,
                  lat2: announcement.latitude,
                  lng2: announcement.longitude,
                })
              : undefined,
        })
      );

      // Fetch files for each announcement
      const announcementsWithFiles = await Promise.all(
        announcementsWithDistance.map(async (announcement: AnnouncementDto) => {
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

      return announcementsWithFiles;
    } catch (error: any) {
      const apiError = handleApiError(error);
      console.error("Error fetching nearby announcements:", apiError);
      throw new Error(apiError.error);
    }
  },

  getAnnouncementsSortedByDistance: async (params: {
    latitude: number;
    longitude: number;
  }): Promise<AnnouncementDto[]> => {
    try {
      console.log("Fetching announcements sorted by distance:", params);

      if (!mapService.validateCoordinates(params.latitude, params.longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      const url = `/api/announcements/sorted-by-distance?latitude=${params.latitude}&longitude=${params.longitude}`;

      console.log("API call:", url);

      const response = await api.get(url);

      // FIX: Handle different response formats (same fix as above)
      let announcements = response.data;

      if (
        announcements &&
        typeof announcements === "object" &&
        !Array.isArray(announcements)
      ) {
        if (announcements.data && Array.isArray(announcements.data)) {
          announcements = announcements.data;
        } else if (
          announcements.announcements &&
          Array.isArray(announcements.announcements)
        ) {
          announcements = announcements.announcements;
        } else if (announcements.items && Array.isArray(announcements.items)) {
          announcements = announcements.items;
        } else if (
          announcements.content &&
          Array.isArray(announcements.content)
        ) {
          announcements = announcements.content;
        } else {
          console.error("Unexpected response format:", announcements);
          throw new Error("Invalid response format from server");
        }
      }

      if (!Array.isArray(announcements)) {
        console.error(
          "Response is not an array:",
          typeof announcements,
          announcements
        );
        throw new Error("Server response is not an array");
      }

      console.log(
        `Found ${announcements.length} announcements sorted by distance`
      );

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

      return announcementsWithFiles;
    } catch (error: any) {
      const apiError = handleApiError(error);
      console.error("Error fetching sorted announcements:", apiError);
      throw new Error(apiError.error);
    }
  },

  validateCoordinates: (latitude: number, longitude: number): boolean => {
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  },

  calculateDistance: (params: {
    lat1: number;
    lng1: number;
    lat2: number;
    lng2: number;
  }): number => {
    const { lat1, lng1, lat2, lng2 } = params;

    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  },

  getDefaultMapRegion: (userLocation?: UserLocation): MapRegion => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    return {
      latitude: 45.764,
      longitude: 4.8357,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  },

  getRegionForAnnouncements: (announcements: AnnouncementDto[]): MapRegion => {
    if (announcements.length === 0) {
      return mapService.getDefaultMapRegion();
    }

    const latitudes = announcements
      .filter((a) => a.latitude)
      .map((a) => a.latitude!);
    const longitudes = announcements
      .filter((a) => a.longitude)
      .map((a) => a.longitude!);

    if (latitudes.length === 0 || longitudes.length === 0) {
      return mapService.getDefaultMapRegion();
    }

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2;
    const deltaLng = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  },

  getAnnouncementsInRegion: async (
    region: MapRegion
  ): Promise<AnnouncementDto[]> => {
    try {
      const radiusKm =
        Math.max(
          region.latitudeDelta * 111,
          region.longitudeDelta *
            111 *
            Math.cos((region.latitude * Math.PI) / 180)
        ) / 2;

      const limitedRadius = Math.min(Math.max(radiusKm, 1), 100);

      console.log(`Searching in region with radius: ${limitedRadius}km`);

      return await mapService.getNearbyAnnouncements({
        latitude: region.latitude,
        longitude: region.longitude,
        radiusKm: limitedRadius,
      });
    } catch (error) {
      console.error("Error getting announcements in region:", error);
      return [];
    }
  },
};
