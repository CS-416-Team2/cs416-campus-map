import { NextRequest, NextResponse } from "next/server";
import { RegistrationSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // In production: insert into Supabase registrations table
    // const { error } = await supabase.from("registrations").insert({ ... });

    return NextResponse.json(
      { success: true, message: "Registration submitted successfully" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
