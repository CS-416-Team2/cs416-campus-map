import { NextRequest, NextResponse } from "next/server";
import { CAMPUS_EVENTS } from "@/data/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const events =
    category && category !== "all"
      ? CAMPUS_EVENTS.filter((e) => e.tags.includes(category as never))
      : CAMPUS_EVENTS;

  return NextResponse.json({ events, count: events.length });
}
