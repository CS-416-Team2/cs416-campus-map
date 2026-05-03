import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ParkingLotInsertSchema, PaginationSchema } from "@/lib/validators";
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
 * GET /api/parking-lots
 * Public — list parking lots with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { searchParams } = new URL(request.url);
    const campus = searchParams.get("campus");
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      orderBy: searchParams.get("orderBy") ?? "name",
      direction: searchParams.get("direction") ?? "asc",
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    let query = supabase
      .from("parking_lots")
      .select("*", { count: "exact" })
      .order(pagination.orderBy ?? "name", {
        ascending: pagination.direction === "asc",
      })
      .range(from, to);

    if (campus) {
      query = query.eq("campus", campus);
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
 * POST /api/parking-lots
 * Admin-only — create a parking lot.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const body = await request.json();
    const validated = ParkingLotInsertSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("parking_lots")
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
