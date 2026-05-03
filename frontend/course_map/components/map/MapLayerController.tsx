"use client";

import { Layer } from "react-map-gl";
import { useMapStore } from "@/hooks/use-map-store";
import type { MapLayerId } from "@/types";

type PoiLayerId = Extract<MapLayerId, "parking" | "restaurants" | "banks" | "grocery">;

const POI_CONFIG: Record<PoiLayerId, { maki: string[]; color: string }> = {
  parking: {
    maki: ["parking", "parking-garage"],
    color: "#3b82f6",
  },
  restaurants: {
    maki: ["restaurant", "fast-food", "cafe", "bar"],
    color: "#ef4444",
  },
  banks: {
    maki: ["bank", "atm"],
    color: "#6366f1",
  },
  grocery: {
    maki: ["grocery", "convenience"],
    color: "#10b981",
  },
};

export function MapLayerController() {
  const { activeLayers } = useMapStore();

  return (
    <>
      {/* 3D building extrusions — Mapbox Streets composite/building source layer */}
      {activeLayers.buildings && (
        <Layer
          id="campus-buildings-3d"
          type="fill-extrusion"
          source="composite"
          source-layer="building"
          minzoom={14}
          filter={["==", "extrude", "true"]}
          paint={{
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0,
              "#cfd8dc",
              100,
              "#90a4ae",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              16,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              16,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.8,
          }}
        />
      )}

      {/* POI layers — Mapbox Streets composite/poi_label source layer */}
      {(Object.entries(POI_CONFIG) as [PoiLayerId, (typeof POI_CONFIG)[PoiLayerId]][]).flatMap(
        ([layerId, { maki, color }]) =>
          activeLayers[layerId]
            ? [
                <Layer
                  key={`poi-${layerId}-dot`}
                  id={`poi-${layerId}-dot`}
                  type="circle"
                  source="composite"
                  source-layer="poi_label"
                  filter={["match", ["get", "maki"], maki, true, false]}
                  paint={{
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      12,
                      4,
                      16,
                      8,
                    ],
                    "circle-color": color,
                    "circle-stroke-width": 1.5,
                    "circle-stroke-color": "#ffffff",
                  }}
                />,
                <Layer
                  key={`poi-${layerId}-label`}
                  id={`poi-${layerId}-label`}
                  type="symbol"
                  source="composite"
                  source-layer="poi_label"
                  filter={["match", ["get", "maki"], maki, true, false]}
                  layout={{
                    "text-field": ["get", "name"],
                    "text-size": 11,
                    "text-anchor": "top",
                    "text-offset": [0, 1],
                    "text-optional": true,
                    "text-max-width": 8,
                  }}
                  paint={{
                    "text-color": "#1e293b",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 1.5,
                  }}
                />,
              ]
            : [],
      )}
    </>
  );
}
