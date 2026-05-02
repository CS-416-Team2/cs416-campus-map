import { ParkingSquare } from "lucide-react";
import type { ParkingSpot } from "@/types";

interface ParkingSuggestionsProps {
  spots: ParkingSpot[];
}

export function ParkingSuggestions({ spots }: ParkingSuggestionsProps) {
  return (
    <div
      className="bg-secondary-container/30 p-md border-t border-secondary/20"
      aria-label="Nearby parking"
    >
      <h4 className="text-label-md text-on-secondary-container flex items-center gap-2 mb-3">
        <ParkingSquare className="w-4 h-4" aria-hidden="true" />
        Parking Suggestions
      </h4>
      <div className="space-y-sm">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-secondary/10"
          >
            <div>
              <p className="text-label-sm font-bold text-on-surface">
                {spot.name}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {spot.distance} •{" "}
                {spot.spotsLeft > 20
                  ? `${spot.spotsLeft} spots left`
                  : spot.spotsLeft > 5
                    ? `Only ${spot.spotsLeft} spots left`
                    : "Near full"}
              </p>
            </div>
            <span
              className={
                spot.price === "Free"
                  ? "text-secondary font-bold text-label-sm"
                  : "text-on-surface-variant font-bold text-label-sm"
              }
            >
              {spot.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
