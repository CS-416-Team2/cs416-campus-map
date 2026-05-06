"use client";

import { Layer } from "react-map-gl";
import { useMapStore } from "@/hooks/use-map-store";
import type { MapLayerId } from "@/types";

type PoiLayerId = Extract<MapLayerId, "restaurants" | "banks" | "grocery">;

const POI_CONFIG: Record<PoiLayerId, { maki: string[]; color: string }> = {
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

interface MapLayerControllerProps {
  includeLocalAreas?: boolean;
}

export function MapLayerController({
  includeLocalAreas = true,
}: MapLayerControllerProps) {
  const { activeLayers } = useMapStore();
  const poiEntries = (
    Object.entries(POI_CONFIG) as [PoiLayerId, (typeof POI_CONFIG)[PoiLayerId]][]
  ).filter(() => includeLocalAreas);

  return (
    <>
      {/* Building Labels — Increased size for campus buildings */}
      <Layer
        id="campus-building-labels"
        type="symbol"
        source="composite"
        source-layer="poi_label"
        filter={[
          "all",
          [
            "any",
            ["==", ["get", "class"], "building"],
            ["==", ["get", "maki"], "college"],
            ["==", ["get", "maki"], "university"],
            ["==", ["get", "maki"], "library"],
            ["==", ["get", "maki"], "school"],
            ["==", ["get", "maki"], "science"],
            ["==", ["get", "maki"], "office"]
          ],
          ["!=", ["get", "name"], "Purdue University Northwest"],
          ["!=", ["get", "name"], "Gyte Annex"],
          ["!=", ["get", "name"], "GYTE ANNEX"],
          ["!=", ["get", "name"], "Millard E Gyte Building Annex"]
        ]}
        layout={{
          "text-field": [
            "match",
            ["get", "name"],
            "Edward D Anderson Building", "ANDR",
            "Purdue University Northwest Library", "SULB",
            "Student Union and Library", "SULB",
            "Student Union & Library", "SULB",
            "University Library", "SULB",
            "Library", "SULB",
            "Donald S Powers Computer Education Building", "POWERS",
            "Powers Building", "POWERS",
            "Andrey A Potter Laboratory Building", "POTTER",
            "Potter Building", "POTTER",
            "Gene Stratton Porter Hall", "PORTER",
            "Porter Hall", "PORTER",
            "Porter", "PORTER",
            "Nils K Nelson Bioscience Innovation Building", "NILS",
            "Nils K. Nelson Bioscience Innovation Building", "NILS",
            "Nils K. Nelson", "NILS",
            "NILS K NELSON BIOSCIENCE INNOVATION BUILDING", "NILS",
            "NILS K. NELSON BIOSCIENCE INNOVATION BUILDING", "NILS",
            "C H Lawshe Hall", "LAWSHE",
            "Lawshe Hall", "LAWSHE",
            "Millard E Gyte Building", "GYTE",
            "Gyte Building", "GYTE",
            "Gyte Hall", "GYTE",
            "GYTE", "GYTE",
            "Classroom Office Building", "CLO",
            "Classroom-Office Building", "CLO",
            "CLASSROOM OFFICE BUILDING", "CLO",
            "CLASSROOM-OFFICE BUILDING", "CLO",
            ["get", "name"]
          ],
          "symbol-sort-key": [
            "match",
            ["get", "name"],
            "Edward D Anderson Building", 1,
            "Purdue University Northwest Library", 1,
            "Nils K Nelson Bioscience Innovation Building", 1,
            "Nils K. Nelson Bioscience Innovation Building", 1,
            "Classroom Office Building", 1,
            "Gene Stratton Porter Hall", 1,
            "Millard E Gyte Building", 1,
            "C H Lawshe Hall", 1,
            10
          ],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14, 13,
            16, 18,
            18, 22
          ],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-transform": "uppercase",
          "text-letter-spacing": 0.05,
          "text-max-width": 10,
          "text-allow-overlap": false,
          "text-padding": 20,
        }}
        paint={{
          "text-color": "#334155",
          "text-halo-color": "rgba(255, 255, 255, 0.95)",
          "text-halo-width": 2.5,
          "text-halo-blur": 0.5,
        }}
      />

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
      {poiEntries.flatMap(
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
