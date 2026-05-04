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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new ApiError(401, "Invalid or expired token");
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role, created_at")
      .eq("user_id", user.id)
      .single();

    const { data: rawProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const profile = (rawProfile ?? null) as Record<string, unknown> | null;
    const metadataStudentId =
      (user.user_metadata?.student_id as string | undefined) ?? null;
    const profileStudentId =
      (profile?.student_id as string | null | undefined) ??
      (profile?.studentID as string | null | undefined) ??
      null;

    const resolvedStudentId = profileStudentId ?? metadataStudentId;

    // Keep profile table aligned for legacy accounts created before profile student_id existed.
    if (!profile && metadataStudentId) {
      await supabase.from("user_profiles").upsert({
        user_id: user.id,
        student_id: metadataStudentId,
      });
    } else if (profile && !profileStudentId && metadataStudentId) {
      await supabase
        .from("user_profiles")
        .update({ student_id: metadataStudentId })
        .eq("user_id", user.id);
    }

    return withSecurityHeaders(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          role: roleData?.role ?? "student",
          roleSince: roleData?.created_at ?? null,
          profile: {
            default_address: (profile?.default_address as string | null) ?? null,
            default_city: (profile?.default_city as string | null) ?? null,
            student_id: resolvedStudentId,
          },
        },
      }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
