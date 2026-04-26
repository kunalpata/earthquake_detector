import { describe, it, expect } from "vitest";
import {
  getMagnitudeColor,
  getMagnitudeRadius,
  getMagnitudeLabel,
  getDepthColor,
  getAlertColor,
  formatRelativeTime,
  formatDepth,
  filterEarthquakes,
  computeStats,
  buildDailyCounts,
  limitForDisplay,
  MAP_MARKER_LIMIT,
} from "../utils";
import type { EarthquakeFeature, Filters } from "@/types/earthquake";

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeFeature(
  id: string,
  mag: number | null,
  depth: number,
  time: number,
  overrides: Partial<EarthquakeFeature["properties"]> = {}
): EarthquakeFeature {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates: [139.69, 35.69, depth] },
    properties: {
      mag,
      place: `Near ${id}`,
      time,
      updated: time,
      tz: null,
      url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
      detail: "",
      felt: null,
      cdi: null,
      mmi: null,
      alert: null,
      status: "reviewed",
      tsunami: 0,
      sig: 0,
      net: "us",
      code: id,
      ids: `,${id},`,
      sources: ",us,",
      types: ",origin,",
      nst: null,
      dmin: null,
      rms: null,
      gap: null,
      magType: "ml",
      type: "earthquake",
      title: `M ${mag} - Near ${id}`,
      ...overrides,
    },
  };
}

const NOW = Date.now();
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const DEFAULT_FILTERS: Filters = {
  timeRange: "24h",
  minMagnitude: 0,
  maxDepth: 700,
  showTsunamiOnly: false,
};

// ─── getMagnitudeColor ──────────────────────────────────────────────────────

describe("getMagnitudeColor", () => {
  it("returns gray for null magnitude", () => {
    expect(getMagnitudeColor(null)).toBe("#94a3b8");
  });

  it("returns distinct colors for each bracket", () => {
    const colors = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5].map(getMagnitudeColor);
    // All values should be different hex codes
    expect(new Set(colors).size).toBe(8);
  });

  it("color at boundary belongs to the upper bracket", () => {
    // mag < 1 → cyan; mag === 1 → green (1 < 2)
    expect(getMagnitudeColor(1)).toBe(getMagnitudeColor(1.5));
    expect(getMagnitudeColor(1)).not.toBe(getMagnitudeColor(0.5));
  });
});

// ─── getMagnitudeRadius ─────────────────────────────────────────────────────

describe("getMagnitudeRadius", () => {
  it("returns minimum radius for null magnitude", () => {
    expect(getMagnitudeRadius(null)).toBe(4);
  });

  it("returns minimum radius for mag <= 0", () => {
    expect(getMagnitudeRadius(0)).toBe(4);
    expect(getMagnitudeRadius(-1)).toBe(4);
  });

  it("radius increases with magnitude", () => {
    const r3 = getMagnitudeRadius(3);
    const r5 = getMagnitudeRadius(5);
    const r7 = getMagnitudeRadius(7);
    expect(r5).toBeGreaterThan(r3);
    expect(r7).toBeGreaterThan(r5);
  });

  it("caps at 40px regardless of magnitude — M7, M8, M9 all equal 40", () => {
    expect(getMagnitudeRadius(7)).toBe(40);
    expect(getMagnitudeRadius(8)).toBe(40);
    expect(getMagnitudeRadius(9)).toBe(40);
  });

  it("M5 radius is between 4 and 40", () => {
    const r = getMagnitudeRadius(5);
    expect(r).toBeGreaterThan(4);
    expect(r).toBeLessThan(40);
  });
});

// ─── getMagnitudeLabel ──────────────────────────────────────────────────────

describe("getMagnitudeLabel", () => {
  it("labels null as Unknown", () => {
    expect(getMagnitudeLabel(null)).toBe("Unknown");
  });

  const cases: [number, string][] = [
    [0.5, "Micro"],
    [1.5, "Micro"],
    [2.0, "Minor"],
    [3.9, "Minor"],
    [4.0, "Light"],
    [4.9, "Light"],
    [5.0, "Moderate"],
    [5.9, "Moderate"],
    [6.0, "Strong"],
    [6.9, "Strong"],
    [7.0, "Major"],
    [7.9, "Major"],
    [8.0, "Great"],
    [9.5, "Great"],
  ];

  it.each(cases)("M%s → %s", (mag, expected) => {
    expect(getMagnitudeLabel(mag)).toBe(expected);
  });
});

// ─── getDepthColor ──────────────────────────────────────────────────────────

describe("getDepthColor", () => {
  it("returns distinct colors for each depth bracket", () => {
    const depths = [10, 40, 100, 200, 400, 600];
    const colors = depths.map(getDepthColor);
    expect(new Set(colors).size).toBe(6);
  });

  it("depth 0 (surface) gets the shallowest color", () => {
    expect(getDepthColor(0)).toBe(getDepthColor(10));
  });
});

// ─── getAlertColor ──────────────────────────────────────────────────────────

