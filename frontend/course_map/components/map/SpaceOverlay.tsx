"use client";

import { useEffect, useState, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl";
import type { FeatureCollection } from "geojson";

const SATELLITE_ICON_URL = "/satellite_icon.png";
const ISS_ICON_URL = "/iss_icon.png";

export function SpaceOverlay() {
  const { current: map } = useMap();
  const [isLoaded, setIsLoaded] = useState(false);
  const [longOffset, setLongOffset] = useState(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!map) return;

    const loadImages = async () => {
      try {
        const satImg = await new Promise<HTMLImageElement | ImageBitmap | undefined>((resolve, reject) => {
          map.loadImage(SATELLITE_ICON_URL, (err, img) => {
            if (err) reject(err);
            else resolve(img);
          });
        });
        if (satImg && !map.hasImage("satellite-icon")) {
          map.addImage("satellite-icon", satImg);
        }

        const issImg = await new Promise<HTMLImageElement | ImageBitmap | undefined>((resolve, reject) => {
          map.loadImage(ISS_ICON_URL, (err, img) => {
            if (err) reject(err);
            else resolve(img);
          });
        });
        if (issImg && !map.hasImage("iss-icon")) {
          map.addImage("iss-icon", issImg);
        }

        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load space icons", e);
      }
    };

    loadImages();
  }, [map]);

  const animate = (time: number) => {
    setLongOffset((prev) => (prev + 0.05) % 360);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!isLoaded) return null;

  const spaceGeojson: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "iss", label: "ISS - INTERNATIONAL SPACE STATION" },
        geometry: { type: "Point", coordinates: [(longOffset - 100) % 360 - 180, 45] },
      },
      {
        type: "Feature",
        properties: { type: "satellite", label: "Starlink-241" },
        geometry: { type: "Point", coordinates: [(longOffset * 1.2 + 20) % 360 - 180, -30] },
      },
      {
        type: "Feature",
        properties: { type: "satellite", label: "GlobalStar" },
        geometry: { type: "Point", coordinates: [(longOffset * 0.8 - 60) % 360 - 180, 10] },
      },
      {
        type: "Feature",
        properties: { type: "satellite", label: "WeatherSat" },
        geometry: { type: "Point", coordinates: [(longOffset * 0.5 + 150) % 360 - 180, 70] },
      },
    ],
  };

  return (
    <Source id="space-objects-src" type="geojson" data={spaceGeojson}>
      {/* ISS Layer */}
      <Layer
        id="iss-layer"
        type="symbol"
        filter={["==", "type", "iss"]}
        maxzoom={6}
        layout={{
          "icon-image": "iss-icon",
          "icon-size": 0.15,
          "text-field": ["get", "label"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-offset": [0, 2],
          "text-anchor": "top",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0, 0, 0, 0.8)",
          "text-halo-width": 2,
        }}
      />
      {/* Satellite Layer */}
      <Layer
        id="satellite-layer"
        type="symbol"
        filter={["==", "type", "satellite"]}
        maxzoom={5}
        layout={{
          "icon-image": "satellite-icon",
          "icon-size": 0.1,
          "text-field": ["get", "label"],
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-size": 10,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
        }}
        paint={{
          "text-color": "#cbd5e1",
          "text-halo-color": "rgba(0, 0, 0, 0.5)",
          "text-halo-width": 1,
          "icon-opacity": 0.8,
        }}
      />
    </Source>
  );
}
