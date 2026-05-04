import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { handleApiError } from "@/lib/api-error";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input_address, input_type, user_id } = body;

    if (!input_address || !input_type || !user_id) {
      return withSecurityHeaders(NextResponse.json({ message: "Missing required fields" }, { status: 400 }));
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("user_address_inputs")
      .insert({
        input_address,
        input_type,
        user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return withSecurityHeaders(NextResponse.json({ data }, { status: 201 }));
  } catch (error) {
    return withSecurityHeaders(handleApiError(error));
  }
}
