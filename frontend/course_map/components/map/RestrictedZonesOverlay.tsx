"use client";

import { Source, Layer } from "react-map-gl";

// Define your restricted parking zones here
const RESTRICTED_ZONES = [
  {
    id: "preferred-permit-parking",
    name: "Preferred Permit Parking",
    // Latitude/Longitude provided by user (converted to [lng, lat] for Mapbox)
    coordinates: [
      [-87.47515926134743, 41.58725679355043],
      [-87.47508377918547, 41.58725194857965],
      [-87.47507975587203, 41.58738084338986],
      [-87.47463048587014, 41.58737683110391],
      [-87.47463048586937, 41.5881622313323],
      [-87.47497850248276, 41.58816122827297],
      [-87.47497716137829, 41.58793453646707],
      [-87.47482226380899, 41.587808651954596],
      [-87.47482628712245, 41.58763311537509],
      [-87.47516129646588, 41.58763020570436],
      [-87.47515926134743, 41.58725679355043], // Close loop
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
      <Layer
        id="restricted-zones-outline"
        type="line"
        paint={{
          "line-color": "#b91c1c",
          "line-width": 2,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
}
