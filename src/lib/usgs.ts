import type { EarthquakeCollection, TimeRange } from "@/types/earthquake";

const FEED_BASE = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary";

// Pre-built USGS feed URLs — cached by USGS CDN, updated every minute
const FEED_URLS: Record<TimeRange, string> = {
  "1h": `${FEED_BASE}/all_hour.geojson`,
  "24h": `${FEED_BASE}/all_day.geojson`,
  "7d": `${FEED_BASE}/all_week.geojson`,
  "30d": `${FEED_BASE}/all_month.geojson`,
};

// 10 second timeout — USGS feeds are CDN-backed; anything longer is a hang
const FETCH_TIMEOUT_MS = 10_000;

export async function fetchEarthquakes(timeRange: TimeRange): Promise<EarthquakeCollection> {
  const url = FEED_URLS[timeRange];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`USGS returned HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
