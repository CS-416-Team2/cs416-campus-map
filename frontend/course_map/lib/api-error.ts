import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Structured API error that carries an HTTP status code.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Centralized error handler — call from the `catch` block
 * of every API route.  Returns a well-formed NextResponse.
 */
export function handleApiError(error: unknown): NextResponse {
  // --- Known application error ---
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode },
    );
  }

  // --- Zod validation error ---
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  // --- Supabase PostgREST error shape ---
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const pgError = error as { code: string; message: string; details?: string };
    return NextResponse.json(
      {
        error: pgError.message,
        code: pgError.code,
        ...(pgError.details ? { details: pgError.details } : {}),
      },
      { status: 400 },
    );
  }

  // --- Unknown / unexpected error ---
  console.error("[API] Unhandled error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}
