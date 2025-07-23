import React from "react";
import { Platform } from "react-native";
import { AnnouncementDto } from "../../../../types/announcement";
import { MapRegion, UserLocation } from "../../../../types/map";
import MobileMap from "./MobileMap";
import WebMap from "./WebMap";

interface MapProps {
  region: MapRegion;
  announcements: AnnouncementDto[];
  userLocation: UserLocation | null;
  onRegionChange: (region: MapRegion) => void;
  onMarkerPress: (announcement: AnnouncementDto) => void;
  style?: any;
}

export default function Map(props: MapProps) {
  if (Platform.OS === "web") {
    return <WebMap {...props} />;
  } else {
    return <MobileMap {...props} />;
  }
}
