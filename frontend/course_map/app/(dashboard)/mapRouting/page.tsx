"use client";

import { useState } from "react";
import {
  X,
  ArrowUpDown,
  Navigation,
  ChevronDown,
  Layers,
  Plus,
  Minus,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer } from "@/components/map/mapContainer";
import { RouteOverlay } from "@/components/map/routeOverlay";
import { useDirections } from "@/hooks/use-directions";
import { useMapStore } from "@/hooks/use-map-store";
import { cn } from "@/lib/utils";

const MOCK_STEPS = [
  {
    instruction: "Head east on Embarcadero Rd toward High St",
    distance: "0.4 mi",
    icon: "turn_right",
  },
  {
    instruction: "Continue straight onto Campus Entrance Dr",
    distance: "1.2 mi",
    icon: "straight",
  },
  {
    instruction: "At the roundabout, take the 2nd exit toward Library Plaza",
    distance: "200 yards",
    icon: "roundabout_right",
  },
];

const stepIconMap: Record<string, string> = {
  turn_right: "↱",
  straight: "↑",
  roundabout_right: "⟳",
  turn_left: "↰",
  merge: "⤵",
};

export default function RoutingPage() {
  const [origin, setOrigin] = useState("240 Embarcadero Rd, Palo Alto");
  const [destination, setDestination] = useState("Main Campus Library, Building 4");
  const [showSteps, setShowSteps] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  const { data: routeData } = useDirections();
  const { setUserLocation, setSelectedDestination } = useMapStore();

  const metrics = routeData?.metrics ?? {
    distanceMiles: "4.2",
    durationMinutes: 12,
    tolls: "$0.00",
  };

  const steps = routeData?.steps ?? MOCK_STEPS.map((s) => ({
    icon: s.icon as "straight" | "turn_right" | "roundabout_right",
    instruction: s.instruction,
    distance: s.distance,
  }));

  const swapLocations = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  const handleStartNavigation = () => {
    // In a real app, geocode origin & destination
    setUserLocation([-122.1697, 37.4275]);
    setSelectedDestination([-122.168, 37.426]);
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Map base layer */}
      <div className="absolute inset-0">
        <MapContainer>
          <RouteOverlay />
        </MapContainer>
      </div>

      {/* Route panel overlay */}
      {panelOpen && (
        <div
          className="absolute top-6 left-6 w-96 max-h-[calc(100%-3rem)] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200 flex flex-col p-6 z-30"
          role="complementary"
          aria-label="Route planning panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-sm text-on-surface">Plan Your Route</h2>
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
            <label htmlFor="route-origin" className="text-label-sm text-outline block">
              Your Location
            </label>
            <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant gap-2">
              <Navigation className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
              <input
                id="route-origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none text-on-surface"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-0.5 relative z-10">
            <button
              onClick={swapLocations}
              aria-label="Swap origin and destination"
              className="bg-white border border-outline-variant p-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            </button>
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <label htmlFor="route-dest" className="text-label-sm text-outline block">
              Destination
            </label>
            <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant gap-2">
              <div className="w-4 h-4 rounded-full bg-error shrink-0" aria-hidden="true" />
              <input
                id="route-dest"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none text-on-surface"
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 my-6" aria-label="Route statistics">
            {[
              { label: "Distance", value: `${metrics.distanceMiles} mi` },
              { label: "Time", value: `${metrics.durationMinutes} min` },
              { label: "Tolls", value: metrics.tolls },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100"
              >
                <p className="text-label-sm text-on-surface-variant uppercase">{label}</p>
                <p className="text-headline-sm text-secondary mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Start navigation */}
          <Button
            className="w-full gap-3 h-12 shadow-lg"
            onClick={handleStartNavigation}
            aria-label="Start navigation"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Start Navigation
          </Button>

          {/* Step-by-step directions */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              className="flex items-center justify-between w-full mb-4"
              onClick={() => setShowSteps((s) => !s)}
              aria-expanded={showSteps}
              aria-controls="directions-list"
            >
              <span className="text-label-md text-on-surface">Step-by-Step Directions</span>
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
                        {stepIconMap[step.icon] ?? "→"}
                      </span>
                      {i < steps.length - 1 && (
                        <div className="w-px flex-1 bg-slate-100 mt-2" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-body-sm text-on-surface">{step.instruction}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {step.distance}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Reopen panel button */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute top-6 left-6 z-30 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-label-md text-on-surface flex items-center gap-2 hover:shadow-xl transition-all"
          aria-label="Open route planning panel"
        >
          <Navigation className="w-4 h-4 text-secondary" aria-hidden="true" />
          Plan Route
        </button>
      )}

      {/* Right-side controls */}
      <div className="absolute right-6 top-6 flex flex-col gap-3 z-30">
        {[
          { Icon: Layers, label: "Toggle layers" },
          { Icon: Plus, label: "Zoom in" },
          { Icon: Minus, label: "Zoom out" },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors active:scale-95"
          >
            <Icon className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Bottom weather & traffic bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
          <Sun className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <span className="text-label-sm">72°F Sunny</span>
        </div>
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          <span className="text-label-sm">Traffic: Light</span>
        </div>
      </div>
    </div>
  );
}
