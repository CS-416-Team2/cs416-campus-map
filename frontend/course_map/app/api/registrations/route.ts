import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  RegistrationInsertSchema,
  PaginationSchema,
} from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { paginationRange, paginatedResponse } from "@/lib/api-helpers";

/**
 * GET /api/registrations
 * List registrations with optional ?event_id= filter.
 * Eager-loads the related event to prevent N+1.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      orderBy: searchParams.get("orderBy") ?? "created_at",
      direction: searchParams.get("direction") ?? undefined,
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    let query = supabase
      .from("registrations")
      .select("*, events(*)", { count: "exact" })
      .order(pagination.orderBy ?? "created_at", {
        ascending: pagination.direction === "asc",
      })
      .range(from, to);

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return withSecurityHeaders(
      paginatedResponse(data ?? [], count, pagination.page, pagination.limit),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * POST /api/registrations
 * Register a student for an event.
 * Increments the event's `registered` counter atomically via an RPC
 * or a two-step update (since we can't do SQL-level increment via PostgREST
 * without an RPC, we read-then-write here for the school project scope).
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const validated = RegistrationInsertSchema.parse(body);

    const supabase = getSupabaseAdmin();

    // Check the event exists and has capacity
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, capacity, registered")
      .eq("id", validated.event_id)
      .single();

    if (eventError || !event) {
      throw new ApiError(404, "Event not found");
    }
    if (event.registered >= event.capacity) {
      throw new ApiError(409, "Event is at full capacity");
    }

    // Insert registration
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        first_name: validated.first_name,
        middle_name: validated.middle_name ?? null,
        last_name: validated.last_name,
        student_id: validated.student_id,
        event_id: validated.event_id,
        status: validated.status,
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation = already registered
      if (error.code === "23505") {
        throw new ApiError(
          409,
          "Student is already registered for this event",
        );
      }
      throw error;
    }

    // Increment registered count
    await supabase
      .from("events")
      .update({ registered: event.registered + 1 })
      .eq("id", validated.event_id);

    return withSecurityHeaders(
      NextResponse.json({ data }, { status: 201 }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
