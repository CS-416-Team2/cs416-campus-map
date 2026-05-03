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
      {/* Glow shadow rendered behind the main line */}
      <Layer
        id="route-layer-shadow"
        type="line"
        source="route-source"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#86f2e4",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 6, 18, 20],
          "line-opacity": 0.3,
          "line-blur": ["interpolate", ["linear"], ["zoom"], 12, 2, 18, 6],
        }}
      />
      {/* Main dashed teal route line */}
      <Layer
        id="route-layer"
        type="line"
        source="route-source"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#006a61",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 18, 8],
          "line-dasharray": [2, 2],
        }}
      />
    </Source>
  );
}
