import type {
  EarthquakeFeature,
  EarthquakeStats,
  DailyCount,
  Filters,
} from "@/types/earthquake";
import { format, startOfDay } from "date-fns";

export function getMagnitudeColor(mag: number | null): string {
  if (mag === null) return "#94a3b8";
  if (mag < 1) return "#22d3ee";
  if (mag < 2) return "#4ade80";
  if (mag < 3) return "#a3e635";
  if (mag < 4) return "#facc15";
  if (mag < 5) return "#fb923c";
  if (mag < 6) return "#f87171";
  if (mag < 7) return "#e11d48";
  return "#7c3aed";
}

export function getDepthColor(depth: number): string {
  if (depth < 20) return "#ef4444";
  if (depth < 70) return "#f97316";
  if (depth < 150) return "#eab308";
  if (depth < 300) return "#22c55e";
  if (depth < 500) return "#3b82f6";
  return "#8b5cf6";
}

export function getMagnitudeRadius(mag: number | null): number {
  if (mag === null || mag <= 0) return 4;
  // Capped at 40px to prevent M7+ circles from covering the entire viewport.
  // Uses base-1.6 exponential so each unit is visually distinct up to M6-7.
  return Math.min(40, Math.max(4, Math.pow(1.6, mag) * 1.5));
}

export function getMagnitudeLabel(mag: number | null): string {
  if (mag === null) return "Unknown";
  if (mag < 2) return "Micro";
  if (mag < 4) return "Minor";
  if (mag < 5) return "Light";
  if (mag < 6) return "Moderate";
  if (mag < 7) return "Strong";
  if (mag < 8) return "Major";
  return "Great";
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDepth(depth: number): string {
  return `${depth.toFixed(1)} km`;
}

export function getAlertColor(alert: string | null): string {
  switch (alert) {
    case "green": return "#22c55e";
    case "yellow": return "#eab308";
    case "orange": return "#f97316";
    case "red": return "#ef4444";
    default: return "#94a3b8";
  }
}

export function filterEarthquakes(
  features: EarthquakeFeature[],
  filters: Filters
): EarthquakeFeature[] {
  return features.filter((f) => {
    // Guard: skip any feature with missing geometry (malformed USGS data)
    if (!f.geometry?.coordinates) return false;
    const mag = f.properties.mag ?? 0;
    const depth = f.geometry.coordinates[2];
    if (mag < filters.minMagnitude) return false;
    if (depth > filters.maxDepth) return false;
    if (filters.showTsunamiOnly && f.properties.tsunami === 0) return false;
    return true;
  });
}

export function computeStats(features: EarthquakeFeature[]): EarthquakeStats {
  if (features.length === 0) {
    return {
      total: 0,
      maxMagnitude: 0,
      avgMagnitude: 0,
      avgDepth: 0,
      tsunamiCount: 0,
      significantCount: 0,
      alertCounts: {},
    };
  }

  let maxMag = -Infinity;
  let totalMag = 0;
  let magCount = 0; // track separately — null mags must not skew the average
  let totalDepth = 0;
  let tsunamiCount = 0;
  let significantCount = 0;
  const alertCounts: Record<string, number> = {};

  for (const f of features) {
    const mag = f.properties.mag;
    const depth = f.geometry.coordinates[2];

    if (mag !== null) {
      if (mag > maxMag) maxMag = mag;
      totalMag += mag;
      magCount++;
      if (mag >= 5) significantCount++;
    }

    totalDepth += depth;
    if (f.properties.tsunami === 1) tsunamiCount++;
    const alert = f.properties.alert ?? "none";
    alertCounts[alert] = (alertCounts[alert] ?? 0) + 1;
  }

  return {
    total: features.length,
    maxMagnitude: maxMag === -Infinity ? 0 : maxMag,
    avgMagnitude: magCount > 0 ? totalMag / magCount : 0,
    avgDepth: totalDepth / features.length,
    tsunamiCount,
    significantCount,
    alertCounts,
  };
}

export function buildDailyCounts(features: EarthquakeFeature[]): DailyCount[] {
  // Key by ISO date (YYYY-MM-DD) for correct cross-year sorting,
  // but display as "MMM d" in the chart label
  const map = new Map<string, { label: string; count: number; maxMag: number }>();

  for (const f of features) {
    const day = startOfDay(new Date(f.properties.time));
    const isoKey = format(day, "yyyy-MM-dd");
    const label = format(day, "MMM d");
    const mag = f.properties.mag ?? 0;
    const existing = map.get(isoKey) ?? { label, count: 0, maxMag: 0 };
    map.set(isoKey, {
      label,
      count: existing.count + 1,
      maxMag: Math.max(existing.maxMag, mag),
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b)) // ISO strings sort lexicographically = chronologically
    .map(([, { label, count, maxMag }]) => ({ date: label, count, maxMag }));
}

// The 30d feed returns ~12K events. Rendering all of them as DOM nodes will
// freeze the browser. Cap visible markers and list rows at this number,
// keeping the highest-magnitude events (most useful to a user).
export const MAP_MARKER_LIMIT = 3000;

export function limitForDisplay(features: EarthquakeFeature[]): {
  displayed: EarthquakeFeature[];
  capped: boolean;
} {
  if (features.length <= MAP_MARKER_LIMIT) {
    return { displayed: features, capped: false };
  }
  // Keep the most significant events by magnitude
  const sorted = [...features].sort(
    (a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0)
  );
  return { displayed: sorted.slice(0, MAP_MARKER_LIMIT), capped: true };
}
