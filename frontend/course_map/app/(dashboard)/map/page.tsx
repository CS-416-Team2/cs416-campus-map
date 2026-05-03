"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  ParkingSquare,
  ShoppingCart,
  Utensils,
  Landmark,
  MapPin,
  Footprints,
} from "lucide-react";
import { MapContainer } from "@/components/map/mapContainer";
import { LocationCard } from "@/components/map/LocationCard";
import { MapMarker } from "@/components/map/MapMarker";
import { RouteOverlay } from "@/components/map/routeOverlay";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMapStore } from "@/hooks/use-map-store";
import { CAMPUS_EVENTS } from "@/data/events";
import type { MapLayerId, MapMarkerData } from "@/types";

const campusLayers = [
  { id: "buildings" as MapLayerId, label: "Buildings", Icon: Building2, color: "text-secondary" },
  { id: "events" as MapLayerId, label: "Events", Icon: CalendarCheck, color: "text-[#f59e0b]" },
  { id: "parking" as MapLayerId, label: "Parking", Icon: ParkingSquare, color: "text-[#3b82f6]" },
];

const localLayers = [
  { id: "grocery" as MapLayerId, label: "Grocery", Icon: ShoppingCart, color: "text-[#10b981]" },
  { id: "restaurants" as MapLayerId, label: "Restaurants", Icon: Utensils, color: "text-[#ef4444]" },
  { id: "banks" as MapLayerId, label: "Banks", Icon: Landmark, color: "text-[#6366f1]" },
];

const eventMarkers: MapMarkerData[] = CAMPUS_EVENTS.map((e) => ({
  id: e.id,
  type: "event",
  name: e.title,
  coordinates: e.coordinates,
  color: "#f59e0b",
  eventId: e.id,
}));

export default function MapPage() {
  const router = useRouter();
  const {
    activeLayers,
    toggleLayer,
    selectedEvent,
    setSelectedEvent,
    setSelectedDestination,
    setUserLocation,
    setViewState,
  } = useMapStore();

  const handleCenterLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { longitude, latitude } = coords;
        setUserLocation([longitude, latitude]);
        setViewState({ longitude, latitude, zoom: 16 });
      },
      () => {
        // Permission denied or position unavailable — nothing to do
      },
    );
  };

  const handleStartWalking = () => {
    router.push("/mapRouting");
  };

  const handleNavigate = () => {
    if (selectedEvent) {
      setSelectedDestination(selectedEvent.coordinates);
      router.push("/mapRouting");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden" aria-label="Campus map dashboard">
      <MapContainer>
        <RouteOverlay />
        {activeLayers.events &&
          eventMarkers.map((marker) => (
            <MapMarker
              key={marker.id}
              marker={marker}
              isActive={selectedEvent?.id === marker.eventId}
              onClick={() => {
                const event = CAMPUS_EVENTS.find((e) => e.id === marker.eventId);
                if (event) setSelectedEvent(event);
              }}
            />
          ))}
      </MapContainer>

      {/* Floating action buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-30">
        <button
          onClick={handleCenterLocation}
          aria-label="Center on my location"
          className="w-14 h-14 bg-white text-on-surface-variant rounded-full flex items-center justify-center shadow-2xl hover:bg-surface-container-low transition-colors active:scale-90"
        >
          <MapPin className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={handleStartWalking}
          aria-label="Start walking navigation"
          className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-2xl hover:opacity-90 active:scale-90 transition-all"
        >
          <Footprints className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Layer filter panel (desktop) */}
      <div className="absolute top-4 left-4 z-30 hidden lg:block">
        <div
          className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-5 w-60 space-y-6"
          role="group"
          aria-label="Map layer filters"
        >
          <FilterGroup title="Campus Locations" layers={campusLayers} activeLayers={activeLayers} onToggle={toggleLayer} />
          <FilterGroup title="Local Areas" layers={localLayers} activeLayers={activeLayers} onToggle={toggleLayer} />
        </div>
      </div>

      {/* Selected location card */}
      {selectedEvent ? (
        <div className="absolute bottom-8 left-4 z-30">
          <LocationCard
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onNavigate={handleNavigate}
          />
        </div>
      ) : (
        <div className="absolute bottom-8 left-4 z-30">
          <button
            onClick={() => setSelectedEvent(CAMPUS_EVENTS[0])}
            className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 hover:shadow-xl transition-all active:scale-95"
            aria-label="View Annual Tech Innovation Summit event"
          >
            <span className="inline-flex px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wider">
              Event
            </span>
            <div className="text-left">
              <p className="text-label-md text-on-surface">Annual Tech Summit</p>
              <p className="text-body-sm text-on-surface-variant">Main Auditorium • 200m away</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

interface FilterGroupProps {
  title: string;
  layers: { id: MapLayerId; label: string; Icon: React.ElementType; color: string }[];
  activeLayers: Record<MapLayerId, boolean>;
  onToggle: (id: MapLayerId) => void;
}

function FilterGroup({ title, layers, activeLayers, onToggle }: FilterGroupProps) {
  return (
    <div>
      <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="space-y-3">
        {layers.map(({ id, label, Icon, color }) => (
          <div key={id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
              <Label
                htmlFor={`layer-${id}`}
                className="text-body-sm text-on-surface font-medium cursor-pointer"
              >
                {label}
              </Label>
            </div>
            <Checkbox
              id={`layer-${id}`}
              checked={activeLayers[id]}
              onCheckedChange={() => onToggle(id)}
              aria-label={`Toggle ${label} layer`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
