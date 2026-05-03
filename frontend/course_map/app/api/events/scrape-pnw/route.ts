import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";
import type { TablesInsert } from "@/types";

const PNW_ICS_URL =
  "https://www.pnw.edu/events/?post_type=tribe_events&eventDisplay=list&ical=1";
const FALLBACK_IMAGE =
  "https://www.pnw.edu/wp-content/uploads/2025/09/2025-PNW-Homecoming-Sports-Fest-008-1.jpg";
const DEFAULT_HAMMOND_COORDS: [number, number] = [-87.4760563, 41.5824067];
const PARKING_LOT_CLOSURE_COORDS: [number, number] = [
  -87.47441388593612,
  41.583044484859286,
];
const GABIS_COORDS: [number, number] = [-87.1553346, 41.4477683];

const HAMMOND_BUILDINGS: Array<{
  keys: string[];
  coords: [number, number]; // [lng, lat]
}> = [
  { keys: ["GYTE", "GYTE BUILDING"], coords: [-87.47500252033133, 41.58527240324328] },
  { keys: ["PORTER"], coords: [-87.47311660596326, 41.585187327829075] },
  { keys: ["POWERS"], coords: [-87.4754304680973, 41.586220064425085] },
  { keys: ["CLO", "CLASSROOM OFFICE"], coords: [-87.4754077087987, 41.58691800343157] },
  { keys: ["ANDR", "ANDERSON"], coords: [-87.47535592531581, 41.587676316588066] },
  { keys: ["SULB", "STUDENT UNION LIBRARY"], coords: [-87.47405943905542, 41.58431273705677] },
  { keys: ["NILS", "BIOSCIENCE"], coords: [-87.47410915485779, 41.58350941743952] },
  { keys: ["LAWSHE"], coords: [-87.47542315222317, 41.58297457497565] },
  {
    keys: ["FITNESS", "RECREATION CENTER", "FNRC"],
    coords: [-87.47397215170305, 41.58026357818684],
  },
  { keys: ["POTTER"], coords: [-87.47490121201234, 41.586327312456255] },
];

type IcsEvent = {
  uid: string;
  summary: string;
  description: string;
  url: string;
  location: string;
  categories: string;
  imageUrl: string;
  dtStart: string;
  dtEnd: string;
  geo: [number, number] | null; // [lng, lat]
};

function unfoldIcsLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const unfolded: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
}

function decodeIcs(value: string) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIcsDate(value: string): { date: Date; allDay: boolean } | null {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    return { date: new Date(year, month - 1, day), allDay: true };
  }

  if (/^\d{8}T\d{6}Z$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));
    return { date: new Date(Date.UTC(year, month - 1, day, hour, minute, second)), allDay: false };
  }

  if (/^\d{8}T\d{6}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));
    return { date: new Date(year, month - 1, day, hour, minute, second), allDay: false };
  }

  return null;
}

function parseGeo(raw: string): [number, number] | null {
  const [latRaw, lngRaw] = raw.split(";");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lng, lat];
}

