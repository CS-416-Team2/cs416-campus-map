import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, 60, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    const supabase = getSupabaseAdmin();

    // Verify user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Fetch role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, created_at")
      .eq("user_id", user.id)
      .single();

    // Fetch profile if exists
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("default_address, default_city")
      .eq("user_id", user.id)
      .single();

    return withSecurityHeaders(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          role: roleData?.role ?? "student",
          roleSince: roleData?.created_at ?? null,
          profile: profileData ?? null,
        },
      }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
