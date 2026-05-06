"use client";

import { Marker } from "react-map-gl";
import {
  School,
  ParkingSquare,
  Utensils,
  CalendarCheck,
  Building2,
  ShoppingCart,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapMarkerData } from "@/types";

const markerConfig = {
  building: { color: "bg-secondary text-on-secondary", Icon: School },
  event: { color: "bg-[#f59e0b] text-white", Icon: CalendarCheck },
  parking: { color: "bg-[#3b82f6] text-white", Icon: ParkingSquare },
  restaurant: { color: "bg-[#ef4444] text-white", Icon: Utensils },
  bank: { color: "bg-[#6366f1] text-white", Icon: Landmark },
  grocery: { color: "bg-[#10b981] text-white", Icon: ShoppingCart },
} as const;

interface MapMarkerProps {
  marker: MapMarkerData;
  isActive?: boolean;
  onClick?: (marker: MapMarkerData) => void;
  zoom?: number;
}

export function MapMarker({ marker, isActive = false, onClick, zoom = 16 }: MapMarkerProps) {
  const config = markerConfig[marker.type] ?? markerConfig.building;
  const { Icon } = config;

  // Calculate opacity based on zoom (fade out between zoom 7 and 4)
  const opacity = zoom > 7 ? 1 : Math.max(0, (zoom - 4) / 3);

  if (opacity <= 0) return null;

  return (
    <Marker
      longitude={marker.coordinates[0]}
      latitude={marker.coordinates[1]}
      anchor="bottom"
    >
      <button
        className="relative flex flex-col items-center gap-1 group cursor-pointer transition-opacity duration-300"
        style={{ opacity }}
        onClick={() => onClick?.(marker)}
        aria-label={`${marker.name} — ${marker.type}`}
      >
        {/* Pulse ring for active state */}
        {isActive && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: marker.color }}
            aria-hidden="true"
          />
        )}
        <div
          className={cn(
            "w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110",
            config.color,
            isActive && "scale-125",
          )}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <span
          className={cn(
            "bg-surface-container-lowest px-2 py-0.5 rounded shadow-md text-[10px] font-bold uppercase tracking-wider text-on-surface whitespace-nowrap max-w-[220px] truncate transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {marker.name}
        </span>
      </button>
    </Marker>
  );
}
