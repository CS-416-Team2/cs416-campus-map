import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/parking-suggestions/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_parking_suggestions")
      .select("*, parking_lots(*), events(*)")
      .eq("id", id)
      .single();

    if (error || !data)
      throw new ApiError(404, "Parking suggestion not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * DELETE /api/parking-suggestions/[id]
 * Admin-only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("event_parking_suggestions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ message: "Parking suggestion deleted" }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
