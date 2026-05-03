import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return withSecurityHeaders(limited);

    // Extract access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    const supabase = getSupabaseAdmin();

    // Verify the token to get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Sign out the user (invalidates their refresh token)
    const { error } = await supabase.auth.admin.signOut(user.id);
    if (error) {
      throw new ApiError(500, "Failed to sign out");
    }

    return withSecurityHeaders(
      NextResponse.json({ message: "Logged out successfully" }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
