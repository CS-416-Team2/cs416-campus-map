import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { AuthCredentialsSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: stricter for auth endpoints
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const { email, password } = AuthCredentialsSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new ApiError(400, error.message);
    }

    return withSecurityHeaders(
      NextResponse.json(
        {
          message: "Sign-up successful. Check your email for confirmation.",
          user: data.user
            ? { id: data.user.id, email: data.user.email }
            : null,
        },
        { status: 201 },
      ),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
