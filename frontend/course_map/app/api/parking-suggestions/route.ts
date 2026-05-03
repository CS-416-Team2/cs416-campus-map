import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  EventParkingSuggestionInsertSchema,
  PaginationSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import {
  requireAuth,
  requireAdmin,
  paginationRange,
  paginatedResponse,
} from "@/lib/api-helpers";

/**
 * GET /api/parking-suggestions
 * Public — list suggestions with optional ?event_id= filter.
 * Eager-loads parking_lots to prevent N+1.
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
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    let query = supabase
      .from("event_parking_suggestions")
      .select("*, parking_lots(*), events(*)", { count: "exact" })
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
 * POST /api/parking-suggestions
 * Admin-only — link a parking lot to an event.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const body = await request.json();
    const validated = EventParkingSuggestionInsertSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_parking_suggestions")
      .insert(validated)
      .select("*, parking_lots(*)")
      .single();

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ data }, { status: 201 }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
