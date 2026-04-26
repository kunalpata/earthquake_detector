"use client";

import { useState } from "react";
import type { EarthquakeFeature, SortField, SortDirection } from "@/types/earthquake";
import {
  getMagnitudeColor,
  formatRelativeTime,
  formatDepth,
  getMagnitudeLabel,
} from "@/lib/utils";
import { ArrowUpDown, Waves, AlertTriangle } from "lucide-react";

interface Props {
  features: EarthquakeFeature[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function EarthquakeList({ features, selectedId, onSelect }: Props) {
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const filtered = features.filter((f) =>
    search === "" ||
    (f.properties.place ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (f.properties.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortField) {
      case "magnitude":
        aVal = a.properties.mag ?? -Infinity;
        bVal = b.properties.mag ?? -Infinity;
        break;
      case "depth":
        aVal = a.geometry.coordinates[2];
        bVal = b.geometry.coordinates[2];
        break;
      default:
        aVal = a.properties.time;
        bVal = b.properties.time;
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-sm text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* Sort header */}
      <div className="flex items-center px-3 py-2 border-b border-gray-800 text-xs text-gray-500">
        <span className="w-12 shrink-0">Mag</span>
        <span className="flex-1">Location</span>
        <SortButton label="Mag" field="magnitude" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortButton label="Depth" field="depth" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortButton label="Time" field="time" current={sortField} dir={sortDir} onToggle={toggleSort} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
            No earthquakes match filters
          </div>
        ) : (
          sorted.map((quake) => {
            const [, , depth] = quake.geometry.coordinates;
            const mag = quake.properties.mag;
            const color = getMagnitudeColor(mag);
            const isSelected = quake.id === selectedId;

            return (
              <button
                key={quake.id}
                onClick={() => onSelect(quake.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-800/50 hover:bg-gray-800/60 transition-colors flex items-center gap-2 ${
                  isSelected ? "bg-gray-800" : ""
                }`}
              >
                {/* Magnitude badge */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: `${color}22`,
                    border: `2px solid ${color}`,
                    color,
                  }}
                >
                  {mag?.toFixed(1) ?? "?"}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-medium truncate">
                    {quake.properties.place ?? "Unknown location"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>{getMagnitudeLabel(mag)}</span>
                    <span>·</span>
                    <span>{formatDepth(depth)}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(quake.properties.time)}</span>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {quake.properties.tsunami === 1 && (
                    <Waves size={12} className="text-blue-400" />
                  )}
                  {quake.properties.alert && quake.properties.alert !== "green" && (
                    <AlertTriangle
                      size={12}
                      className={
                        quake.properties.alert === "red"
                          ? "text-red-400"
                          : quake.properties.alert === "orange"
                          ? "text-orange-400"
                          : "text-yellow-400"
                      }
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-800 text-xs text-gray-500">
        {sorted.length.toLocaleString()} of {features.length.toLocaleString()} events
      </div>
    </div>
  );
}

function SortButton({
  label,
  field,
  current,
  dir,
  onToggle,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDirection;
  onToggle: (f: SortField) => void;
}) {
  const active = field === current;
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs transition-colors ${
        active ? "text-orange-400" : "text-gray-600 hover:text-gray-400"
      }`}
    >
      {label}
      <ArrowUpDown size={10} className={active ? "opacity-100" : "opacity-40"} />
    </button>
  );
}
