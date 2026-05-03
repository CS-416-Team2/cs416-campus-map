"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParkingSuggestions } from "@/components/events/ParkingSuggestions";
import { cn } from "@/lib/utils";
import type { CampusEvent } from "@/types";

interface EventCardProps {
  event: CampusEvent;
  isActive?: boolean;
  onSelect?: (event: CampusEvent) => void;
  onRegister?: (event: CampusEvent) => void;
  eagerImage?: boolean;
}

export function EventCard({
  event,
  isActive = false,
  onSelect,
  onRegister,
  eagerImage = false,
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [event.id, event.imageUrl]);

  const imageSrc = !event.imageUrl || imageError ? "/placeholder.jpg" : event.imageUrl;

  return (
    <article
      onClick={() => onSelect?.(event)}
      className={cn(
        "flex flex-col bg-white border rounded-xl overflow-hidden transition-all cursor-pointer",
        isActive
          ? "border-2 border-secondary shadow-md ring-2 ring-secondary/10"
          : "border border-outline-variant hover:shadow-lg hover:border-outline",
      )}
      aria-label={event.title}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          isActive ? "h-48" : "h-40",
        )}
      >
        <Image
          src={imageSrc}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
          loading={eagerImage ? "eager" : "lazy"}
          priority={eagerImage}
          onError={() => setImageError(true)}
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wider">
            Event
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-md space-y-md">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-headline-sm text-on-surface">{event.title}</h3>
            <div className="flex items-center gap-1.5 text-secondary text-label-md mt-1">
              <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {event.date} • {event.time}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label={`Bookmark ${event.title}`}
            className="text-secondary hover:text-secondary/80 transition-colors mt-0.5 shrink-0"
          >
            <Bookmark className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{event.location}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRegister?.(event);
            }}
            aria-label={`Register for ${event.title}`}
          >
            Register
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Share ${event.title}`}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Parking suggestions for the active/selected card */}
      {isActive && event.parking.length > 0 && (
        <ParkingSuggestions spots={event.parking} />
      )}
    </article>
  );
}
