import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  UserAddressInputInsertSchema,
  PaginationSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { paginationRange, paginatedResponse } from "@/lib/api-helpers";

/**
 * GET /api/user-address-inputs
 * Public — list address inputs with optional ?event_id= filter.
 * Eager-loads events to prevent N+1.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");
    const userId = searchParams.get("user_id");
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    let query = supabase
      .from("user_address_inputs")
      .select("*, events(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (eventId) query = query.eq("event_id", eventId);
    if (userId) query = query.eq("user_id", userId);

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
 * POST /api/user-address-inputs
 * Public — log an address input.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 60, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const validated = UserAddressInputInsertSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_address_inputs")
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
