import type { EarthquakeCollection, TimeRange } from "@/types/earthquake";

const FEED_BASE = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary";
const QUERY_BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query";

// Pre-built USGS feed URLs for common time ranges (faster, cached by USGS CDN)
const FEED_URLS: Record<TimeRange, string> = {
  "1h": `${FEED_BASE}/all_hour.geojson`,
  "24h": `${FEED_BASE}/all_day.geojson`,
  "7d": `${FEED_BASE}/all_week.geojson`,
  "30d": `${FEED_BASE}/all_month.geojson`,
};

export function getFeedUrl(timeRange: TimeRange): string {
  return FEED_URLS[timeRange];
}

export function getQueryUrl(starttime: string, endtime: string, minmagnitude = 2.5): string {
  const params = new URLSearchParams({
    format: "geojson",
    starttime,
    endtime,
    minmagnitude: String(minmagnitude),
    orderby: "time",
    limit: "20000",
  });
  return `${QUERY_BASE}?${params}`;
}

export async function fetchEarthquakes(timeRange: TimeRange): Promise<EarthquakeCollection> {
  const url = FEED_URLS[timeRange];
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`USGS API error: ${res.status}`);
  return res.json();
}
