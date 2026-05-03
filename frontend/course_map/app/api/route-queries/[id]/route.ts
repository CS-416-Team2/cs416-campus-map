import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/route-queries/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("route_queries")
      .select("*, events(*)")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Route query not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
