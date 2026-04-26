import { NextRequest, NextResponse } from "next/server";
import { fetchEarthquakes } from "@/lib/usgs";
import type { TimeRange } from "@/types/earthquake";

const VALID_RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

// Only allow same-origin calls — no external sites can use this as a USGS proxy
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "same-origin",
  "Access-Control-Allow-Methods": "GET",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
};

export async function GET(req: NextRequest) {
  // Reject null/missing range before casting to TimeRange
  const rangeParam = req.nextUrl.searchParams.get("range");
  if (!rangeParam || !VALID_RANGES.includes(rangeParam as TimeRange)) {
    return NextResponse.json(
      { error: "Invalid range. Must be one of: 1h, 24h, 7d, 30d" },
      { status: 400 }
    );
  }

  const range = rangeParam as TimeRange;

  try {
    const data = await fetchEarthquakes(range);
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    // Log the error server-side but don't expose internals to the client
    console.error("USGS fetch error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to fetch earthquake data from USGS" },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}
