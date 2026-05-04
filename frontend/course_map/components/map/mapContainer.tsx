"use client";

import { useCallback } from "react";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl";
import { Layers } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/hooks/use-map-store";
import { useTheme } from "next-themes";
import { ParkingLotsOverlay } from "./ParkingLotsOverlay";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapContainerProps {
  children?: React.ReactNode;
  className?: string;
  mapStyle?: string;
}

export function MapContainer({ children, className, mapStyle: propMapStyle }: MapContainerProps) {
  const { viewState, setViewState, mapStyle: storeMapStyle, setMapStyle } = useMapStore();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const defaultBaseStyle = isDark 
    ? "mapbox://styles/mapbox/dark-v11" 
    : "mapbox://styles/mapbox/streets-v12";
  
  const isSatellite = storeMapStyle === "mapbox://styles/mapbox/satellite-streets-v12";

  const activeMapStyle = propMapStyle || (isSatellite ? storeMapStyle : defaultBaseStyle);

  const toggleStyle = () => {
    if (isSatellite) {
      setMapStyle(defaultBaseStyle);
    } else {
      setMapStyle("mapbox://styles/mapbox/satellite-streets-v12");
    }
  };

  const handleMove = useCallback(
    (evt: { viewState: typeof viewState }) => {
      setViewState(evt.viewState);
    },
    [setViewState],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high ${className ?? ""}`}
        role="img"
        aria-label="Campus map placeholder — add NEXT_PUBLIC_MAPBOX_TOKEN to enable live map"
      >
        <div className="text-center space-y-2 p-8">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Map requires{" "}
            <code className="font-mono bg-surface-container px-1 rounded text-xs">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>
          </p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className ?? ""}`}
    >
      <Map
        {...viewState}
        onMove={handleMove}
        mapStyle={activeMapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
      >
        <GeolocateControl 
          position="top-right" 
          trackUserLocation={true}
          showUserHeading={true}
          showUserLocation={true}
          positionOptions={{ enableHighAccuracy: true }}
        />
        <NavigationControl position="top-right" />
        <ParkingLotsOverlay />
        {children}

        {/* Satellite Toggle Button */}
        <button
          onClick={toggleStyle}
          className="absolute top-[158px] right-2.5 p-2 bg-white rounded-md shadow-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors z-10 ring-1 ring-black/5"
          title="Toggle Satellite View"
          aria-label="Toggle Satellite View"
        >
          <Layers className="w-5 h-5" />
        </button>
      </Map>
    </div>
  );
}
