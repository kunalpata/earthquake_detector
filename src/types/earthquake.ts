export interface EarthquakeProperties {
  mag: number | null;
  place: string | null;
  time: number;
  updated: number;
  tz: number | null;
  url: string;
  detail: string;
  felt: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: "green" | "yellow" | "orange" | "red" | null;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst: number | null;
  dmin: number | null;
  rms: number | null;
  gap: number | null;
  magType: string | null;
  type: string;
  title: string;
}

export interface EarthquakeGeometry {
  type: "Point";
  coordinates: [number, number, number]; // [longitude, latitude, depth_km]
}

export interface EarthquakeFeature {
  type: "Feature";
  properties: EarthquakeProperties;
  geometry: EarthquakeGeometry;
  id: string;
}

export interface EarthquakeCollection {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: EarthquakeFeature[];
  bbox?: [number, number, number, number, number, number];
}

export type TimeRange = "1h" | "24h" | "7d" | "30d";
export type SortField = "time" | "magnitude" | "depth";
export type SortDirection = "asc" | "desc";

export interface Filters {
  timeRange: TimeRange;
  minMagnitude: number;
  maxDepth: number;
  showTsunamiOnly: boolean;
}

export interface EarthquakeStats {
  total: number;
  maxMagnitude: number;
  avgMagnitude: number;
  avgDepth: number;
  tsunamiCount: number;
  significantCount: number; // M5+
  alertCounts: Record<string, number>;
}

export interface DailyCount {
  date: string;
  count: number;
  maxMag: number;
}
