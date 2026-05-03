"use client";

import { CalendarDays, Clock, MapPin, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CAMPUS_EVENTS } from "@/data/events";
import type { EventCategory } from "@/types";

const categoryBadgeVariant: Record<EventCategory, "orange" | "green" | "blue"> = {
  orange: "orange",
  green: "green",
  blue: "blue",
};

// Simulate that the user is registered for the first two events
const REGISTERED_IDS = new Set(["1", "2"]);

export default function SchedulePage() {
  const registeredEvents = CAMPUS_EVENTS.filter((e) => REGISTERED_IDS.has(e.id));
  const upcomingEvents = CAMPUS_EVENTS.filter((e) => !REGISTERED_IDS.has(e.id)).slice(0, 3);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-container-margin space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-display-lg text-primary">My Schedule</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Track your registered events and upcoming campus activities.
          </p>
        </div>

        {/* Registered events */}
        <section aria-labelledby="registered-heading">
          <h2 id="registered-heading" className="text-headline-md text-on-surface mb-4">
            Registered Events
          </h2>

          {registeredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarDays className="w-10 h-10 text-on-surface-variant mx-auto mb-3" aria-hidden="true" />
                <p className="text-body-md text-on-surface-variant">
                  You have not registered for any events yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" role="list">
              {registeredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden" role="listitem">
                  <div className="flex gap-4 p-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <CheckCircle className="w-5 h-5 text-secondary" aria-label="Registered" />
                      <div className="w-px flex-1 bg-outline-variant" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant={categoryBadgeVariant[event.category]} className="mb-1.5">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </Badge>
                          <h3 className="text-headline-sm text-on-surface leading-tight">
                            {event.title}
                          </h3>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          Confirmed
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-body-sm">
                        <div className="flex-1 bg-surface-container rounded-full h-1.5" aria-hidden="true">
                          <div
                            className="bg-secondary h-1.5 rounded-full"
                            style={{
                              width: `${Math.round((event.registered / event.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-on-surface-variant text-body-sm shrink-0">
                          {event.registered}/{event.capacity} registered
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Suggested upcoming */}
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-headline-md text-on-surface mb-4">
            Suggested for You
          </h2>
          <div className="space-y-3" role="list">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
                role="listitem"
              >
                <div className="flex gap-4 p-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Circle className="w-5 h-5 text-outline" aria-label="Not registered" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-body-md font-semibold text-on-surface leading-tight">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Open
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
