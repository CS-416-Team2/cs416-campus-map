import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { RouteQueryInsertSchema, PaginationSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { paginationRange, paginatedResponse } from "@/lib/api-helpers";

/**
 * GET /api/route-queries
 * Public — list route queries with optional ?event_id= filter.
 * Eager-loads events to prevent N+1.
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
      .from("route_queries")
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
 * POST /api/route-queries
 * Public — log a route query.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 60, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const validated = RouteQueryInsertSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("route_queries")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ data }, { status: 201 }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
