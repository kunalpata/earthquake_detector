import { NextRequest, NextResponse } from "next/server";
import { fetchEarthquakes } from "@/lib/usgs";
import type { TimeRange } from "@/types/earthquake";

const VALID_RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") as TimeRange;

  if (!VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  try {
    const data = await fetchEarthquakes(range);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    console.error("USGS fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch earthquake data" }, { status: 502 });
  }
}
