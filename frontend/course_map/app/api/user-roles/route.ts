import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PaginationSchema } from "@/lib/validators";
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
 * GET /api/user-roles
 * Admin-only — list all user roles.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const { searchParams } = new URL(request.url);
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const supabase = getSupabaseAdmin();
    const { from, to } = paginationRange(pagination.page, pagination.limit);

    const { data, error, count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return withSecurityHeaders(
      paginatedResponse(data ?? [], count, pagination.page, pagination.limit),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
