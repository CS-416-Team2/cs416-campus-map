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
          "line-width": 10,
          "line-opacity": 0.3,
          "line-blur": 4,
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
          "line-width": 6,
          "line-dasharray": [2, 2],
        }}
      />
    </Source>
  );
}
