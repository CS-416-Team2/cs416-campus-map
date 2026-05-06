"use client";

import { Source, Layer } from "react-map-gl";
import { useMapStore } from "@/hooks/use-map-store";

// Define your restricted parking zones here
const RESTRICTED_ZONES = [
  {
    id: "preferred-permit-parking-1",
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
  {
    id: "preferred-permit-parking-2",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47459469936483, 41.586060175799595],
      [-87.47452563248395, 41.58607722836084],
      [-87.47453007061623, 41.586781715903854],
      [-87.4743121411377, 41.586782718984594],
      [-87.47431388691221, 41.587523046467155],
      [-87.47445470288294, 41.587620344110356],
      [-87.47459753051041, 41.587624356381156],
      [-87.47459469936483, 41.586060175799595], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-3",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47600169351136, 41.58594474654244],
      [-87.47597822418292, 41.585559055838516],
      [-87.4755396830169, 41.585559055838516],
      [-87.4755349891512, 41.58590111194899],
      [-87.47559198609174, 41.58594574963619],
      [-87.47600169351136, 41.58594474654244], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-4",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47237963838819, 41.58720767093023],
      [-87.47194847329683, 41.58720967707848],
      [-87.47195048495355, 41.587164538727706],
      [-87.47237360341802, 41.58716303411548],
      [-87.47237963838819, 41.58720767093023], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-5",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47197474736564, 41.587408338788734],
      [-87.47162807185671, 41.58741385567914],
      [-87.4716099669462, 41.58768167506431],
      [-87.47197742957458, 41.587682678131074],
      [-87.47197474736564, 41.587408338788734], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-6",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47586493607344, 41.58362207914862],
      [-87.47563511435776, 41.5836171676099],
      [-87.47563511435776, 41.583221787516656],
      [-87.47586493607344, 41.5832248572472],
      [-87.47586493607344, 41.58362207914862], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-7",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47564706308457, 41.582665140903984],
      [-87.47565335264355, 41.58200795414653],
      [-87.47587989119185, 41.58201593559569],
      [-87.47586694729144, 41.582546282413915],
      [-87.47564706308457, 41.582665140903984], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-8",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47487017544887, 41.582118262988146],
      [-87.47480386570062, 41.582116759956605],
      [-87.47480969456286, 41.58263470852427],
      [-87.47487299023166, 41.58263245399496],
      [-87.47487017544887, 41.582118262988146], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-9",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47471992190643, 41.582932580229944],
      [-87.47458849366707, 41.582933081800206],
      [-87.47458782311483, 41.5830815464311],
      [-87.4747212630109, 41.5830815464311],
      [-87.47471992190643, 41.582932580229944], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-10",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47450132187544, 41.58308305113862],
      [-87.47449931021725, 41.5828834263236],
      [-87.4732480597209, 41.58288894360038],
      [-87.47325074192977, 41.583211452703296],
      [-87.47349817570692, 41.5830820480004],
      [-87.47450132187544, 41.58308305113862], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-11",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.4754073922085, 41.58082040651468],
      [-87.47540672165628, 41.580774762110174],
      [-87.47460809393652, 41.58077325734905],
      [-87.47460876448876, 41.5808178985812],
      [-87.4754073922085, 41.58082040651468], // Close loop
    ],
  },
];

export function RestrictedZonesOverlay() {
  const { activeLayers } = useMapStore();

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

  if (!activeLayers.permittedParking) return null;

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
