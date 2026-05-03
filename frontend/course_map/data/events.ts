import type { CampusEvent } from "@/types";

export const CAMPUS_EVENTS: CampusEvent[] = [];

export const SELECTABLE_EVENTS = CAMPUS_EVENTS.map((e) => ({
  value: e.id,
  label: e.title,
}));
