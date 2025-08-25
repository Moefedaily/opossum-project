import React from "react";
import { MapProps } from "../../../../types/map";
import MobileMap from "./MobileMap";

export default function Map(props: MapProps) {
  return <MobileMap {...props} />;
}
