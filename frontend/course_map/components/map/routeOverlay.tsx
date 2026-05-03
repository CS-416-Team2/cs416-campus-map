"use client";

import { Source, Layer } from "react-map-gl";
import { useDirections } from "@/hooks/use-directions";

export function RouteOverlay() {
  const { data: routeData, isLoading, error } = useDirections();

  if (isLoading || error || !routeData?.geoJson) {
    return null;
  }

  return (
    <Source id="route-source" type="geojson" data={routeData.geoJson}>
      {/* Casing (border) rendered behind the main line */}
      <Layer
        id="route-layer-shadow"
        type="line"
        source="route-source"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#2563eb",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 5, 18, 14],
          "line-opacity": 1,
        }}
      />
      {/* Main solid blue route line */}
      <Layer
        id="route-layer"
        type="line"
        source="route-source"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#3b82f6",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 18, 8],
        }}
      />
    </Source>
  );
}
