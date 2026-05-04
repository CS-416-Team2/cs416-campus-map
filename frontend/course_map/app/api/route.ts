import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "PNW Event Map API",
    version: "1.0.0",
  });
}
