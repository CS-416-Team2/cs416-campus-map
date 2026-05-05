"use client";

import { Source, Layer } from "react-map-gl";

// Define your restricted parking zones here
const RESTRICTED_ZONES = [
  {
    id: "zone-1",
    name: "Faculty Restricted Zone",
    // Example coordinates: [ [lng, lat], [lng, lat], ... ]
    // Must be a closed loop (last point same as first)
    coordinates: [
      [-87.4735, 41.5840],
      [-87.4725, 41.5840],
      [-87.4725, 41.5830],
      [-87.4735, 41.5830],
      [-87.4735, 41.5840],
    ],
  },
];

export function RestrictedZonesOverlay() {
  const features = RESTRICTED_ZONES.map((zone) => ({
    type: "Feature",
    properties: {
      name: zone.name,
    },
    geometry: {
      type: "Polygon",
      coordinates: [zone.coordinates],
    },
  }));

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: features as any,
  };

  return (
    <Source id="restricted-zones-source" type="geojson" data={geojson}>
      <Layer
        id="restricted-zones-fill"
        type="fill"
        paint={{
          "fill-color": "#ef4444", // Red-500
          "fill-opacity": 0.4,
          "fill-outline-color": "#b91c1c", // Red-700
        }}
      />
    </Source>
  );
}
