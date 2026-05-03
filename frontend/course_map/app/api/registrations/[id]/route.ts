import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { RegistrationUpdateSchema, UuidParamSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { withSecurityHeaders } from "@/lib/security-headers";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/registrations/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Registration not found");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * PATCH /api/registrations/[id]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);
    const body = await request.json();
    const validated = RegistrationUpdateSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("registrations")
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error || !data)
      throw new ApiError(404, "Registration not found or update failed");

    return withSecurityHeaders(NextResponse.json({ data }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}

/**
 * DELETE /api/registrations/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const limited = rateLimit(request, 30, 60_000);
    if (limited) return withSecurityHeaders(limited);

    const { id } = UuidParamSchema.parse(await params);

    const supabase = getSupabaseAdmin();

    // Get the registration first to decrement event count
    const { data: reg } = await supabase
      .from("registrations")
      .select("event_id")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Decrement registered count on the event
    if (reg) {
      const { data: event } = await supabase
        .from("events")
        .select("registered")
        .eq("id", reg.event_id)
        .single();

      if (event && event.registered > 0) {
        await supabase
          .from("events")
          .update({ registered: event.registered - 1 })
          .eq("id", reg.event_id);
      }
    }

    return withSecurityHeaders(
      NextResponse.json({ message: "Registration deleted" }),
    );
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
