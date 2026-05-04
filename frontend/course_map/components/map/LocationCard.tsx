"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Navigation, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CampusEvent, EventCategory } from "@/types";

interface LocationCardProps {
 event: CampusEvent;
 onClose: () => void;
 onNavigate: () => void;
}

const categoryBadgeVariant: Record<EventCategory, "orange" | "green" | "blue"> =
 {
 orange: "orange",
 green: "green",
 blue: "blue",
 };

const categoryLabel: Record<EventCategory, string> = {
 orange: "Event – Orange",
 green: "Event – Green",
 blue: "Event – Blue",
};

export function LocationCard({ event, onClose, onNavigate }: LocationCardProps) {
 const [imageError, setImageError] = useState(false);

 useEffect(() => {
 setImageError(false);
 }, [event.id, event.imageUrl]);

 const imageSrc = !event.imageUrl || imageError ? "/placeholder.jpg" : event.imageUrl;

 return (
 <div
 className="w-80 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-2xl space-y-3"
 role="dialog"
 aria-label={`Location details: ${event.title}`}
 >
 {/* Header */}
 <div className="flex justify-between items-start gap-2">
 <div className="space-y-1">
 <Badge variant={categoryBadgeVariant[event.category]}>
 {categoryLabel[event.category]}
 </Badge>
 <h3 className="text-headline-sm text-on-surface leading-tight">
 {event.title}
 </h3>
 <p className="text-body-sm text-on-surface-variant">
 {event.location} • {event.date}
 </p>
 </div>
 <button
 aria-label="Close location card"
 onClick={onClose}
 className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0 mt-1"
 >
 <X className="w-5 h-5" aria-hidden="true" />
 </button>
 </div>

 {/* Image */}
 <div className="relative w-full h-32 rounded-lg overflow-hidden">
 <Image
 src={imageSrc}
 alt={event.title}
 fill
 className="object-cover"
 sizes="320px"
 onError={() => setImageError(true)}
 />
 </div>

 {/* Actions */}
 <div className="flex gap-2">
 <Button
 className="flex-1 gap-2"
 onClick={onNavigate}
 aria-label={`Navigate to ${event.title}`}
 >
 <Navigation className="w-4 h-4" aria-hidden="true" />
 Navigate
 </Button>
 <Link
 href={`/eventCreator?eventId=${encodeURIComponent(event.id)}`}
 className="flex-1"
 tabIndex={-1}
 >
 <Button
 variant="outline"
 className="w-full gap-2"
 aria-label="Register for event"
 >
 <Ticket className="w-4 h-4" aria-hidden="true" />
 Register
 </Button>
 </Link>
 </div>
 </div>
 );
}
