import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { EventInsertSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth } from "@/lib/api-helpers";

/**
 * POST /api/events/propose
 * Any authenticated user — propose a new event.
 * Student proposals are tagged "pending_review" and require admin approval.
 * Admin proposals bypass review and are published immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 10, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);

    const supabase = getSupabaseAdmin();

    // Check role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleData?.role === "admin";

    const body = await request.json();
    const validated = EventInsertSchema.parse(body);

    // Students' proposals are held for review; admins publish directly
    const tags = validated.tags ?? [];
    const finalTags = isAdmin ? tags : [...tags, "pending_review"];

    const { data, error } = await supabase
      .from("events")
      .insert({ ...validated, tags: finalTags })
      .select()
      .single();

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json(
        {
          data,
          pending: !isAdmin,
          message: isAdmin
            ? "Event published."
            : "Event submitted for admin review.",
        },
        { status: 201 },
      ),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