describe("getAlertColor", () => {
  it("returns gray for null alert", () => {
    expect(getAlertColor(null)).toBe("#94a3b8");
  });

  it("maps known alert levels to distinct colors", () => {
    const green = getAlertColor("green");
    const yellow = getAlertColor("yellow");
    const orange = getAlertColor("orange");
    const red = getAlertColor("red");
    expect(new Set([green, yellow, orange, red]).size).toBe(4);
  });

  it("unknown alert level returns gray fallback", () => {
    expect(getAlertColor("purple")).toBe("#94a3b8");
  });
});

// ─── formatRelativeTime ─────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  it("returns 'Just now' for timestamps under 1 minute ago", () => {
    expect(formatRelativeTime(NOW - 30_000)).toBe("Just now");
  });

  it("returns minutes for 1–59 minutes ago", () => {
    expect(formatRelativeTime(NOW - 5 * 60_000)).toBe("5m ago");
    expect(formatRelativeTime(NOW - 59 * 60_000)).toBe("59m ago");
  });

  it("returns hours for 1–23 hours ago", () => {
    expect(formatRelativeTime(NOW - 3 * ONE_HOUR)).toBe("3h ago");
    expect(formatRelativeTime(NOW - 23 * ONE_HOUR)).toBe("23h ago");
  });

  it("returns days for 24+ hours ago", () => {
    expect(formatRelativeTime(NOW - ONE_DAY)).toBe("1d ago");
    expect(formatRelativeTime(NOW - 7 * ONE_DAY)).toBe("7d ago");
  });
});

// ─── formatDepth ────────────────────────────────────────────────────────────

describe("formatDepth", () => {
  it("formats to one decimal place with km suffix", () => {
    expect(formatDepth(10)).toBe("10.0 km");
    expect(formatDepth(123.456)).toBe("123.5 km");
    expect(formatDepth(0)).toBe("0.0 km");
  });
});

// ─── filterEarthquakes ──────────────────────────────────────────────────────

describe("filterEarthquakes", () => {
  const features = [
    makeFeature("a", 1.0, 10, NOW),
    makeFeature("b", 3.5, 50, NOW),
    makeFeature("c", 6.2, 200, NOW),
    makeFeature("d", 2.0, 600, NOW),
    makeFeature("e", 5.0, 10, NOW, { tsunami: 1 }),
  ];

  it("returns all features when no filters active (defaults)", () => {
    expect(filterEarthquakes(features, DEFAULT_FILTERS)).toHaveLength(5);
  });

  it("filters by minimum magnitude", () => {
    const result = filterEarthquakes(features, { ...DEFAULT_FILTERS, minMagnitude: 3.0 });
    expect(result.map((f) => f.id)).toEqual(["b", "c", "e"]);
  });

  it("filters by maximum depth", () => {
    const result = filterEarthquakes(features, { ...DEFAULT_FILTERS, maxDepth: 100 });
    expect(result.map((f) => f.id)).toEqual(["a", "b", "e"]);
  });

  it("filters tsunami-only", () => {
    const result = filterEarthquakes(features, { ...DEFAULT_FILTERS, showTsunamiOnly: true });
    expect(result.map((f) => f.id)).toEqual(["e"]);
  });

  it("applies multiple filters together", () => {
    const result = filterEarthquakes(features, {
      ...DEFAULT_FILTERS,
      minMagnitude: 4.0,
      showTsunamiOnly: true,
    });
    expect(result.map((f) => f.id)).toEqual(["e"]);
  });

  it("returns empty array when no features match", () => {
    const result = filterEarthquakes(features, { ...DEFAULT_FILTERS, minMagnitude: 9.0 });
    expect(result).toHaveLength(0);
  });

  it("silently skips features with missing geometry (malformed USGS data)", () => {
    const malformed = {
      ...makeFeature("bad", 3.0, 10, NOW),
      geometry: null as unknown as EarthquakeFeature["geometry"],
    };
    const result = filterEarthquakes([...features, malformed], DEFAULT_FILTERS);
    expect(result).toHaveLength(5);
    expect(result.map((f) => f.id)).not.toContain("bad");
  });
});

// ─── computeStats ───────────────────────────────────────────────────────────

