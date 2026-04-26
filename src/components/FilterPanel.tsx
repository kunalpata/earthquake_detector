"use client";

import type { Filters, TimeRange } from "@/types/earthquake";
import { RefreshCw } from "lucide-react";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  colorMode: "magnitude" | "depth";
  onColorModeChange: (m: "magnitude" | "depth") => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: number | null;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export default function FilterPanel({
  filters,
  onChange,
  colorMode,
  onColorModeChange,
  onRefresh,
  isLoading,
  lastUpdated,
}: Props) {
  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex flex-wrap items-center gap-4">
      {/* Time Range */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Range</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ ...filters, timeRange: value })}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.timeRange === value
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Magnitude */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide whitespace-nowrap">
          Min M {filters.minMagnitude.toFixed(1)}
        </span>
        <input
          type="range"
          min="0"
          max="9"
          step="0.5"
          value={filters.minMagnitude}
          onChange={(e) => onChange({ ...filters, minMagnitude: parseFloat(e.target.value) })}
          className="w-28 accent-orange-500"
        />
      </div>

      {/* Max Depth */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide whitespace-nowrap">
          Max Depth {filters.maxDepth} km
        </span>
        <input
          type="range"
          min="10"
          max="700"
          step="10"
          value={filters.maxDepth}
          onChange={(e) => onChange({ ...filters, maxDepth: parseInt(e.target.value) })}
          className="w-28 accent-orange-500"
        />
      </div>

      {/* Color Mode */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Color by</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {(["magnitude", "depth"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onColorModeChange(mode)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                colorMode === mode
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Tsunami filter */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showTsunamiOnly}
          onChange={(e) => onChange({ ...filters, showTsunamiOnly: e.target.checked })}
          className="accent-blue-500"
        />
        <span className="text-xs text-gray-300">Tsunami only</span>
      </label>

      {/* Refresh */}
      <div className="ml-auto flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
