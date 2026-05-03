import { useQuery } from "@tanstack/react-query";
import type { CampusEvent, EventCategory, EventTag, ParkingSpot } from "@/types";

type FilterCategory = "all" | EventTag;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbEvent(raw: any): CampusEvent {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    date: raw.date,
    time: raw.time,
    location: raw.location,
    category: (raw.category as EventCategory) ?? "blue",
    imageUrl: raw.image_url,
    coordinates: [raw.coordinates[0], raw.coordinates[1]] as [number, number],
    capacity: raw.capacity,
    registered: raw.registered,
    tags: ((raw.tags ?? []) as string[]).filter(
      (t) => t !== "pending_review",
    ) as EventTag[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parking: ((raw.event_parking_suggestions ?? []) as any[]).map(
      (s): ParkingSpot => ({
        id: s.id,
        name: s.parking_lots?.name ?? "Parking",
        distance:
          s.distance_miles != null ? `${s.distance_miles} mi away` : "Nearby",
        spotsLeft: s.parking_lots?.available_spots ?? 0,
        price:
          s.parking_lots?.hourly_rate_usd != null
            ? `$${Number(s.parking_lots.hourly_rate_usd).toFixed(2)}`
            : "Free",
      }),
    ),
  };
}

async function fetchEvents(category: FilterCategory): Promise<CampusEvent[]> {
  const params = new URLSearchParams({
    orderBy: "date",
    direction: "asc",
    limit: "100",
  });
  if (category !== "all") params.set("tag", category);
  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((json.data ?? []) as any[])
    .filter((r) => !(r.tags ?? []).includes("pending_review"))
    .map(mapDbEvent);
}

export function useEvents(category: FilterCategory = "all") {
  return useQuery({
    queryKey: ["events", category],
    queryFn: () => fetchEvents(category),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) return null;
      const { data } = await res.json();
      return data ? mapDbEvent(data) : null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
  });
}
