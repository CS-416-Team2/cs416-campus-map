import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError } from "@/lib/api-error";

/**
 * Extract and verify the user from the Authorization header.
 * Returns the Supabase user object or throws an ApiError(401).
 */
export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new ApiError(401, "Invalid or expired token");
  }

  return user;
}

/**
 * Require the user to have the "admin" role.
 * Must be called after requireAuth().
 */
export async function requireAdmin(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (!data || data.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
}

/**
 * Apply pagination to a Supabase query builder.
 * Returns { from, to } for .range() calls.
 */
export function paginationRange(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Build a standard paginated list response.
 */
export function paginatedResponse<T>(
  data: T[],
  count: number | null,
  page: number,
  limit: number,
) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? data.length,
      totalPages: count ? Math.ceil(count / limit) : 1,
    },
  });
}
