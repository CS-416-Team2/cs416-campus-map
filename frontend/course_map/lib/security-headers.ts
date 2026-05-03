import { NextResponse } from "next/server";

/**
 * Helmet-style security headers applied to every API response.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/**
 * Copies security headers onto an existing NextResponse and returns it.
 */
export function withSecurityHeaders<T extends NextResponse>(
  response: T,
): T {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
