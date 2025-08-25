import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { AnnouncementDto } from "../../../../types/announcement";
import { MapRegion, UserLocation } from "../../../../types/map";

interface WebMapProps {
  region: MapRegion;
  announcements: AnnouncementDto[];
  userLocation: UserLocation | null;
  onRegionChange: (region: MapRegion) => void;
  onMarkerPress: (announcement: AnnouncementDto) => void;
  style?: React.CSSProperties;
}

// Define types for the dynamically imported components
interface LeafletComponents {
  MapContainer: any;
  TileLayer: any;
  Marker: any;
  Popup: any;
  useMapEvents: any;
}

export default function WebMap({
  region,
  announcements,
  userLocation,
  onRegionChange,
  onMarkerPress,
  style,
}: WebMapProps) {
  const [leafletComponents, setLeafletComponents] =
    useState<LeafletComponents | null>(null);
  const [L, setL] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only run on web platform
  if (Platform.OS !== "web") {
    return null;
  }

  // Dynamic import for react-leaflet components
  useEffect(() => {
    const loadLeafletComponents = async () => {
      try {
        // Dynamic import of react-leaflet
        const reactLeaflet = await import("react-leaflet");
        const leaflet = await import("leaflet");

        setLeafletComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          Popup: reactLeaflet.Popup,
          useMapEvents: reactLeaflet.useMapEvents,
        });
        setL(leaflet.default);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load leaflet components:", error);
        setIsLoading(false);
      }
    };

    if (Platform.OS === "web") {
      loadLeafletComponents();
    }
  }, []);

  // Fix for default markers in react-leaflet
  useEffect(() => {
    if (L && typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, [L]);

  // Show loading state while components are loading
  if (isLoading || !leafletComponents || !L) {
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          backgroundColor: "#FAF7F0",
          borderRadius: "16px",
          ...style,
        }}
      >
        {/* Header Card */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1F2937",
                }}
              >
                Search on map
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
                {announcements.length} items found
              </p>
            </div>
            <button
              style={{
                backgroundColor: "#FAF7F0",
                border: "none",
                padding: "12px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Loading State */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#7C444F",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", marginBottom: "8px" }}>🗺️</div>
            <div>Loading map...</div>
          </div>
        </div>

        {/* Bottom Sheet */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            padding: "20px",
            paddingBottom: "100px",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "#E5E7EB",
              borderRadius: "2px",
              margin: "0 auto 20px",
            }}
          />
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: "16px",
            }}
          >
            Found items
          </h4>
          <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  backgroundColor: "#FAF7F0",
                  borderRadius: "12px",
                  padding: "12px",
                  minWidth: "140px",
                  border: "1px solid #E5E7EB",
                  cursor: "pointer",
                }}
                onClick={() => onMarkerPress(announcement)}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor:
                      announcement.type === "LOST" ? "#FF6B6B" : "#4ECDC4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {announcement.type === "LOST" ? "✕" : "✓"}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1F2937",
                    marginBottom: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {announcement.title || "No Title"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginBottom: "4px",
                  }}
                >
                  {announcement.category || "Uncategorized"}
                </div>
                {announcement.distanceKm !== undefined &&
                  announcement.distanceKm !== null && (
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      📍 {announcement.distanceKm}km away
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          style={{
            position: "absolute",
            bottom: "40px",
            left: "20px",
            right: "20px",
            backgroundColor: "#7C444F",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "16px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          Next
        </button>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } =
    leafletComponents;

  // Custom icons for different announcement types (matching app colors)
  const createIcon = (color: string, iconChar: string) => {
    if (typeof window === "undefined") return null;

    const svgIcon = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${iconChar}</text>
      </svg>
    `;

    return new L.DivIcon({
      html: svgIcon,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const lostIcon = createIcon("#FF6B6B", "✕");
  const foundIcon = createIcon("#4ECDC4", "✓");
  const userIcon = createIcon("#7C444F", "●");

  // Component to handle map events
  function MapEventHandler() {
    useMapEvents({
      moveend: (e: any) => {
        const map = e.target;
        const center = map.getCenter();
        const bounds = map.getBounds();
        const latDelta = bounds.getNorth() - bounds.getSouth();
        const lngDelta = bounds.getEast() - bounds.getWest();

        onRegionChange({
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        });
      },
    });
    return null;
  }

  // Render announcement markers
  const renderAnnouncementMarker = (announcement: AnnouncementDto) => {
    if (!announcement.latitude || !announcement.longitude) {
      return null;
    }

    const isLost = announcement.type === "LOST";
    const icon = isLost ? lostIcon : foundIcon;

    return (
      <Marker
        key={announcement.id}
        position={[announcement.latitude, announcement.longitude]}
        icon={icon}
        eventHandlers={{
          click: () => onMarkerPress(announcement),
        }}
      >
        <Popup>
          <div
            style={{
              minWidth: "240px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#1F2937",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "12px",
                  backgroundColor: isLost ? "#FF6B6B" : "#4ECDC4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {isLost ? "✕" : "✓"}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {announcement.type}
              </span>
            </div>

            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1F2937",
                lineHeight: "1.2",
              }}
            >
              {announcement.title}
            </h3>

            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                color: "#7C444F",
                fontWeight: "500",
              }}
            >
              {announcement.category}
            </p>

            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.4",
              }}
            >
              {(announcement.description || "").substring(0, 120)}...
            </p>

            {announcement.distanceKm && (
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "12px",
                  color: "#9CA3AF",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>📍</span> {announcement.distanceKm}km away
              </p>
            )}

            <button
              onClick={() => onMarkerPress(announcement)}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#7C444F",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLElement).style.backgroundColor = "#6B3A44")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLElement).style.backgroundColor = "#7C444F")
              }
            >
              View Details
            </button>
          </div>
        </Popup>
      </Marker>
    );
  };

  // Render user location marker
  const renderUserLocationMarker = () => {
    if (!userLocation || !userIcon) return null;

    return (
      <Marker
        position={[userLocation.latitude, userLocation.longitude]}
        icon={userIcon}
      >
        <Popup>
          <div
            style={{
              textAlign: "center",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#1F2937",
              minWidth: "160px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "16px",
                backgroundColor: "#7C444F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "white",
                fontSize: "16px",
              }}
            >
              📍
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              Your Location
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                color: "#6B7280",
              }}
            >
              You are here
            </p>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <div
      style={{ position: "relative", height: "100%", width: "100%", ...style }}
    >
      {/* Add Leaflet CSS dynamically */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <style>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .leaflet-popup-tip {
          background: white;
        }
        
        .leaflet-control-zoom a {
          background-color: #7C444F !important;
          color: white !important;
          border: none !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #6B3A44 !important;
        }
      `}</style>

      {/* Header Card */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              Search on map
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#6B7280" }}>
              {announcements.length} items found
            </p>
          </div>
          <button
            style={{
              backgroundColor: "#FAF7F0",
              border: "none",
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        style={{
          height: "calc(100% - 300px)",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          marginTop: "100px",
          marginBottom: "200px",
        }}
      >
        <MapContainer
          center={[region.latitude, region.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEventHandler />
          {renderUserLocationMarker()}
          {announcements.map(renderAnnouncementMarker)}
        </MapContainer>
      </div>

      {/* Bottom Sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "20px",
          paddingBottom: "100px",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            backgroundColor: "#E5E7EB",
            borderRadius: "2px",
            margin: "0 auto 20px",
          }}
        />
        <h4
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: "16px",
          }}
        >
          Found items
        </h4>
        <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              style={{
                backgroundColor: "#FAF7F0",
                borderRadius: "12px",
                padding: "12px",
                minWidth: "140px",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
              }}
              onClick={() => onMarkerPress(announcement)}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "12px",
                  backgroundColor:
                    announcement.type === "LOST" ? "#FF6B6B" : "#4ECDC4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                {announcement.type === "LOST" ? "✕" : "✓"}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1F2937",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {announcement.title || "No Title"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginBottom: "4px",
                }}
              >
                {announcement.category || "Uncategorized"}
              </div>
              {announcement.distanceKm !== undefined &&
                announcement.distanceKm !== null && (
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    📍 {announcement.distanceKm}km away
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button
        style={{
          position: "absolute",
          bottom: "40px",
          left: "20px",
          right: "20px",
          backgroundColor: "#7C444F",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "16px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        Next
      </button>
    </div>
  );
}
