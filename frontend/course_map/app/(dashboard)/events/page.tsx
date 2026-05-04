"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { MapContainer } from "@/components/map/mapContainer";
import { MapMarker } from "@/components/map/MapMarker";
import { MapLayerController } from "@/components/map/MapLayerController";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useMapStore } from "@/hooks/use-map-store";
import { WeatherWidget } from "@/components/map/WeatherWidget";
import type { CampusEvent, EventTag, MapMarkerData } from "@/types";

type FilterValue = "all" | EventTag;
const CAMPUS_CENTER: [number, number] = [-87.47357432996594, 41.58392629103461];
const CAMPUS_RADIUS_MILES = 1.5;

function toRadians(value: number) {
 return (value * Math.PI) / 180;
}

function distanceMiles(
 from: [number, number],
 to: [number, number],
): number {
 const earthRadiusMiles = 3958.8;
 const dLat = toRadians(to[1] - from[1]);
 const dLng = toRadians(to[0] - from[0]);
 const lat1 = toRadians(from[1]);
 const lat2 = toRadians(to[1]);

 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos(lat1) *
 Math.cos(lat2) *
 Math.sin(dLng / 2) *
 Math.sin(dLng / 2);

 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 return earthRadiusMiles * c;
}

function isOnCampusEvent(coords: [number, number]) {
 return distanceMiles(coords, CAMPUS_CENTER) <= CAMPUS_RADIUS_MILES;
}

export default function EventsPage() {
 const router = useRouter();
 const { user } = useAuth();
 const [filter, setFilter] = useState<FilterValue>("all");
 const [search, setSearch] = useState("");
 const [activeEvent, setActiveEvent] = useState<CampusEvent | null>(null);
 const [showOffCampusEvents, setShowOffCampusEvents] = useState(true);
 const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

 const { data: events = [], isLoading } = useEvents(filter);
 const {
 activeLayers,
 toggleLayer,
 setSelectedDestination,
 setSelectedEvent,
 setViewState,
 } = useMapStore();

 const filtered = search.trim()
 ? events.filter(
 (e) =>
 e.title.toLowerCase().includes(search.toLowerCase()) ||
 e.location.toLowerCase().includes(search.toLowerCase()),
 )
 : events;

 const eventMarkers: MapMarkerData[] = filtered.map((event) => ({
 id: event.id,
 type: "event",
 name: event.title,
 coordinates: event.coordinates,
 color: "#f59e0b",
 eventId: event.id,
 }));

 const visibleEventMarkers = showOffCampusEvents
 ? eventMarkers
 : eventMarkers.filter((marker) => isOnCampusEvent(marker.coordinates));

 const handleSelect = (event: CampusEvent, fromMarker = false) => {
 setActiveEvent(event);
 setSelectedEvent(event);
 setSelectedDestination(event.coordinates);
 setViewState({
 longitude: event.coordinates[0],
 latitude: event.coordinates[1],
 zoom: 16,
 });

 if (fromMarker) {
 cardRefs.current[event.id]?.scrollIntoView({
 behavior: "smooth",
 block: "center",
 });
 }
 };

 const handleRegister = (event: CampusEvent) => {
 if (!user) {
 router.push("/signup");
 return;
 }
 router.push(`/eventCreator?eventId=${encodeURIComponent(event.id)}`);
 };

 return (
 <div className="flex h-full overflow-hidden bg-surface">
 {/* ── Left panel: event list ────────────────────────────────────── */}
 <section
 className="w-full md:w-[480px] flex flex-col border-r border-outline-variant bg-surface-container-lowest z-10 shrink-0"
 aria-label="Event list"
 >
 {/* Search & filters */}
 <div className="p-lg border-b border-outline-variant space-y-md shadow-sm">
 <div className="relative">
 <Search
 className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4"
 aria-hidden="true"
 />
 <input
 type="search"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search campus events..."
 aria-label="Search events"
 className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none text-body-md placeholder:text-on-surface-variant"
 />
 </div>
 <EventFilters active={filter} onChange={setFilter} />
 </div>

 {/* Event list */}
 <div
 className="flex-1 overflow-y-auto p-lg space-y-card-gap"
 role="list"
 >
 {isLoading ? (
 <EventListSkeleton />
 ) : filtered.length === 0 ? (
 <p className="text-body-md text-on-surface-variant text-center py-12">
 No events found
 </p>
 ) : (
 filtered.map((event, index) => (
 <div
 key={event.id}
 role="listitem"
 ref={(el) => {
 cardRefs.current[event.id] = el;
 }}
 >
 <EventCard
 event={event}
 isActive={activeEvent?.id === event.id}
 onSelect={handleSelect}
 onRegister={handleRegister}
 eagerImage={index === 0}
 />
 </div>
 ))
 )}
 </div>
 </section>

 {/* ── Right panel: map ──────────────────────────────────────────── */}
 <section
 className="flex-1 relative hidden md:block"
 aria-label="Events map"
 >
 <MapContainer>
 <MapLayerController includeLocalAreas={false} />
 {activeLayers.events &&
 visibleEventMarkers.map((marker) => (
 <MapMarker
 key={marker.id}
 marker={marker}
 isActive={activeEvent?.id === marker.eventId}
 onClick={() => {
 const event = filtered.find((e) => e.id === marker.eventId);
 if (event) handleSelect(event, true);
 }}
 />
 ))}
 </MapContainer>
  <WeatherWidget className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30" />

 {/* Map legend */}
 <div className="absolute top-lg right-16 z-20">
 <div className="bg-surface-container-lowest p-md rounded-xl shadow-lg border border-outline-variant w-48">
 <h5 className="text-label-md mb-2 text-on-surface">Map Layers</h5>
 <div className="space-y-sm">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={activeLayers.events}
 onChange={() => toggleLayer("events")}
 aria-label="Active Events"
 className="w-4 h-4 rounded border-outline text-black dark:text-white focus:ring-black dark:focus:ring-white accent-black dark:accent-white"
 />
 <span className="text-label-sm text-on-surface-variant">
 Active Events
 </span>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={activeLayers.parking}
 onChange={() => toggleLayer("parking")}
 aria-label="Parking Lots"
 className="w-4 h-4 rounded border-outline text-black dark:text-white focus:ring-black dark:focus:ring-white accent-black dark:accent-white"
 />
 <span className="text-label-sm text-on-surface-variant">
 Parking Lots
 </span>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={showOffCampusEvents}
 onChange={() => setShowOffCampusEvents((prev) => !prev)}
 aria-label="On / Off Campus"
 className="w-4 h-4 rounded border-outline text-black dark:text-white focus:ring-black dark:focus:ring-white accent-black dark:accent-white"
 />
 <span className="text-label-sm text-on-surface-variant">
 On / Off Campus
 </span>
 </label>
 </div>
 </div>
 </div>
 </section>
 </div>
 );
}

function EventListSkeleton() {
 return (
 <>
 {[1, 2, 3].map((i) => (
 <div
 key={i}
 className="rounded-xl border border-outline-variant overflow-hidden animate-pulse"
 aria-hidden="true"
 >
 <div className="h-40 bg-surface-container-high" />
 <div className="p-4 space-y-3">
 <div className="h-4 bg-surface-container-high rounded w-3/4" />
 <div className="h-3 bg-surface-container-high rounded w-1/2" />
 <div className="h-9 bg-surface-container-high rounded" />
 </div>
 </div>
 ))}
 </>
 );
}