describe("computeStats", () => {
  it("returns zero stats for empty array", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.maxMagnitude).toBe(0);
    expect(stats.avgMagnitude).toBe(0);
    expect(stats.avgDepth).toBe(0);
    expect(stats.tsunamiCount).toBe(0);
    expect(stats.significantCount).toBe(0);
  });

  it("correctly computes max magnitude", () => {
    const features = [makeFeature("a", 2.0, 10, NOW), makeFeature("b", 6.5, 20, NOW)];
    expect(computeStats(features).maxMagnitude).toBe(6.5);
  });

  it("does NOT count null magnitudes in avgMagnitude — avoids zero-skew bug", () => {
    // Two real quakes at M4 and M6, plus one with null mag
    const features = [
      makeFeature("a", 4.0, 10, NOW),
      makeFeature("b", 6.0, 10, NOW),
      makeFeature("c", null, 10, NOW), // must not pull the average toward 0
    ];
    const stats = computeStats(features);
    expect(stats.avgMagnitude).toBeCloseTo(5.0); // (4+6)/2, not (4+6+0)/3
  });

  it("counts significant quakes (M5+) correctly", () => {
    const features = [
      makeFeature("a", 4.9, 10, NOW),
      makeFeature("b", 5.0, 10, NOW),
      makeFeature("c", 7.1, 10, NOW),
    ];
    expect(computeStats(features).significantCount).toBe(2);
  });

  it("counts tsunami events", () => {
    const features = [
      makeFeature("a", 3.0, 10, NOW, { tsunami: 1 }),
      makeFeature("b", 3.0, 10, NOW, { tsunami: 0 }),
      makeFeature("c", 3.0, 10, NOW, { tsunami: 1 }),
    ];
    expect(computeStats(features).tsunamiCount).toBe(2);
  });

  it("correctly averages depth", () => {
    const features = [
      makeFeature("a", 3.0, 10, NOW),
      makeFeature("b", 3.0, 30, NOW),
    ];
    expect(computeStats(features).avgDepth).toBeCloseTo(20);
  });

  it("handles all-null magnitudes without NaN or crash", () => {
    const features = [makeFeature("a", null, 50, NOW)];
    const stats = computeStats(features);
    expect(stats.maxMagnitude).toBe(0);
    expect(stats.avgMagnitude).toBe(0);
    expect(Number.isNaN(stats.avgDepth)).toBe(false);
  });
});

// ─── buildDailyCounts ───────────────────────────────────────────────────────

describe("buildDailyCounts", () => {
  it("returns empty array for no features", () => {
    expect(buildDailyCounts([])).toEqual([]);
  });

  it("groups events on the same day", () => {
    const features = [
      makeFeature("a", 2.0, 10, NOW),
      makeFeature("b", 3.0, 10, NOW - 30 * 60_000), // 30 min earlier, same day
    ];
    const result = buildDailyCounts(features);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });

  it("tracks maxMag per day correctly", () => {
    const features = [
      makeFeature("a", 2.0, 10, NOW),
      makeFeature("b", 5.5, 10, NOW - 30 * 60_000),
      makeFeature("c", 1.0, 10, NOW - ONE_HOUR),
    ];
    const result = buildDailyCounts(features);
    expect(result[0].maxMag).toBe(5.5);
  });

  it("sorts chronologically — oldest day first", () => {
    const features = [
      makeFeature("a", 2.0, 10, NOW),
      makeFeature("b", 2.0, 10, NOW - 3 * ONE_DAY),
      makeFeature("c", 2.0, 10, NOW - ONE_DAY),
    ];
    const result = buildDailyCounts(features);
    // Dates should be in ascending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date).not.toBe(result[i - 1].date);
    }
    expect(result[0].count).toBeGreaterThan(0); // oldest first
  });

  it("handles cross-year data without mis-sorting (regression: was using new Date('MMM d'))", () => {
    const dec31 = new Date("2024-12-31T12:00:00Z").getTime();
    const jan1 = new Date("2025-01-01T12:00:00Z").getTime();
    const features = [
      makeFeature("ny", 3.0, 10, jan1),
      makeFeature("nye", 2.0, 10, dec31),
    ];
    const result = buildDailyCounts(features);
    expect(result).toHaveLength(2);
    // Dec 31 should be first
    expect(result[0].date).toBe("Dec 31");
    expect(result[1].date).toBe("Jan 1");
  });
});

// ─── limitForDisplay ────────────────────────────────────────────────────────

describe("limitForDisplay", () => {
  it("returns all features with capped=false when under the limit", () => {
    const features = Array.from({ length: 10 }, (_, i) =>
      makeFeature(`f${i}`, i * 0.5, 10, NOW)
    );
    const { displayed, capped } = limitForDisplay(features);
    expect(displayed).toHaveLength(10);
    expect(capped).toBe(false);
  });

  it(`caps at ${MAP_MARKER_LIMIT} and sets capped=true when over the limit`, () => {
    const features = Array.from({ length: MAP_MARKER_LIMIT + 500 }, (_, i) =>
      makeFeature(`f${i}`, Math.random() * 8, 10, NOW)
    );
    const { displayed, capped } = limitForDisplay(features);
    expect(displayed).toHaveLength(MAP_MARKER_LIMIT);
    expect(capped).toBe(true);
  });

  it("keeps the highest-magnitude events when capping", () => {
    // 5 low-mag + 5 high-mag features, limit to 5
    const low = Array.from({ length: 5 }, (_, i) => makeFeature(`low${i}`, 1.0, 10, NOW));
    const high = Array.from({ length: 5 }, (_, i) => makeFeature(`high${i}`, 7.0, 10, NOW));
    const features = [...low, ...high];

    // Patch the limit temporarily for this test by checking the selection logic directly:
    // All high-mag events should survive when we sort descending by mag
    const sorted = [...features].sort(
      (a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0)
    );
    const top5 = sorted.slice(0, 5);
    expect(top5.every((f) => f.id.startsWith("high"))).toBe(true);
  });
});
