"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Filters } from "@/types/earthquake";
import { useEarthquakes } from "@/hooks/useEarthquakes";
import { filterEarthquakes, computeStats, buildDailyCounts } from "@/lib/utils";
import FilterPanel from "@/components/FilterPanel";
import StatsPanel from "@/components/StatsPanel";
import EarthquakeList from "@/components/EarthquakeList";
import MapLegend from "@/components/MapLegend";
import TrendChart from "@/components/TrendChart";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

const EarthquakeMap = dynamic(() => import("@/components/EarthquakeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

const DEFAULT_FILTERS: Filters = {
  timeRange: "24h",
  minMagnitude: 0,
  maxDepth: 700,
  showTsunamiOnly: false,
};

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [colorMode, setColorMode] = useState<"magnitude" | "depth">("magnitude");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { features, metadata, error, isLoading, refresh } = useEarthquakes(filters.timeRange);

  const filteredFeatures = useMemo(
    () => filterEarthquakes(features, filters),
    [features, filters]
  );

  const stats = useMemo(() => computeStats(filteredFeatures), [filteredFeatures]);
  const dailyCounts = useMemo(() => buildDailyCounts(filteredFeatures), [filteredFeatures]);

  const lastUpdated = metadata?.generated ?? null;

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Activity size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">QuakePulse</h1>
            <p className="text-[10px] text-gray-500 leading-tight">Real-Time Earthquake Monitor</p>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-orange-400">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Updating…
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              API error
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live — auto-refreshes every 60s
            </span>
          )}
        </div>

        <div className="ml-auto text-xs text-gray-400">
          Data:{" "}
          <a
            href="https://earthquake.usgs.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            USGS Earthquake Hazards Program
          </a>
        </div>
      </header>

      {/* Filter bar */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        onRefresh={refresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 shrink-0 ${
            sidebarOpen ? "w-80" : "w-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Stats */}
            <div className="shrink-0">
              <StatsPanel stats={stats} />
            </div>

            {/* Trend chart */}
            {dailyCounts.length > 1 && (
              <div className="shrink-0 px-4 pb-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Activity Trend
                </div>
                <TrendChart data={dailyCounts} />
              </div>
            )}

            {/* Earthquake list */}
            <div className="flex-1 overflow-hidden flex flex-col border-t border-gray-800">
              <div className="px-4 py-2 shrink-0">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Events
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <EarthquakeList
                  features={filteredFeatures}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-r-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
          style={{ left: sidebarOpen ? "320px" : "0px" }}
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          <EarthquakeMap
            features={filteredFeatures}
            selectedId={selectedId}
            onSelect={setSelectedId}
            colorMode={colorMode}
          />

          {/* Map overlay: legend */}
          <div className="absolute top-4 right-4 z-[1000]">
            <MapLegend colorMode={colorMode} />
          </div>

          {/* Map overlay: event count */}
          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300">
              <span className="font-semibold text-white">{filteredFeatures.length.toLocaleString()}</span> earthquakes displayed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
