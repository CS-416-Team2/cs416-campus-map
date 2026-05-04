"use client";

import { useState, useEffect } from "react";
import {
 X,
 ArrowUpDown,
 Navigation,
 ChevronDown,
 Layers,
 Plus,
 Minus,
 Sun,
 LocateFixed,
 Loader2,
 MapPin,
 Car,
 Footprints,
} from "lucide-react";
import { Marker } from "react-map-gl";
import { Button } from "@/components/ui/button";
import { MapContainer } from "@/components/map/mapContainer";
import { RouteOverlay } from "@/components/map/routeOverlay";
import { WeatherWidget } from "@/components/map/WeatherWidget";
import { useDirections } from "@/hooks/use-directions";
import { useEvents } from "@/hooks/use-events";
import { useMapStore } from "@/hooks/use-map-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const STEP_ICONS: Record<string, string> = {
 turn_right: "↱",
 straight: "↑",
 roundabout_right: "⟳",
 turn_left: "↰",
 merge: "⤵",
};

async function geocodeAddress(
 address: string,
): Promise<[number, number] | null> {
 if (!MAPBOX_TOKEN || !address.trim()) return null;
 try {
 const url =
 `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
 `${encodeURIComponent(address)}.json` +
 `?access_token=${MAPBOX_TOKEN}&limit=1`;
 const res = await fetch(url);
 if (!res.ok) return null;
 const data = await res.json();
 if (!data.features?.length) return null;
 const [lng, lat] = data.features[0].center as [number, number];
 return [lng, lat];
 } catch {
 return null;
 }
}

function getGPSLocation(): Promise<[number, number] | null> {
 return new Promise((resolve) => {
 // Fallback campus coordinates for testing when GPS is unavailable
 const FALLBACK_COORDS: [number, number] = [-87.4732, 41.5834];

 if (!navigator.geolocation) {
 console.warn("Geolocation API not available, using fallback.");
 return resolve(FALLBACK_COORDS);
 }
 
 navigator.geolocation.getCurrentPosition(
 ({ coords }) => resolve([coords.longitude, coords.latitude]),
 (err) => {
 console.warn("GPS unavailable or denied, using fallback.", err);
 resolve(FALLBACK_COORDS);
 },
 { timeout: 3_000, maximumAge: 60_000 },
 );
 });
}

function getBearing(start: [number, number], end: [number, number]) {
 if (!start || !end) return 0;
 const toRad = (deg: number) => (deg * Math.PI) / 180;
 const toDeg = (rad: number) => (rad * 180) / Math.PI;

 const lat1 = toRad(start[1]);
 const lat2 = toRad(end[1]);
 const dLng = toRad(end[0] - start[0]);

 const y = Math.sin(dLng) * Math.cos(lat2);
 const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
 let brng = toDeg(Math.atan2(y, x));
 return (brng + 360) % 360;
}

export default function RoutingPage() {
 const { data: routeData, isLoading: isRouteLoading, refetch: refetchRoute } = useDirections();
 const { data: events = [], isLoading: isEventsLoading } = useEvents();
 const {
 setUserLocation,
 setSelectedDestination,
 setSelectedEvent,
 selectedEvent,
 userLocation,
 selectedDestination,
 setViewState,
 transportMode,
 setTransportMode,
 } = useMapStore();
 const { defaultAddress, isLoading: authLoading } = useAuth();

 const [origin, setOrigin] = useState(() =>
 userLocation ? "Current Location" : "",
 );
 const [destination, setDestination] = useState(
 () => selectedEvent?.location ?? "",
 );
 const [showSteps, setShowSteps] = useState(true);
 const [panelOpen, setPanelOpen] = useState(true);
 const [isGeocoding, setIsGeocoding] = useState(false);
 const [isNavigating, setIsNavigating] = useState(false);

 // Set default address if it loads and origin is empty, then geocode it
 useEffect(() => {
 if (!authLoading && defaultAddress && !origin && !userLocation) {
 setOrigin(defaultAddress);
 // Geocode the saved address to set the map location pin
 void geocodeAddress(defaultAddress).then((coords) => {
 if (coords) {
 setUserLocation(coords);
 setViewState({ longitude: coords[0], latitude: coords[1], zoom: 14 });
 }
 });
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [defaultAddress, authLoading]);

 // Active navigation tracking
 useEffect(() => {
 let watchId: number;
 if (isNavigating && origin === "Current Location" && navigator.geolocation) {
 watchId = navigator.geolocation.watchPosition(
 (pos) => {
 const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
 setUserLocation(coords);
 setViewState({
 longitude: coords[0],
 latitude: coords[1],
 zoom: 18,
 pitch: 60,
 ...(pos.coords.heading !== null && !isNaN(pos.coords.heading) && { bearing: pos.coords.heading })
 });
 },
 (err) => console.warn("Navigation tracking error:", err),
 { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
 );
 }
 return () => {
 if (watchId) navigator.geolocation.clearWatch(watchId);
 };
 }, [isNavigating, origin, setUserLocation, setViewState]);

 const hasRoute = !!routeData;
 const metrics = routeData?.metrics;
 const steps = routeData?.steps ?? [];
 const isBusy = isGeocoding || isRouteLoading;

 const swapLocations = () => {
 setIsNavigating(false);
 const tmp = origin;
 setOrigin(destination);
 setDestination(tmp);
 };

 const handleSelectEvent = (event: (typeof events)[number]) => {
 setIsNavigating(false);
 setSelectedEvent(event);
 setSelectedDestination(event.coordinates);
 setDestination(event.location);
 setViewState({
 longitude: event.coordinates[0],
 latitude: event.coordinates[1],
 zoom: 16,
 });
 };

 const handleUseGPS = async () => {
 setIsGeocoding(true);
 try {
 const coords = await getGPSLocation();
 if (coords) {
 setUserLocation(coords);
 setViewState({ longitude: coords[0], latitude: coords[1], zoom: 15 });
 setOrigin("Current Location");
 }
 } finally {
 setIsGeocoding(false);
 }
 };

 const handleStartNavigation = async () => {
 if (!MAPBOX_TOKEN) return;
 setIsGeocoding(true);
 let startCoords = userLocation;

 try {
 // ── Origin ────────────────────────────────────────────────────────────
 if (origin === "Current Location") {
 // Always attempt GPS so we get fresh coords and trigger a queryKey change
 const coords = await getGPSLocation();
 if (coords) {
 setUserLocation(coords);
 startCoords = coords;
 } else if (!userLocation) {
 // GPS unavailable and no cached location — can't navigate
 return;
 }
 } else {
 const coords = await geocodeAddress(origin);
 if (coords) {
 setUserLocation(coords);
 startCoords = coords;
 }
 }

 // ── Destination ───────────────────────────────────────────────────────
 // If the user hasn't changed the destination text from the selected event,
 // skip geocoding and use the precise event coordinates we already have.
 // Geocoding generic names like "Hammond Campus" can return wrong locations.
 if (selectedEvent && destination === selectedEvent.location && selectedDestination) {
 // Keep existing selectedDestination
 } else {
 const destCoords = await geocodeAddress(destination);
 if (destCoords) {
 setSelectedDestination(destCoords);
 } else if (!selectedDestination) {
 // No geocoded result and no pre-selected destination — can't navigate
 return;
 }
 }
 // If destCoords is null but selectedDestination is already set (from an
 // event), we keep it and just refetch with the current store values.
 } finally {
 setIsGeocoding(false);
 }

 // Force a fresh directions fetch even if the store values haven't changed
 // (e.g. user clicked the button a second time with the same origin/dest).
 const result = await refetchRoute();
 const newRouteData = result.data;

 // Transition to navigation view
 if (startCoords) {
 setIsNavigating(true);
 
 let initialBearing = 0;
 if (newRouteData?.geoJson?.geometry?.coordinates?.length) {
 const coordsList = newRouteData.geoJson.geometry.coordinates as [number, number][];
 if (coordsList.length > 1) {
 // Pick a point slightly ahead to get a stable initial bearing
 const nextCoord = coordsList[Math.min(3, coordsList.length - 1)];
 initialBearing = getBearing(startCoords, nextCoord);
 }
 }

 setViewState({
 longitude: startCoords[0],
 latitude: startCoords[1],
 zoom: 18,
 pitch: 60,
 bearing: initialBearing,
 });
 setPanelOpen(false);
 }
 };

 return (
 <div className="relative flex h-full overflow-hidden">
 {/* Map */}
 <div className="absolute inset-0">
 <MapContainer>
 <RouteOverlay />
 {userLocation && (
 <Marker longitude={userLocation[0]} latitude={userLocation[1]} anchor="center">
 <div className="bg-surface-container-lowest p-1 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-[3px] border-white flex items-center justify-center animate-pulse-slow">
 <div className="bg-blue-500 rounded-full p-2 flex items-center justify-center">
 <Navigation className="w-6 h-6 text-white fill-white" style={{ transform: "rotate(-45deg)" }} aria-hidden="true" />
 </div>
 </div>
 </Marker>
 )}
 {selectedDestination && (
 <Marker longitude={selectedDestination[0]} latitude={selectedDestination[1]} anchor="bottom">
 <div className="text-error drop-shadow-md">
 <MapPin className="w-10 h-10 fill-error" aria-hidden="true" />
 </div>
 </Marker>
 )}
 </MapContainer>
 </div>

 {/* Route panel */}
 {panelOpen && (
 <div
 className="absolute top-4 left-4 right-4 w-auto md:top-6 md:left-6 md:right-auto md:w-96 max-h-[calc(100%-2rem)] md:max-h-[calc(100%-3rem)] overflow-y-auto bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant flex flex-col p-4 md:p-6 z-30"
 role="complementary"
 aria-label="Route planning panel"
 >
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-headline-sm text-on-surface">
 Plan Your Route
 </h2>
 <button
 onClick={() => setPanelOpen(false)}
 aria-label="Close route panel"
 className="text-on-surface-variant hover:text-on-surface transition-colors"
 >
 <X className="w-5 h-5" aria-hidden="true" />
 </button>
 </div>

 {/* Origin */}
 <div className="space-y-1">
 <label
 htmlFor="route-origin"
 className="text-label-sm text-outline block"
 >
 Your Location
 </label>
 <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant gap-2">
 <Navigation
 className="w-4 h-4 text-secondary shrink-0"
 aria-hidden="true"
 />
 <input
 id="route-origin"
 type="text"
 value={origin}
 onChange={(e) => {
 setIsNavigating(false);
 setOrigin(e.target.value);
 }}
 placeholder="Enter start address…"
 className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none text-on-surface placeholder:text-on-surface-variant/50"
 />
 <button
 onClick={handleUseGPS}
 disabled={isGeocoding}
 aria-label="Use my current GPS location"
 className="text-on-surface-variant hover:text-secondary transition-colors shrink-0 disabled:opacity-40"
 >
 <LocateFixed className="w-4 h-4" aria-hidden="true" />
 </button>
 </div>
 </div>

 {/* Swap */}
 <div className="flex justify-center -my-0.5 relative z-10">
 <button
 onClick={swapLocations}
 aria-label="Swap origin and destination"
 className="bg-surface-container-lowest border border-outline-variant p-1.5 rounded-full shadow-sm hover:bg-surface-container-low transition-colors"
 >
 <ArrowUpDown
 className="w-4 h-4 text-on-surface-variant"
 aria-hidden="true"
 />
 </button>
 </div>

 {/* Destination */}
 <div className="space-y-1">
 <label
 htmlFor="route-dest"
 className="text-label-sm text-outline block"
 >
 Destination
 </label>
 <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant gap-2">
 <div
 className="w-4 h-4 rounded-full bg-error shrink-0"
 aria-hidden="true"
 />
 <input
 id="route-dest"
 type="text"
 value={destination}
 onChange={(e) => {
 setIsNavigating(false);
 setDestination(e.target.value);
 }}
 placeholder="Enter destination…"
 className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none text-on-surface placeholder:text-on-surface-variant/50"
 />
 </div>
 </div>

 {/* Transport Mode Selector */}
 <div className="flex bg-surface-container-low p-1 rounded-lg mt-4 border border-outline-variant">
 <button
 onClick={() => {
 setIsNavigating(false);
 setTransportMode("driving");
 }}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-label-sm font-medium transition-all",
 transportMode === "driving"
 ? "bg-surface-container-lowest text-secondary shadow-sm ring-1 ring-black/5"
 : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
 )}
 aria-label="Drive"
 >
 <Car className="w-4 h-4" />
 Drive
 </button>
 <button
 onClick={() => {
 setIsNavigating(false);
 setTransportMode("walking");
 }}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-label-sm font-medium transition-all",
 transportMode === "walking"
 ? "bg-surface-container-lowest text-secondary shadow-sm ring-1 ring-black/5"
 : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
 )}
 aria-label="Walk"
 >
 <Footprints className="w-4 h-4" />
 Walk
 </button>
 </div>

 {/* Event explorer */}
 <div className="mt-5">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-label-md text-on-surface">Event Explorer</h3>
 <span className="text-[11px] text-on-surface-variant">
 {events.length} events
 </span>
 </div>
 <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
 {isEventsLoading ? (
 <div className="flex items-center gap-2 text-body-sm text-on-surface-variant p-2">
 <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
 Loading events...
 </div>
 ) : events.length === 0 ? (
 <p className="text-body-sm text-on-surface-variant p-2">
 No events available.
 </p>
 ) : (
 events.map((event) => (
 <button
 key={event.id}
 onClick={() => handleSelectEvent(event)}
 className={cn(
 "w-full text-left rounded-lg border px-3 py-2 transition-colors",
 selectedEvent?.id === event.id
 ? "border-secondary bg-secondary-container"
 : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low",
 )}
 aria-label={`Select ${event.title} as destination`}
 >
 <p className="text-body-sm text-on-surface font-medium truncate">
 {event.title}
 </p>
 <p className="text-[11px] text-on-surface-variant truncate">
 {event.date} • {event.time}
 </p>
 </button>
 ))
 )}
 </div>
 </div>

 {/* Stats */}
 <div
 className="grid grid-cols-3 gap-3 my-6"
 aria-label="Route statistics"
 >
 {[
 {
 label: "Distance",
 value: hasRoute ? `${metrics!.distanceMiles} mi` : "—",
 },
 {
 label: "Time",
 value: hasRoute ? `${metrics!.durationMinutes} min` : "—",
 },
 {
 label: "Tolls",
 value: hasRoute ? metrics!.tolls : "—",
 },
 ].map(({ label, value }) => (
 <div
 key={label}
 className="bg-surface-container-low p-3 rounded-lg text-center border border-outline-variant"
 >
 <p className="text-label-sm text-on-surface-variant uppercase">
 {label}
 </p>
 <p className="text-headline-sm text-secondary mt-1">{value}</p>
 </div>
 ))}
 </div>

 {/* Start Navigation */}
 <div className="flex gap-3">
 <Button
 className="flex-1 gap-3 h-12 shadow-lg"
 onClick={handleStartNavigation}
 disabled={isBusy}
 aria-label="Start navigation"
 >
 {isGeocoding ? (
 <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
 ) : (
 <Navigation className="w-4 h-4" aria-hidden="true" />
 )}
 {isGeocoding ? "Finding route…" : "Start Navigation"}
 </Button>
 <Button
 className="h-12 px-4 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
 onClick={() => {
 const dest = destination || (selectedEvent ? selectedEvent.location : "");
 if (!dest) return;
 const gMapsOrigin = origin === "Current Location" && userLocation ? `${userLocation[1]},${userLocation[0]}` : (origin === "Current Location" ? "My Location" : origin);
 const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(gMapsOrigin)}&destination=${encodeURIComponent(dest)}`;
 window.open(url, "_blank");
 }}
 disabled={isBusy || (!destination && !selectedEvent)}
 aria-label="Open in Google Maps"
 title="Open in Google Maps"
 >
 Google Maps
 </Button>
 </div>

 {/* Step-by-step directions */}
 {steps.length > 0 && (
 <div className="mt-8 border-t border-outline-variant pt-6">
 <button
 className="flex items-center justify-between w-full mb-4"
 onClick={() => setShowSteps((s) => !s)}
 aria-expanded={showSteps}
 aria-controls="directions-list"
 >
 <span className="text-label-md text-on-surface">
 Step-by-Step Directions
 </span>
 <ChevronDown
 className={cn(
 "w-4 h-4 text-on-surface-variant transition-transform",
 showSteps && "rotate-180",
 )}
 aria-hidden="true"
 />
 </button>

 {showSteps && (
 <ol id="directions-list" className="space-y-6">
 {steps.map((step, i) => (
 <li key={i} className="flex gap-4">
 <div className="flex flex-col items-center shrink-0">
 <span
 className="text-secondary text-lg leading-none"
 aria-hidden="true"
 >
 {STEP_ICONS[step.icon] ?? "→"}
 </span>
 {i < steps.length - 1 && (
 <div
 className="w-px flex-1 bg-outline-variant mt-2"
 aria-hidden="true"
 />
 )}
 </div>
 <div className="flex-1 pb-2">
 <p className="text-body-sm text-on-surface">
 {step.instruction}
 </p>
 <p className="text-[11px] text-on-surface-variant mt-1">
 {step.distance}
 </p>
 </div>
 </li>
 ))}
 </ol>
 )}
 </div>
 )}
 </div>
 )}

 {/* Reopen panel */}
 {!panelOpen && (
 <button
 onClick={() => setPanelOpen(true)}
 className="absolute top-4 left-4 md:top-6 md:left-6 z-30 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg px-4 py-3 text-label-md text-on-surface flex items-center gap-2 hover:shadow-xl transition-all"
 aria-label="Open route planning panel"
 >
 <Navigation className="w-4 h-4 text-secondary" aria-hidden="true" />
 Plan Route
 </button>
 )}

 {/* Bottom status bar */}
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-30">
 <WeatherWidget />
 <div className="bg-surface-container-lowest px-4 py-2 rounded-full shadow-lg border border-outline-variant flex items-center gap-2">
 <span
 className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
 aria-hidden="true"
 />
 <span className="text-label-sm">{transportMode === "driving" ? "Traffic: Live" : "Traffic: N/A (Walk)"}</span>
 </div>
 </div>
 </div>
 );
}
