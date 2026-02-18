import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://atlvibesandviews.com",
  "https://www.atlvibesandviews.com",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
].filter(Boolean);

/** Add CORS headers to a NextResponse */
export function withCors(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
