"use client";

import useSWR from "swr";
import type { EarthquakeCollection, TimeRange } from "@/types/earthquake";

const fetcher = (url: string): Promise<EarthquakeCollection> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch: ${r.status}`);
    return r.json();
  });

export function useEarthquakes(timeRange: TimeRange) {
  const { data, error, isLoading, mutate } = useSWR<EarthquakeCollection>(
    `/api/earthquakes?range=${timeRange}`,
    fetcher,
    {
      refreshInterval: 60000, // refresh every 60s
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    data,
    features: data?.features ?? [],
    metadata: data?.metadata,
    error,
    isLoading,
    refresh: mutate,
  };
}
