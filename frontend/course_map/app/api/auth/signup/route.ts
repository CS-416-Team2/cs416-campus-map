import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { AuthSignupSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: stricter for auth endpoints
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const { email, password, firstName, lastName, studentId, isAdmin } =
      AuthSignupSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const normalizedStudentId = isAdmin ? null : studentId ?? null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: isAdmin ? "admin" : "student",
        },
      },
    });

    if (error) {
      throw new ApiError(400, error.message);
    }

    if (data.user) {
      const resolvedRole = isAdmin ? "admin" : "student";

      const { error: profileError } = await supabase.from("user_profiles").upsert({
        user_id: data.user.id,
        student_id: normalizedStudentId,
        default_address: null,
        default_city: null,
      });

      if (profileError) {
        throw new ApiError(400, profileError.message);
      }

      const { error: roleError } = await supabase.from("user_roles").upsert({
        user_id: data.user.id,
        role: resolvedRole,
      });

      if (roleError) {
        throw new ApiError(400, roleError.message);
      }
    }

    return withSecurityHeaders(
      NextResponse.json(
        {
          message: "Sign-up successful. Check your email for confirmation.",
          requiresEmailConfirmation: !data.session,
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


