"use client";

import { Source, Layer } from "react-map-gl";
import { useParkingLots } from "@/hooks/use-parking-lots";
import { useMapStore } from "@/hooks/use-map-store";

export function ParkingLotsOverlay() {
  const { data: parkingLots } = useParkingLots();
  const { activeLayers } = useMapStore();

  if (!activeLayers.parking) return null;

  // Convert parking lots with boundary coordinates into a GeoJSON FeatureCollection
  const features = parkingLots
    .filter((lot) => lot.latitude && lot.longitude && lot.lat_2 && lot.lng_2)
    .map((lot) => {
      const start: [number, number] = [lot.longitude, lot.latitude];
      const end: [number, number] = [lot.lng_2!, lot.lat_2!];

      return {
        type: "Feature",
        properties: {
          name: lot.name,
          available: lot.available_spots,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              start, // Top Left
              [end[0], start[1]], // Top Right
              end, // Bottom Right
              [start[0], end[1]], // Bottom Left
              start, // Close loop
            ],
          ],
        },
      };
    });

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: features as any,
  };

  return (
    <Source id="parking-lots-source" type="geojson" data={geojson}>
      <Layer
        id="parking-lots-fill"
        type="fill"
        paint={{
          "fill-color": "#D4AF37", // PNW Gold
          "fill-opacity": 0.25,
        }}
      />
      <Layer
        id="parking-lots-outline"
        type="line"
        paint={{
          "line-color": "#D4AF37",
          "line-width": 2,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
}
