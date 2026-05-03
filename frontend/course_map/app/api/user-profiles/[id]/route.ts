import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UserProfileUpdateSchema, UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/user-profiles/[id]
 * Users can only view their own profile unless admin.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();

    // Check authorization
    if (user.id !== id) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || roleData.role !== "admin") {
        throw new ApiError(403, "You can only view your own profile");
      }
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Profile not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * PATCH /api/user-profiles/[id]
 * Users can only update their own profile.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    const { id } = UuidParamSchema.parse(await params);

    if (user.id !== id) {
      throw new ApiError(403, "You can only update your own profile");
    }

    const body = await request.json();
    const validated = UserProfileUpdateSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_profiles")
      .update(validated)
      .eq("user_id", id)
      .select()
      .single();

    if (error || !data)
      throw new ApiError(404, "Profile not found or update failed");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
