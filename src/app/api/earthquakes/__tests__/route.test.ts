import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock fetchEarthquakes before importing the route so the route uses the mock
vi.mock("@/lib/usgs", () => ({
  fetchEarthquakes: vi.fn(),
}));

import { GET } from "../route";
import { fetchEarthquakes } from "@/lib/usgs";

const mockFetch = vi.mocked(fetchEarthquakes);

const MOCK_COLLECTION = {
  type: "FeatureCollection",
  metadata: { generated: Date.now(), url: "", title: "", status: 200, api: "2.4.0", count: 1 },
  features: [{ type: "Feature", id: "test1", properties: { mag: 3.5 }, geometry: { type: "Point", coordinates: [0, 0, 10] } }],
};

function makeRequest(range?: string): NextRequest {
  const url = range
    ? `http://localhost:3000/api/earthquakes?range=${encodeURIComponent(range)}`
    : "http://localhost:3000/api/earthquakes";
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/earthquakes", () => {
  describe("input validation", () => {
    it("returns 400 when range param is missing", async () => {
      const res = await GET(makeRequest());
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Invalid range/);
    });

    it("returns 400 for an empty range param", async () => {
      const res = await GET(makeRequest(""));
      expect(res.status).toBe(400);
    });

    it("returns 400 for an unrecognised range value", async () => {
      const res = await GET(makeRequest("2h"));
      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 for path-traversal attempt in range param", async () => {
      const res = await GET(makeRequest("../../../etc/passwd"));
      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 for script-injection attempt in range param", async () => {
      const res = await GET(makeRequest("<script>alert(1)</script>"));
      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it.each(["1h", "24h", "7d", "30d"])("accepts valid range '%s'", async (range) => {
      mockFetch.mockResolvedValueOnce(MOCK_COLLECTION as any);
      const res = await GET(makeRequest(range));
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(range);
    });
  });

  describe("successful responses", () => {
    it("returns the USGS data as JSON with 200", async () => {
      mockFetch.mockResolvedValueOnce(MOCK_COLLECTION as any);
      const res = await GET(makeRequest("24h"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.type).toBe("FeatureCollection");
      expect(body.features).toHaveLength(1);
    });

    it("includes Cache-Control header on success", async () => {
      mockFetch.mockResolvedValueOnce(MOCK_COLLECTION as any);
      const res = await GET(makeRequest("1h"));
      expect(res.headers.get("cache-control")).toMatch(/s-maxage=60/);
    });
  });

  describe("error handling", () => {
    it("returns 502 when fetchEarthquakes throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      const res = await GET(makeRequest("7d"));
      expect(res.status).toBe(502);
    });

    it("returns 502 when fetchEarthquakes times out (AbortError)", async () => {
      const abortErr = new Error("The operation was aborted");
      abortErr.name = "AbortError";
      mockFetch.mockRejectedValueOnce(abortErr);
      const res = await GET(makeRequest("30d"));
      expect(res.status).toBe(502);
    });

    it("error response body does not expose internal error details", async () => {
      mockFetch.mockRejectedValueOnce(new Error("secret internal path /var/data/keys"));
      const res = await GET(makeRequest("24h"));
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain("secret internal path");
      expect(body.error).toBeTruthy();
    });

    it("still returns Cache-Control header on 502 errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("fail"));
      const res = await GET(makeRequest("24h"));
      expect(res.headers.get("cache-control")).toMatch(/s-maxage=60/);
    });
  });
});
