import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { AuthSignupSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 20, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      defaultAddress,
      defaultCity,
      isAdmin,
    } = AuthSignupSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const resolvedRole = isAdmin ? "admin" : "student";
    const normalizedStudentId = isAdmin ? null : studentId ?? null;
    const normalizedAddress = defaultAddress?.trim() || null;
    const normalizedCity = defaultCity?.trim() || null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: resolvedRole,
        },
      },
    });

    if (error) {
      throw new ApiError(400, error.message);
    }

    let userId = data.user?.id ?? null;

    // Some Supabase auth configurations can return no user object immediately.
    // Resolve by email so role/profile rows are always written.
    if (!userId) {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listError) {
        throw new ApiError(500, listError.message);
      }

      const matchedUser = usersData?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
      );

      userId = matchedUser?.id ?? null;
    }

    if (!userId) {
      throw new ApiError(500, "Unable to resolve newly created user record.");
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      student_id: normalizedStudentId,
      default_address: normalizedAddress,
      default_city: normalizedCity,
    });

    if (profileError) {
      throw new ApiError(400, profileError.message);
    }

    const { error: roleError } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role: resolvedRole,
    });

    if (roleError) {
      throw new ApiError(400, roleError.message);
    }

    return withSecurityHeaders(
      NextResponse.json(
        {
          message: "Sign-up successful. Check your email for confirmation.",
          requiresEmailConfirmation: !data.session,
          user: { id: userId, email: data.user?.email ?? email },
        },
        { status: 201 },
      ),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
