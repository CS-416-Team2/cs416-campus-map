"use client";

import { useState } from "react";
import { Search, Plus, Minus, MapPin } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { MapContainer } from "@/components/map/mapContainer";
import { useEvents } from "@/hooks/use-events";
import { useMapStore } from "@/hooks/use-map-store";
import type { CampusEvent, EventTag } from "@/types";

type FilterValue = "all" | EventTag;

export default function EventsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [activeEvent, setActiveEvent] = useState<CampusEvent | null>(null);

  const { data: events = [], isLoading } = useEvents(filter);
  const { setSelectedDestination } = useMapStore();

  const filtered = search.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase()),
      )
    : events;

  const handleSelect = (event: CampusEvent) => {
    setActiveEvent((prev) => (prev?.id === event.id ? null : event));
    setSelectedDestination(event.coordinates);
  };

  return (
    <div className="flex h-full overflow-hidden bg-surface">
      {/* ── Left panel: event list ────────────────────────────────────── */}
      <section
        className="w-full md:w-[480px] flex flex-col border-r border-outline-variant bg-white z-10 shrink-0"
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
        <div className="flex-1 overflow-y-auto p-lg space-y-card-gap" role="list">
          {isLoading ? (
            <EventListSkeleton />
          ) : filtered.length === 0 ? (
            <p className="text-body-md text-on-surface-variant text-center py-12">
              No events found
            </p>
          ) : (
            filtered.map((event) => (
              <div key={event.id} role="listitem">
                <EventCard
                  event={event}
                  isActive={activeEvent?.id === event.id}
                  onSelect={handleSelect}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Right panel: map ──────────────────────────────────────────── */}
      <section className="flex-1 relative hidden md:block" aria-label="Events map">
        <MapContainer />

        {/* Map controls */}
        <div className="absolute bottom-lg right-lg flex flex-col gap-2 z-20">
          <button
            aria-label="Center on my location"
            className="w-12 h-12 bg-white rounded-xl shadow-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-slate-50 active:scale-95 transition-all"
          >
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </button>
          <div
            className="flex flex-col bg-white rounded-xl shadow-lg border border-outline-variant divide-y divide-outline-variant"
            role="group"
            aria-label="Zoom controls"
          >
            <button
              aria-label="Zoom in"
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              aria-label="Zoom out"
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Map legend */}
        <div className="absolute top-lg right-lg z-20">
          <div className="bg-white/90 backdrop-blur-md p-md rounded-xl shadow-lg border border-outline-variant w-48">
            <h5 className="text-label-md mb-2 text-on-surface">Map Layers</h5>
            <div className="space-y-sm">
              {[
                { label: "Active Events", checked: true },
                { label: "Parking Lots", checked: true },
                { label: "Campus Transit", checked: false },
              ].map(({ label }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={label !== "Campus Transit"}
                    aria-label={label}
                    className="w-4 h-4 rounded border-outline text-secondary focus:ring-secondary accent-secondary"
                  />
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                </label>
              ))}
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
