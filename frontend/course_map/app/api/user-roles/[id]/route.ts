import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UserRoleUpdateSchema, UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/user-roles/[id]
 * Admin-only — get a specific user's role.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error || !data) throw new ApiError(404, "User role not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * PATCH /api/user-roles/[id]
 * Admin-only — change a user's role.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const { id } = UuidParamSchema.parse(await params);
    const body = await request.json();
    const validated = UserRoleUpdateSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_roles")
      .update({
        role: validated.role,
        invited_by: validated.invited_by ?? user.id,
      })
      .eq("user_id", id)
      .select()
      .single();

    if (error || !data)
      throw new ApiError(404, "User role not found or update failed");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
