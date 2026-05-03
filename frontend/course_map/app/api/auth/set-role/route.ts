import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { z } from "zod";

const SetRoleSchema = z.object({
  role: z.enum(["student", "admin"]),
});

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 10, 60_000);
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

    const body = await request.json();
    const { role } = SetRoleSchema.parse(body);

    const { error } = await supabase.rpc("set_user_role", {
      p_user_id: user.id,
      p_role: role,
    });

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ message: `Role set to ${role}` }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
