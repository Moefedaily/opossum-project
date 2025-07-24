import React from "react";
import { Platform } from "react-native";
import { MapProps } from "../../../../types/map";
import MobileMap from "./MobileMap";
import WebMap from "./WebMap";

export default function Map(props: MapProps) {
  if (Platform.OS === "web") {
    return <WebMap {...props} />;
  } else {
    return <MobileMap {...props} />;
  }
}
