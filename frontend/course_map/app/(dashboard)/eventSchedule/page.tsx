"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Loader2,
  Trash2,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-events";
import type { EventCategory } from "@/types";

interface RegistrationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  coordinates?: number[];
}

interface RegistrationWithEvent {
  id: string;
  event_id: string;
  status: string;
  events: RegistrationEvent | RegistrationEvent[] | null;
}

interface ParkingLot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const categoryBadgeVariant: Record<EventCategory, "orange" | "green" | "blue"> = {
  orange: "orange",
  green: "green",
  blue: "blue",
};

function safeBadgeVariant(cat: string): "orange" | "green" | "blue" {
  return (
    (categoryBadgeVariant as Record<string, "orange" | "green" | "blue">)[cat] ??
    "blue"
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(from: [number, number], to: [number, number]) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to[1] - from[1]);
  const dLng = toRadians(to[0] - from[0]);
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function parseCoordinates(value: unknown): [number, number] | null {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }

  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const lng = Number(candidate.lng ?? candidate.longitude);
    const lat = Number(candidate.lat ?? candidate.latitude);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }

  return null;
}

function googleMapsDirectionsUrl(latitude: number, longitude: number) {
  const destination = encodeURIComponent(`${latitude},${longitude}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export default function SchedulePage() {
  const router = useRouter();
  const { user, role, studentId, isLoading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { data: allEvents = [] } = useEvents();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/eventSchedule");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    if (role === "admin") {
      setRegistrations([]);
      setRegLoading(false);
      return;
    }

    if (!studentId) {
      setRegistrations([]);
      setRegLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("registrations")
      .select(
        "id, event_id, status, events(id, title, date, time, location, category, capacity, registered, coordinates)",
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRegistrations((data as RegistrationWithEvent[]) ?? []);
        setRegLoading(false);
      });
  }, [user, role, studentId]);

  useEffect(() => {
    fetch("/api/parking-lots?limit=100")
      .then((response) => response.json())
      .then((payload) => {
        setParkingLots((payload?.data as ParkingLot[]) ?? []);
      })
      .catch(() => {
        setParkingLots([]);
      });
  }, []);

  const handleRemoveRegistration = async (registrationId: string) => {
    setApiError(null);
    setDeletingRegistrationId(registrationId);

    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? payload?.message ?? "Unable to remove registration.");
      }

      setRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to remove registration.");
    } finally {
      setDeletingRegistrationId(null);
    }
  };

  const registeredEventIds = new Set(registrations.map((r) => r.event_id));
  const suggestedEvents = allEvents.filter((e) => !registeredEventIds.has(e.id)).slice(0, 4);

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-container-margin space-y-8">
        <div>
          <h1 className="text-display-lg text-primary">My Schedule</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Track your registered events and upcoming campus activities.
          </p>
        </div>

        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700">
            {apiError}
          </div>
        )}

        <section aria-labelledby="registered-heading">
          <h2 id="registered-heading" className="text-headline-md text-on-surface mb-4">
            Registered Events
          </h2>

          {regLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            </div>
          ) : registrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarDays
                  className="w-10 h-10 text-on-surface-variant mx-auto mb-3"
                  aria-hidden="true"
                />
                <p className="text-body-md text-on-surface-variant">
                  You have not registered for any events yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" role="list">
              {registrations.map((reg) => {
                const ev = Array.isArray(reg.events) ? reg.events[0] : reg.events;
                if (!ev) return null;

                const CAMPUS_CENTER: [number, number] = [-87.4760563, 41.5824067];
                const matchingEvent = allEvents.find((event) => event.id === reg.event_id);
                const eventCoords =
                  parseCoordinates(ev.coordinates) ??
                  parseCoordinates(matchingEvent?.coordinates) ??
                  CAMPUS_CENTER;

                const nearestParking = parkingLots.length > 0
                  ? parkingLots
                      .map((lot) => ({
                        ...lot,
                        distance: distanceMiles(eventCoords, [lot.longitude, lot.latitude]),
                      }))
                      .sort((a, b) => a.distance - b.distance)
                      .slice(0, 3)
                  : [];

                return (
                  <Card key={reg.id} className="overflow-hidden" role="listitem">
                    <div className="flex gap-4 p-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <CheckCircle className="w-5 h-5 text-secondary" aria-label="Registered" />
                        <div className="w-px flex-1 bg-outline-variant" aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Badge variant={safeBadgeVariant(ev.category)} className="mb-1.5">
                              {ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}
                            </Badge>
                            <h3 className="text-headline-sm text-on-surface leading-tight">{ev.title}</h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary">
                              {reg.status === "registered" ? "Confirmed" : reg.status}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => void handleRemoveRegistration(reg.id)}
                              disabled={deletingRegistrationId === reg.id}
                              className="inline-flex items-center gap-1 rounded-md border border-outline-variant bg-surface px-2 py-1 text-label-sm text-on-surface-variant hover:text-error hover:border-error/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              aria-label={`Remove registration for ${ev.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {deletingRegistrationId === reg.id ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                            {ev.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            {ev.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            {ev.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-body-sm">
                          <div className="flex-1 bg-surface-container rounded-full h-1.5" aria-hidden="true">
                            <div
                              className="bg-secondary h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((ev.registered / ev.capacity) * 100),
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-on-surface-variant text-body-sm shrink-0">
                            {ev.registered}/{ev.capacity} registered
                          </span>
                        </div>

                        {nearestParking.length > 0 && (
                          <div className="pt-3 mt-3 border-t border-outline-variant/50">
                            <h4 className="text-label-sm font-semibold text-on-surface-variant mb-2">
                              Suggested Parking (Top 3)
                            </h4>
                            <p className="text-label-sm text-on-surface-variant mb-2">
                              {ev.title} has parking lots:{" "}
                              {nearestParking.map((lot) => lot.name).join(", ")}.
                            </p>
                            <div className="space-y-2">
                              {nearestParking.map((lot) => (
                                <div
                                  key={lot.id}
                                  className="flex items-start gap-2 bg-surface-container-lowest rounded-lg p-2 border border-outline-variant/30"
                                >
                                  <div className="mt-0.5 p-1 bg-secondary/10 text-secondary rounded-md">
                                    <Car className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-body-sm font-medium text-on-surface truncate">
                                      {lot.name}
                                    </p>
                                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                                      {lot.distance.toFixed(2)} mi away
                                    </p>
                                    <a
                                      href={googleMapsDirectionsUrl(lot.latitude, lot.longitude)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center mt-2 rounded-md border border-outline-variant px-2 py-1 text-label-sm text-on-surface-variant hover:text-secondary hover:border-secondary/50 transition-colors"
                                    >
                                      Open in Google Maps
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>


      </div>
    </div>
  );
}