function parseIcsEvents(raw: string): IcsEvent[] {
  const lines = unfoldIcsLines(raw);
  const events: IcsEvent[] = [];
  let current: Partial<IcsEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (
        current?.uid &&
        current.summary &&
        current.dtStart
      ) {
        events.push({
          uid: current.uid,
          summary: current.summary,
          description: current.description ?? current.summary,
          url: current.url ?? "",
          location: current.location ?? "Hammond Campus",
          categories: current.categories ?? "",
          imageUrl: current.imageUrl ?? FALLBACK_IMAGE,
          dtStart: current.dtStart,
          dtEnd: current.dtEnd ?? "",
          geo: current.geo ?? null,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const keyWithParams = line.slice(0, idx);
    const rawValue = line.slice(idx + 1);
    const key = keyWithParams.split(";")[0];
    const value = decodeIcs(rawValue);

    if (key === "UID") current.uid = value;
    else if (key === "SUMMARY") current.summary = value;
    else if (key === "DESCRIPTION") current.description = value;
    else if (key === "URL") current.url = value;
    else if (key === "LOCATION") current.location = value;
    else if (key === "CATEGORIES") current.categories = value;
    else if (key === "ATTACH") current.imageUrl = value;
    else if (key === "DTSTART") current.dtStart = rawValue.trim();
    else if (key === "DTEND") current.dtEnd = rawValue.trim();
    else if (key === "GEO") current.geo = parseGeo(rawValue.trim());
  }

  return events;
}

function toDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTimeString(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function inferCategory(input: IcsEvent): "orange" | "green" | "blue" {
  const haystack = `${input.summary} ${input.categories}`.toLowerCase();
  if (haystack.includes("athletics")) return "green";
  if (haystack.includes("gala") || haystack.includes("festival") || haystack.includes("celebration")) {
    return "orange";
  }
  return "blue";
}

function inferTags(input: IcsEvent): Array<"academic" | "athletics" | "social" | "workshops"> {
  const haystack = `${input.summary} ${input.categories} ${input.description}`.toLowerCase();
  const tags = new Set<"academic" | "athletics" | "social" | "workshops">();
  if (haystack.includes("athletics")) tags.add("athletics");
  if (haystack.includes("camp") || haystack.includes("workshop")) tags.add("workshops");
  if (haystack.includes("academic") || haystack.includes("college") || haystack.includes("student life")) {
    tags.add("academic");
  }
  if (haystack.includes("gala") || haystack.includes("festival") || haystack.includes("community")) {
    tags.add("social");
  }
  if (tags.size === 0) tags.add("social");
  return Array.from(tags);
}

function mapCoordinates(location: string, geo: [number, number] | null): [number, number] {
  const upper = location.toUpperCase();
  const isHammond = upper.includes("HAMMOND");

  if (isHammond) {
    for (const building of HAMMOND_BUILDINGS) {
      if (building.keys.some((k) => upper.includes(k))) {
        return building.coords;
      }
    }
    // Default Hammond point when campus is known but building is not explicit.
    return DEFAULT_HAMMOND_COORDS;
  }

  if (geo) return geo;

  if (upper.includes("HARD ROCK")) {
    return [-87.4002, 41.5661];
  }

  // Last-resort fallback defaults to Hammond center point.
  return DEFAULT_HAMMOND_COORDS;
}

function buildInsert(input: IcsEvent): TablesInsert<"events"> | null {
  const parsedStart = parseIcsDate(input.dtStart);
  if (!parsedStart) return null;

  const parsedEnd = parseIcsDate(input.dtEnd);
  const now = new Date();
  // Skip historical events.
  if (parsedStart.date < new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())) {
    return null;
  }

  const allDay = parsedStart.allDay;
  const geoHaystack =
    `${input.summary} ${input.categories} ${input.location} ${input.description}`.toLowerCase();
  const normalizedLocation =
    geoHaystack.includes("gabis") && input.location.trim().toUpperCase() === "IN"
      ? "Gabis Arboretum, Valparaiso, IN"
      : input.location || "Hammond Campus";
  const coordinates = input.summary.toLowerCase().includes("parking lot closure")
    ? PARKING_LOT_CLOSURE_COORDS
    : geoHaystack.includes("gabis")
      ? GABIS_COORDS
      : mapCoordinates(input.location, input.geo);

  return {
    title: input.summary,
    description: input.description || input.summary,
    date: toDateString(parsedStart.date),
    time: allDay ? "All Day" : toTimeString(parsedStart.date),
    location: normalizedLocation,
    category: inferCategory(input),
    image_url: input.imageUrl || FALLBACK_IMAGE,
    coordinates,
    capacity: 300,
    registered: 0,
    tags: inferTags(input),
    start_at: parsedStart.date.toISOString(),
    end_at: parsedEnd ? parsedEnd.date.toISOString() : null,
    cost_usd: 0,
    source_url: input.url || "https://www.pnw.edu/events/",
    external_event_id: input.uid,
  };
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 5, 60_000);
    if (limited) return withSecurityHeaders(limited);

    if (process.env.NODE_ENV !== "development") {
      const user = await requireAuth(request);
      await requireAdmin(user.id);
    }

    const feedRes = await fetch(PNW_ICS_URL, {
      headers: { "User-Agent": "cs416-campus-map-event-sync" },
      cache: "no-store",
    });
    if (!feedRes.ok) {
      throw new ApiError(502, "Failed to fetch PNW event feed");
    }

    const rawIcs = await feedRes.text();
    const parsedEvents = parseIcsEvents(rawIcs);
    const inserts = parsedEvents.map(buildInsert).filter((e): e is TablesInsert<"events"> => !!e);

    if (inserts.length === 0) {
      return withSecurityHeaders(
        NextResponse.json({ message: "No events parsed from PNW feed", inserted: 0, updated: 0 }),
      );
    }

    const supabase = getSupabaseAdmin();
    const externalIds = inserts
      .map((e) => e.external_event_id)
      .filter((id): id is string => typeof id === "string");

    const { data: existing, error: existingError } = await supabase
      .from("events")
      .select("id, external_event_id")
      .in("external_event_id", externalIds);

    if (existingError) throw existingError;

    const idByExternal = new Map<string, string>();
    for (const row of existing ?? []) {
      if (row.external_event_id) idByExternal.set(row.external_event_id, row.id);
    }

    const toInsert: TablesInsert<"events">[] = [];
    const toUpdate: Array<TablesInsert<"events"> & { id: string }> = [];

    for (const event of inserts) {
      const externalId = event.external_event_id;
      if (externalId && idByExternal.has(externalId)) {
        toUpdate.push({ ...event, id: idByExternal.get(externalId)! });
      } else {
        toInsert.push(event);
      }
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from("events").insert(toInsert);
      if (error) throw error;
    }

    if (toUpdate.length > 0) {
      const { error } = await supabase.from("events").upsert(toUpdate, { onConflict: "id" });
      if (error) throw error;
    }

    return withSecurityHeaders(
      NextResponse.json({
        message: "PNW events synced",
        inserted: toInsert.length,
        updated: toUpdate.length,
        parsed: parsedEvents.length,
      }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
