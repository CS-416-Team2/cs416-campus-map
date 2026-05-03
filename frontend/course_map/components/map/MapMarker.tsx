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
}

export function MapMarker({ marker, isActive = false, onClick }: MapMarkerProps) {
  const config = markerConfig[marker.type] ?? markerConfig.building;
  const { Icon } = config;

  return (
    <Marker
      longitude={marker.coordinates[0]}
      latitude={marker.coordinates[1]}
      anchor="bottom"
    >
      <button
        className="flex flex-col items-center gap-1 group cursor-pointer"
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
        <span className="bg-white px-2 py-0.5 rounded shadow-md text-[10px] font-bold uppercase tracking-wider text-slate-800 whitespace-nowrap">
          {marker.name}
        </span>
      </button>
    </Marker>
  );
}
