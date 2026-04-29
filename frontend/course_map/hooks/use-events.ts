import { useQuery } from "@tanstack/react-query";
import { CAMPUS_EVENTS } from "@/data/events";
import type { CampusEvent, EventTag } from "@/types";

type FilterCategory = "all" | EventTag;

async function fetchEvents(category: FilterCategory): Promise<CampusEvent[]> {
  // In production this would call the Supabase API:
  // const { data } = await supabase.from("events").select("*").eq("category", category);
  // return data ?? [];

  if (category === "all") return CAMPUS_EVENTS;
  return CAMPUS_EVENTS.filter((e) =>
    e.tags.includes(category as EventTag),
  );
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
    queryFn: () =>
      CAMPUS_EVENTS.find((e) => e.id === id) ?? null,
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
  });
}
