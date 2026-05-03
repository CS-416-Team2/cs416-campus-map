import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UserProfileInsertSchema, PaginationSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import {
  requireAuth,
  paginationRange,
  paginatedResponse,
} from "@/lib/api-helpers";

/**
 * GET /api/user-profiles
 * Authenticated — list profiles (admin can see all, users see their own).
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    // Check if admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    let query = supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .range(from, to);

    // Non-admins can only see their own profile
    if (!roleData || roleData.role !== "admin") {
      query = query.eq("user_id", user.id);
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
 * POST /api/user-profiles
 * Authenticated — create own profile (upsert).
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    const body = await request.json();
    const validated = UserProfileInsertSchema.parse({
      ...body,
      user_id: user.id, // Force to authenticated user
    });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(validated, { onConflict: "user_id" })
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
