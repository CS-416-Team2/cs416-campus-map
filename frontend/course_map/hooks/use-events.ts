import { useQuery } from "@tanstack/react-query";
import type { CampusEvent, EventCategory, EventTag, ParkingSpot } from "@/types";

type FilterCategory = "all" | EventTag;

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseEventDate(dateText: string): Date | null {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function applyEventListRules(
  events: CampusEvent[],
  category: FilterCategory,
): CampusEvent[] {
  const today = startOfToday();

  return events
    .filter((event) => category === "all" || event.tags.includes(category))
    .filter((event) => {
      const eventDate = parseEventDate(event.date);
      // Keep undated events visible instead of dropping them.
      if (!eventDate) return true;
      return eventDate >= today;
    })
    .sort((a, b) => {
      const dateA = parseEventDate(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dateB = parseEventDate(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbEvent(raw: any): CampusEvent {
  return {
    id: String(raw.id),
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
        id: String(s.id),
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
  const dbEvents = ((json.data ?? []) as any[])
    .filter((r) => !(r.tags ?? []).includes("pending_review"))
    .map(mapDbEvent);

  return applyEventListRules(dbEvents, category);
}

export function useEvents(category: FilterCategory = "all") {
  return useQuery({
    queryKey: ["events", category],
    queryFn: () => fetchEvents(category),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
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
