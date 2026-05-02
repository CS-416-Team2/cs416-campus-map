import { useQuery } from "@tanstack/react-query";
import { useMapStore } from "@/hooks/use-map-store";
import type { NavigationRoute, RouteStep } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapboxDirectionsResponse {
  routes: Array<{
    geometry: GeoJSON.LineString;
    duration: number;
    distance: number;
    legs: Array<{
      steps: Array<{
        maneuver: { instruction: string; type: string };
        distance: number;
      }>;
    }>;
  }>;
}

function maneuverTypeToIcon(type: string): RouteStep["icon"] {
  switch (type) {
    case "turn":
      return "turn_right";
    case "merge":
      return "merge";
    case "roundabout":
      return "roundabout_right";
    default:
      return "straight";
  }
}

function formatDistance(meters: number): string {
  if (meters < 160) return `${Math.round(meters)} m`;
  return `${(meters * 0.000621371).toFixed(1)} mi`;
}

export function useDirections() {
  const { userLocation, selectedDestination } = useMapStore();

  return useQuery<NavigationRoute | null>({
    queryKey: ["directions", userLocation, selectedDestination],
    queryFn: async () => {
      if (!userLocation || !selectedDestination || !MAPBOX_TOKEN) return null;

      const [startLng, startLat] = userLocation;
      const [endLng, endLat] = selectedDestination;

      const url =
        `https://api.mapbox.com/directions/v5/mapbox/walking/` +
        `${startLng},${startLat};${endLng},${endLat}` +
        `?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch directions");

      const data: MapboxDirectionsResponse = await response.json();
      if (!data.routes || data.routes.length === 0) return null;

      const route = data.routes[0];
      const steps: RouteStep[] =
        route.legs[0]?.steps.slice(0, 5).map((step) => ({
          icon: maneuverTypeToIcon(step.maneuver.type),
          instruction: step.maneuver.instruction,
          distance: formatDistance(step.distance),
        })) ?? [];

      return {
        geoJson: {
          type: "Feature" as const,
          properties: {},
          geometry: route.geometry,
        },
        metrics: {
          distanceMiles: (route.distance * 0.000621371).toFixed(1),
          durationMinutes: Math.ceil(route.duration / 60),
          tolls: "$0.00",
        },
        steps,
      };
    },
    enabled: !!userLocation && !!selectedDestination && !!MAPBOX_TOKEN,
    staleTime: 1000 * 60 * 5,
  });
}
