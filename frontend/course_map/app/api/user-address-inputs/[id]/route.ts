import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/user-address-inputs/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_address_inputs")
      .select("*, events(*)")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Address input not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * DELETE /api/user-address-inputs/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("user_address_inputs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return withSecurityHeaders(
      NextResponse.json({ message: "Address input deleted" }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
