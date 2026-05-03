import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ParkingLotUpdateSchema, UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/parking-lots/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("parking_lots")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Parking lot not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * PATCH /api/parking-lots/[id]
 * Admin-only.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const user = await requireAuth(request);
    await requireAdmin(user.id);

    const { id } = UuidParamSchema.parse(await params);
    const body = await request.json();
    const validated = ParkingLotUpdateSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("parking_lots")
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error || !data)
      throw new ApiError(404, "Parking lot not found or update failed");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * DELETE /api/parking-lots/[id]
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
      .from("parking_lots")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ message: "Parking lot deleted" }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
