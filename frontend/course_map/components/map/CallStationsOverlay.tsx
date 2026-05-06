"use client";

import { Source, Layer } from "react-map-gl";
import { useMapStore } from "@/hooks/use-map-store";

const CALL_STATIONS = [
  [-87.47357747686057, 41.58715242440731],
  [-87.47463133360277, 41.58716772060838],
  [-87.47558888222156, 41.5872424496363],
  [-87.47441478767149, 41.585584121519354],
  [-87.47338008430941, 41.58550578145241],
  [-87.4719160616018, 41.58572935258066],
  [-87.4734772936585, 41.58484906343703],
  [-87.47428262690829, 41.58491877959966],
  [-87.47569615825964, 41.584794607718365],
  [-87.47415629581944, 41.58402709035071],
  [-87.47560956699421, 41.58228698021427],
  [-87.47413539618091, 41.582041201201086],
];

export function CallStationsOverlay() {
  const { activeLayers } = useMapStore();

  if (!activeLayers.callStations) return null;

  const features = CALL_STATIONS.map((coords, index) => ({
    type: "Feature",
    properties: {
      id: `call-station-${index}`,
    },
    geometry: {
      type: "Point",
      coordinates: coords,
    },
  }));

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: features as any,
  };

  return (
    <Source id="call-stations-source" type="geojson" data={geojson}>
      <Layer
        id="call-stations-dots"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14, 4,
            18, 10
          ],
          "circle-color": "#facc15", // Yellow-400
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        }}
      />
    </Source>
  );
}
